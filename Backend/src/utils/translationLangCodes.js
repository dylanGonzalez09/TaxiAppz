/** App language code → Google / MyMemory target code */
const APP_TO_GOOGLE = {
  en: 'en',
  hi: 'hi',
  ta: 'ta',
  te: 'te',
  ka: 'kn',
  kn: 'kn',
  ma: 'ml',
  ml: 'ml',
  fr: 'fr',
  ar: 'ar',
  es: 'es',
  pa: 'pa',
  ur: 'ur',
  zh: 'zh',
  zh_cn: 'zh-CN',
  'zh-cn': 'zh-CN',
  tl: 'tl',
  fil: 'tl',
  vi: 'vi',
  ko: 'ko',
  pu: 'pa',
  pun: 'pa',
};

/** Codes that must not be sent to translation APIs (invalid / unsupported). */
const BLOCKED_LANGUAGE_CODES = new Set(['cr']);

const toGoogleLangCode = (code) => {
  const normalized = (code || 'en').toLowerCase().trim();
  return APP_TO_GOOGLE[normalized] || normalized;
};

/**
 * @returns {{ source: string, target: string } | null}
 */
const resolveTranslationPair = (targetAppCode, sourceAppCode = 'en') => {
  const rawTarget = (targetAppCode || '').toLowerCase().trim();
  const rawSource = (sourceAppCode || 'en').toLowerCase().trim();

  if (BLOCKED_LANGUAGE_CODES.has(rawTarget) || BLOCKED_LANGUAGE_CODES.has(rawSource)) {
    return null;
  }

  const target = toGoogleLangCode(rawTarget);
  const source = toGoogleLangCode(rawSource);

  if (!target || !source || target.length < 2 || source.length < 2) {
    return null;
  }
  if (target === source) {
    return null;
  }

  return { source, target };
};

module.exports = {
  APP_TO_GOOGLE,
  BLOCKED_LANGUAGE_CODES,
  toGoogleLangCode,
  resolveTranslationPair,
};
