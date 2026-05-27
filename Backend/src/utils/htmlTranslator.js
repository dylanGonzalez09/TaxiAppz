/**
 * HTML translation: Google Cloud (optional) + MyMemory fallback with rate-limit handling.
 */

const axios = require('axios');
const { getDefaultGoogleTranslator } = require('./GoogleTranslator');
const { resolveTranslationPair } = require('./translationLangCodes.js');

const MYMEMORY_MAX = 450;
const HTML_CHUNK = 4000;
const MYMEMORY_DELAY_MS = Number(process.env.MYMEMORY_DELAY_MS) || 700;
const LANGUAGE_SYNC_DELAY_MS = Number(process.env.LANGUAGE_SYNC_DELAY_MS) || 2500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const axiosGetWithRetry = async (url, config, retries = 5) => {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await axios.get(url, config);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 429 && attempt < retries - 1) {
        const waitMs = MYMEMORY_DELAY_MS * (attempt + 2);
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

/**
 * Split HTML into tags vs text; translate text nodes only (rate-limited).
 */
const translateHtmlPreservingTags = async (html, translatePlain) => {
  const parts = html.split(/(<[^>]+>)/);
  const out = [];

  for (const part of parts) {
    if (!part || part.startsWith('<') || !/[a-zA-Z]/.test(part)) {
      out.push(part);
      continue;
    }
    const trimmed = part.trim();
    if (!trimmed) {
      out.push(part);
      continue;
    }
    const translated = await translatePlain(trimmed);
    out.push(part.replace(trimmed, translated));
    await sleep(MYMEMORY_DELAY_MS);
  }

  return out.join('');
};

/**
 * MyMemory free API with retry on 429.
 */
const translatePlainMyMemory = async (text, targetLang, sourceLang) => {
  const pair = resolveTranslationPair(targetLang, sourceLang);
  if (!pair) return text;

  const langpair = `${pair.source}|${pair.target}`;
  let remaining = text.trim();
  const pieces = [];

  while (remaining.length > 0) {
    const chunk = remaining.slice(0, MYMEMORY_MAX);
    remaining = remaining.slice(MYMEMORY_MAX);

    const { data } = await axiosGetWithRetry('https://api.mymemory.translated.net/get', {
      params: { q: chunk, langpair },
      timeout: 30000,
    });

    const translated = data?.responseData?.translatedText;
    if (!translated || data?.responseStatus === 403) {
      throw new Error(data?.responseDetails || 'MyMemory translation failed');
    }
    pieces.push(translated);
    if (remaining.length > 0) await sleep(MYMEMORY_DELAY_MS);
  }

  return pieces.join('');
};

const translateHtmlLibreTranslate = async (html, targetLang, sourceLang) => {
  const pair = resolveTranslationPair(targetLang, sourceLang);
  if (!pair) throw new Error('Unsupported language pair for LibreTranslate');

  const baseUrl = (process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com').replace(/\/$/, '');
  const apiKey = process.env.LIBRETRANSLATE_API_KEY || '';

  const body = {
    q: html,
    source: pair.source,
    target: pair.target,
    format: 'html',
  };
  if (apiKey) body.api_key = apiKey;

  const { data } = await axios.post(`${baseUrl}/translate`, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000,
  });

  if (!data?.translatedText) {
    throw new Error('LibreTranslate returned empty result');
  }
  return data.translatedText;
};

const translateHtmlChunkFallback = async (chunk, targetLang, sourceLang) => {
  if (process.env.LIBRETRANSLATE_URL || process.env.LIBRETRANSLATE_API_KEY) {
    try {
      return await translateHtmlLibreTranslate(chunk, targetLang, sourceLang);
    } catch (err) {
      console.warn('LibreTranslate fallback failed:', err.message);
    }
  }

  return translateHtmlPreservingTags(chunk, (plain) => translatePlainMyMemory(plain, targetLang, sourceLang));
};

const shouldTryGoogle = (pair) => {
  if (process.env.SKIP_GOOGLE_TRANSLATE === 'true') return false;
  const t = pair.target.split('-')[0];
  const s = pair.source.split('-')[0];
  return t.length === 2 && s.length === 2 && t !== 'cr' && s !== 'cr';
};

/**
 * Translate HTML using resolved language pair (app codes, e.g. ta, ka, en).
 */
const translateHtmlWithFallback = async (html, targetAppCode, sourceAppCode = 'en') => {
  if (!html || typeof html !== 'string' || !html.trim()) {
    return html;
  }

  const pair = resolveTranslationPair(targetAppCode, sourceAppCode);
  if (!pair) {
    return null;
  }

  const { source, target } = pair;
  const translator = getDefaultGoogleTranslator();
  const chunks = [];
  let remaining = html;

  while (remaining.length > 0) {
    if (remaining.length <= HTML_CHUNK) {
      chunks.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf('</p>', HTML_CHUNK);
    if (cut < HTML_CHUNK / 2) cut = remaining.lastIndexOf('</li>', HTML_CHUNK);
    if (cut < HTML_CHUNK / 2) cut = remaining.lastIndexOf(' ', HTML_CHUNK);
    if (cut < HTML_CHUNK / 2) cut = HTML_CHUNK;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }

  const translatedParts = [];
  let google403Logged = false;

  for (const chunk of chunks) {
    if (!chunk.trim() || !/[a-zA-Z]/.test(chunk)) {
      translatedParts.push(chunk);
      continue;
    }

    let translated = null;

    if (shouldTryGoogle(pair)) {
      try {
        if (translator.client) {
          const [result] = await translator.client.translate(chunk.trim(), {
            from: source,
            to: target,
            format: 'html',
          });
          translated = typeof result === 'string' ? result : result?.[0];
        }
      } catch (sdkErr) {
        const msg = sdkErr?.message || '';
        if (!msg.includes('Bad language pair') && !google403Logged) {
          console.warn('Google SDK HTML translate:', msg);
        }
      }

      if (!translated && translator.apiKey) {
        try {
          const out = await translator._translateViaRest(chunk.trim(), target, source, 'html');
          translated = out?.[0];
        } catch (restErr) {
          if (restErr?.response?.status === 403 && !google403Logged) {
            console.warn(
              'Google Translate unavailable (403). Using MyMemory fallback — add delays to avoid rate limits.'
            );
            google403Logged = true;
          }
        }
      }
    }

    if (!translated || translated.trim() === chunk.trim()) {
      try {
        translated = await translateHtmlChunkFallback(chunk, targetAppCode, sourceAppCode);
      } catch (fallbackErr) {
        console.error(
          `Translation failed (${sourceAppCode}→${targetAppCode}):`,
          fallbackErr?.response?.status === 429
            ? 'MyMemory rate limit — wait and try again, or set GOOGLE_TRANSLATE_API_KEY'
            : fallbackErr.message
        );
        translatedParts.push(chunk);
        continue;
      }
    }

    translatedParts.push(translated);
    await sleep(MYMEMORY_DELAY_MS);
  }

  const joined = translatedParts.join('');
  if (joined.trim() === html.trim()) {
    return null;
  }
  return joined;
};

module.exports = {
  translateHtmlWithFallback,
  translateHtmlPreservingTags,
  translatePlainMyMemory,
  LANGUAGE_SYNC_DELAY_MS,
};
