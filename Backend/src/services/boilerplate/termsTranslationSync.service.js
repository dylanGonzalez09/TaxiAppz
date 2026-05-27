const crypto = require('crypto');
const { Settings, Language } = require('../../models');
const { translateHtmlWithFallback } = require('../../utils/htmlTranslator.js');
const { resolveTranslationPair } = require('../../utils/translationLangCodes.js');

const ObjectId = require('mongoose').Types.ObjectId;

const CONCURRENCY = Number(process.env.TERMS_TRANSLATE_CONCURRENCY) || 4;
const translationCache = new Map();
const CACHE_MAX = 500;
const lastSyncHashByClient = new Map();
const syncStatusByClient = new Map();
const pendingByClient = new Map();
const runningClients = new Set();

const normalizeClientId = (clientId) => {
  if (!clientId) return null;
  const id = String(clientId);
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
};

const hashContent = (sourceData) =>
  crypto
    .createHash('sha256')
    .update(`${sourceData.terms || ''}|${sourceData.privacy || ''}|${sourceData.acknowledgement || ''}`)
    .digest('hex');

const cacheGet = (key) => translationCache.get(key);
const cacheSet = (key, value) => {
  if (translationCache.size >= CACHE_MAX) {
    translationCache.delete(translationCache.keys().next().value);
  }
  translationCache.set(key, value);
};

