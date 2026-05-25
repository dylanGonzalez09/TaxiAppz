require('dotenv').config();
const twilio = require('twilio');
const { Settings } = require('../models')

class TwilioSMS {


  async sendSMS(to, msg, options = {}) {
    try {

      const [settings] = await Promise.all([
        Settings.find({ name: { $in: ['twilioAccountSid', 'twilioAuthToken', 'twilioSenderId'] } })
      ]);

      // Create settings map more efficiently
      const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));


      // Destructure settings with defaults
      const {
        twilioAccountSid = '',
        twilioAuthToken = '',
        twilioSenderId = '',
      } = settingsMap;

      const client = twilio(twilioAccountSid, twilioAuthToken);


      const payload = {
        body: msg,
        to: this.formatPhoneNumber(to),
        from: options.from || twilioSenderId || null, // Twilio will use purchased number if not provided
        ...options
      };

      // Remove undefined/null values
      Object.keys(payload).forEach(key => payload[key] === undefined || payload[key] === null ? delete payload[key] : {});

      const response = await client.messages.create(payload);

      return {
        success: true,
        sid: response.sid,
        status: response.status,
        dateCreated: response.dateCreated,
        to: response.to
      };
    } catch (error) {
      console.error('TwilioSMS Error:', {
        status: error.status,
        code: error.code,
        message: error.message,
        moreInfo: error.moreInfo
      });
      throw error;
    }
  }

  /**
   * Format phone number to E.164 format
   * @param {string|number} phone - Raw phone number
   * @returns {string} Formatted number
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.toString().replace(/\D/g, '');

    // If number starts with 0 (local Nigerian format), convert to +234
    if (cleaned.startsWith('0')) {
      return `+234${cleaned.substring(1)}`;
    }

    // If number doesn't start with +, add +
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }

    return cleaned;
  }

  async checkBalance() {
    try {

      const [settings] = await Promise.all([
        Settings.find({ name: { $in: ['twilioAccountSid', 'twilioAuthToken', 'twilioSenderId'] } }).session(session),
      ]);

      // Create settings map more efficiently
      const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

      // Destructure settings with defaults
      const {
        twilioAccountSid = '',
        twilioAuthToken = '',
        twilioSenderId = '',
      } = settingsMap;

      const client = twilio(twilioAccountSid, twilioAuthToken);

      const balance = await client.balance.fetch();

      return {
        balance: balance.balance,
        currency: balance.currency
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      throw error;
    }
  }
}

module.exports = new TwilioSMS();