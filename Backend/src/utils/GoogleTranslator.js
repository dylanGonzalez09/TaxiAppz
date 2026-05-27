/**
 * Google Translator – separate file (does not modify dynamicTranslator.js).
 * Uses Google Cloud Translation API (@google-cloud/translate).
 * Use this when you need Google translation; dynamicTranslator.js remains unchanged.
 */

const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;
const path = require('path');
const fs = require('fs');

const DEFAULT_SOURCE = 'en';
const CACHE_MAX_SIZE = 5000;

/**
 * Google Translator class using @google-cloud/translate
 */
class GoogleTranslator {
  /**
   * @param {Object} [options]
   * @param {string} [options.projectId] - GCP project ID (or use GOOGLE_CLOUD_PROJECT_ID env)
   * @param {string} [options.keyFilename] - Path to service account JSON (or use GOOGLE_APPLICATION_CREDENTIALS env)
   * @param {string} [options.apiKey] - Google Translation API key (or use GOOGLE_TRANSLATE_API_KEY env)
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_API_KEY;
    const projectId = options.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCP_PROJECT_ID;
    const envKeyFilename = options.keyFilename || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const bundledKeyFilename = path.resolve(process.cwd(), 'src/config/serviceAccountKey.json');
    const keyFilename = envKeyFilename || (fs.existsSync(bundledKeyFilename) ? bundledKeyFilename : undefined);
    const config = {};
    if (projectId) config.projectId = projectId;
    if (keyFilename) config.keyFilename = keyFilename;
    // Always initialize client when credentials are available; this allows fallback
    // when API-key based translation fails.
    this.client = keyFilename || projectId ? new Translate(config) : null;
    this.cache = new Map();
  }

  async _translateViaRest(textOrTexts, targetLang, sourceLang = DEFAULT_SOURCE) {
    const q = textOrTexts;
    const { data } = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(this.apiKey)}`,
      {
        q,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      },
      { timeout: 30000 }
    );
    const translations = data?.data?.translations;
    if (!Array.isArray(translations) || translations.length === 0) return null;
    return translations.map((t) => t?.translatedText).filter((t) => typeof t === 'string');
  }

  async _translateViaPublicEndpoint(text, targetLang, sourceLang = DEFAULT_SOURCE) {
    const url = 'https://translate.googleapis.com/translate_a/single';
    const { data } = await axios.get(url, {
      params: {
        client: 'gtx',
        sl: sourceLang,
        tl: targetLang,
        dt: 't',
        q: text,
      },
      timeout: 30000,
    });
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    return data[0]
      .map((chunk) => (Array.isArray(chunk) ? chunk[0] : ''))
      .filter((x) => typeof x === 'string')
      .join('')
      .trim();
  }

  /**
   * Translate text using Google Translate API
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code (e.g. 'te', 'hi', 'ta')
   * @param {string} [sourceLang='en'] - Source language code
   * @returns {Promise<string>} Translated text
   */
  async translateTextWithAPI(text, targetLang = 'te', sourceLang = DEFAULT_SOURCE) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return text;
    }

    if (!/[a-zA-Z]/.test(text)) {
      return text;
    }

    const target = (targetLang || 'te').toString().toLowerCase().trim();
    const source = (sourceLang || DEFAULT_SOURCE).toString().toLowerCase().trim();
    if (target === source) {
      return text.trim();
    }

    try {
      if (this.apiKey) {
        try {
          const out = await this._translateViaRest(text.trim(), target, source);
          return (out && out[0]) || text;
        } catch (restErr) {
          if (!this.client) throw restErr;
        }
      }
      if (!this.client) return text;
      const [translation] = await this.client.translate(text.trim(), { from: source, to: target });
      return typeof translation === 'string' ? translation : (translation && translation[0]) || text;
    } catch (error) {
      try {
        const fallback = await this._translateViaPublicEndpoint(text.trim(), target, source);
        return fallback || text;
      } catch (fallbackErr) {
        console.error('GoogleTranslator: Translation API error:', error.message);
        console.error('GoogleTranslator: Public fallback error:', fallbackErr.message);
        return text;
      }
    }
  }

  /**
   * Translate with caching
   * @param {string} text
   * @param {string} targetLang
   * @param {string} [sourceLang='en']
   * @returns {Promise<string>}
   */
  async translateWithCache(text, targetLang = 'te', sourceLang = DEFAULT_SOURCE) {
    const key = `${text}__${targetLang}__${sourceLang || DEFAULT_SOURCE}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const result = await this.translateTextWithAPI(text, targetLang, sourceLang);
    this.cache.set(key, result);
    if (this.cache.size > CACHE_MAX_SIZE) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    return result;
  }

  /**
   * Batch translate multiple texts
   * @param {string[]} texts
   * @param {string} targetLang
   * @param {string} [sourceLang='en']
   * @returns {Promise<string[]>}
   */
  async batchTranslate(texts, targetLang = 'te', sourceLang = DEFAULT_SOURCE) {
    const unique = [...new Set(texts.filter((t) => t && typeof t === 'string' && /[a-zA-Z]/.test(t)))];
    if (unique.length === 0) return texts;

    const target = (targetLang || 'te').toString().toLowerCase().trim();
    const source = (sourceLang || DEFAULT_SOURCE).toString().toLowerCase().trim();
    if (target === source) return texts;

    try {
      let translatedArr = null;
      if (this.apiKey) {
        try {
          translatedArr = await this._translateViaRest(unique, target, source);
        } catch (restErr) {
          if (!this.client) throw restErr;
        }
      }
      if (!translatedArr) {
        if (!this.client) return texts;
        const [translations] = await this.client.translate(unique, { from: source, to: target });
        translatedArr = Array.isArray(translations) ? translations : [translations];
      }

      const map = new Map();
      unique.forEach((t, i) => {
        const val = translatedArr?.[i];
        map.set(t, typeof val === 'string' ? val : t);
      });
      return texts.map((t) => (t && typeof t === 'string' && /[a-zA-Z]/.test(t) ? map.get(t) || t : t));
    } catch (error) {
      try {
        const translated = await Promise.all(
          texts.map(async (t) => {
            if (!t || typeof t !== 'string' || !/[a-zA-Z]/.test(t)) return t;
            const out = await this._translateViaPublicEndpoint(t, target, source);
            return out || t;
          })
        );
        return translated;
      } catch (fallbackErr) {
        console.error('GoogleTranslator: Batch error:', error.message);
        console.error('GoogleTranslator: Public batch fallback error:', fallbackErr.message);
        return Promise.all(texts.map((t) => this.translateWithCache(t, targetLang, sourceLang)));
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

let defaultInstance = null;

/**
 * Get or create default GoogleTranslator instance
 * @param {Object} [options]
 * @returns {GoogleTranslator}
 */
function getDefaultGoogleTranslator(options = {}) {
  if (!defaultInstance) {
    defaultInstance = new GoogleTranslator(options);
  }
  return defaultInstance;
}

/**
 * Translate text using Google Translate API (uses default translator instance).
 * Use this when you only need a one-off translation without managing a class instance.
 *
 * @param {string} text - Text to translate
 * @param {string} [targetLang='te'] - Target language code (e.g. 'te', 'hi', 'ta')
 * @param {string} [sourceLang='en'] - Source language code
 * @returns {Promise<string>} Translated text
 *
 * @example
 * const { translateTextWithAPI } = require('./utils/GoogleTranslator');
 * const translated = await translateTextWithAPI('Hello world', 'te');
 */
async function translateTextWithAPI(text, targetLang = 'te', sourceLang = DEFAULT_SOURCE) {
  return getDefaultGoogleTranslator().translateTextWithAPI(text, targetLang, sourceLang);
}

/**
 * Batch translate multiple texts (uses default translator instance).
 *
 * @param {string[]} texts - Array of texts to translate
 * @param {string} [targetLang='te'] - Target language code
 * @param {string} [sourceLang='en'] - Source language code
 * @returns {Promise<string[]>} Array of translated texts
 */
async function batchTranslate(texts, targetLang = 'te', sourceLang = DEFAULT_SOURCE) {
  return getDefaultGoogleTranslator().batchTranslate(texts, targetLang, sourceLang);
}

module.exports = {
  GoogleTranslator,
  getDefaultGoogleTranslator,
  translateTextWithAPI,
  batchTranslate,
};