const translateFieldCached = async (html, targetAppCode, sourceAppCode) => {
  if (!html || !String(html).trim()) return html;
  if (!resolveTranslationPair(targetAppCode, sourceAppCode)) return null;

  const cacheKey = `${sourceAppCode}:${targetAppCode}:${hashContent({ terms: html, privacy: '', acknowledgement: '' })}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const translated = await translateHtmlWithFallback(html, targetAppCode, sourceAppCode);
  if (translated && translated.trim() !== html.trim()) {
    cacheSet(cacheKey, translated);
    return translated;
  }
  return null;
};

const mapWithConcurrency = async (items, limit, mapper) => {
  if (!items.length) return [];
  const results = new Array(items.length);
  let index = 0;
  const worker = async () => {
    while (index < items.length) {
      const i = index;
      index += 1;
      results[i] = await mapper(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

const bulkUpsertTermsSettings = async (clientIdObj, rows) => {
  const ops = rows
    .filter((row) => row.value != null)
    .map((row) => ({
      updateOne: {
        filter: { name: row.name, clientId: clientIdObj },
        update: { $set: { value: row.value, status: true, type: 'terms', clientId: clientIdObj } },
        upsert: true,
      },
    }));
  if (ops.length) await Settings.bulkWrite(ops, { ordered: false });
};

const resolveEnglishLanguage = async (clientId) => {
  const clientIdObj = normalizeClientId(clientId);
  let english = clientIdObj
    ? await Language.findOne({ status: true, clientId: clientIdObj, code: /^en$/i }).select('_id code').lean()
    : null;
  if (!english) english = await Language.findOne({ status: true, code: /^en$/i }).select('_id code').lean();
  if (!english) english = await Language.findOne({ status: true, name: /^english$/i }).select('_id code').lean();
  return english;
};

const getActiveLanguagesForClient = async (clientId) => {
  const clientIdObj = normalizeClientId(clientId);
  let list = clientIdObj
    ? await Language.find({ status: true, clientId: clientIdObj }).select('_id code').lean()
    : [];
  if (!list.length) list = await Language.find({ status: true }).select('_id code').lean();
  return list;
};

const runTermsTranslationSync = async (clientId, sourceData) => {
  const clientIdStr = String(clientId);
  const clientIdObj = normalizeClientId(clientId);
  if (!clientIdObj || !sourceData) return 0;

  const contentHash = hashContent(sourceData);
  if (lastSyncHashByClient.get(clientIdStr) === contentHash) return 0;

  syncStatusByClient.set(clientIdStr, { status: 'processing', startedAt: new Date().toISOString() });

  try {
    const englishLang = await resolveEnglishLanguage(clientId);
    if (!englishLang || String(sourceData.sourceLangId) !== String(englishLang._id)) {
      syncStatusByClient.set(clientIdStr, { status: 'failed', error: 'Invalid English source' });
      return 0;
    }

    const englishId = String(englishLang._id);
    const others = (await getActiveLanguagesForClient(clientId)).filter((l) => String(l._id) !== englishId);
    if (!others.length) {
      lastSyncHashByClient.set(clientIdStr, contentHash);
      syncStatusByClient.set(clientIdStr, { status: 'completed', languagesUpdated: 0 });
      return 0;
    }

    const batches = await mapWithConcurrency(others, CONCURRENCY, async (lang) => {
      if (!resolveTranslationPair(lang.code, englishLang.code)) return null;

      const langId = String(lang._id);
      const [translatedTerms, translatedPrivacy, translatedAck] = await Promise.all([
        sourceData.terms?.trim()
          ? translateFieldCached(sourceData.terms, lang.code, englishLang.code)
          : Promise.resolve(sourceData.terms),
        sourceData.privacy?.trim()
          ? translateFieldCached(sourceData.privacy, lang.code, englishLang.code)
          : Promise.resolve(sourceData.privacy),
        sourceData.acknowledgement?.trim()
          ? translateFieldCached(sourceData.acknowledgement, lang.code, englishLang.code)
          : Promise.resolve(sourceData.acknowledgement),
      ]);

      if (sourceData.terms?.trim() && !translatedTerms) return null;

      return [
        { name: `termsCondition_${langId}`, value: translatedTerms ?? sourceData.terms },
        { name: `privacyPolicy_${langId}`, value: translatedPrivacy ?? sourceData.privacy },
        { name: `acknowledgement_${langId}`, value: translatedAck ?? sourceData.acknowledgement },
      ];
    });

    const allRows = batches.filter(Boolean).flat();
    await bulkUpsertTermsSettings(clientIdObj, allRows);

    const languagesUpdated = batches.filter(Boolean).length;
    lastSyncHashByClient.set(clientIdStr, contentHash);
    syncStatusByClient.set(clientIdStr, {
      status: 'completed',
      languagesUpdated,
      completedAt: new Date().toISOString(),
    });
    return languagesUpdated;
  } catch (err) {
    syncStatusByClient.set(clientIdStr, { status: 'failed', error: err.message });
    return 0;
  }
};

const processClientQueue = async (clientIdStr) => {
  const job = pendingByClient.get(clientIdStr);
  pendingByClient.delete(clientIdStr);
  if (!job?.sourceData) {
    runningClients.delete(clientIdStr);
    return;
  }
  await runTermsTranslationSync(clientIdStr, job.sourceData);
  runningClients.delete(clientIdStr);
  if (pendingByClient.has(clientIdStr)) {
    runningClients.add(clientIdStr);
    setImmediate(() => processClientQueue(clientIdStr));
  }
};

const queueTermsTranslationSync = (clientId, sourceData) => {
  if (!clientId || !sourceData?.sourceLangId) return false;
  const clientIdStr = String(clientId);
  if (lastSyncHashByClient.get(clientIdStr) === hashContent(sourceData)) return false;

  pendingByClient.set(clientIdStr, { sourceData });
  syncStatusByClient.set(clientIdStr, { status: 'queued', queuedAt: new Date().toISOString() });

  if (!runningClients.has(clientIdStr)) {
    runningClients.add(clientIdStr);
    setImmediate(() => processClientQueue(clientIdStr));
  }
  return true;
};

const getTermsSyncStatus = (clientId) =>
  syncStatusByClient.get(String(clientId)) || { status: 'idle' };

const syncTermsForSingleLanguage = async (clientId, newLanguageId, newLanguageCode, sourceData) => {
  const clientIdObj = normalizeClientId(clientId);
  if (!clientIdObj || !sourceData) return;
  const englishLang = await resolveEnglishLanguage(clientId);
  if (!englishLang) return;

  const langId = String(newLanguageId);
  const [translatedTerms, translatedPrivacy, translatedAck] = await Promise.all([
    sourceData.terms?.trim()
      ? translateFieldCached(sourceData.terms, newLanguageCode, englishLang.code)
      : Promise.resolve(sourceData.terms),
    sourceData.privacy?.trim()
      ? translateFieldCached(sourceData.privacy, newLanguageCode, englishLang.code)
      : Promise.resolve(sourceData.privacy),
    sourceData.acknowledgement?.trim()
      ? translateFieldCached(sourceData.acknowledgement, newLanguageCode, englishLang.code)
      : Promise.resolve(sourceData.acknowledgement),
  ]);

  if (sourceData.terms?.trim() && !translatedTerms) return;

  await bulkUpsertTermsSettings(clientIdObj, [
    { name: `termsCondition_${langId}`, value: translatedTerms ?? sourceData.terms },
    { name: `privacyPolicy_${langId}`, value: translatedPrivacy ?? sourceData.privacy },
    { name: `acknowledgement_${langId}`, value: translatedAck ?? sourceData.acknowledgement },
  ]);
};

module.exports = {
  queueTermsTranslationSync,
  runTermsTranslationSync,
  getTermsSyncStatus,
  syncTermsForSingleLanguage,
};
