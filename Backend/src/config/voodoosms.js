require('dotenv').config();
const axios = require('axios');
const { Settings } = require('../models')

class VoodooSMS {

  async sendSMS(to, msg, options = {}) {
    try {


      const [settings] = await Promise.all([
        Settings.find({ name: { $in: ['voodooSmsApiKey', 'voodooSmsSenderId'] } })
      ]);

      // Create settings map more efficiently
      const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

      // Destructure settings with defaults
      const {
        voodooSmsApiKey = '',
        voodooSmsSenderId = '',
      } = settingsMap;


      const baseUrl = 'https://api.voodoosms.com/';

      const payload = {
        to: this.formatPhoneNumber(to),
        from: voodooSmsSenderId,
        msg,
        ...options
      };


      const response = await axios.post(`${baseUrl}sendsms`, payload, {
        headers: {
          'Authorization': voodooSmsApiKey,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('VoodooSMS Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Format phone number (remove + and non-digit characters)
   * @param {string|number} phone - Raw phone number
   * @returns {string} Formatted number
   */
  formatPhoneNumber(phone) {
    return phone.toString().replace(/\D/g, '');
  }

  async checkBalance() {
    try {
      const [settings] = await Promise.all([
        Settings.find({ name: { $in: ['voodooSmsApiKey', 'voodooSmsSenderId'] } })
      ]);

      // Create settings map more efficiently
      const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

      // Destructure settings with defaults
      const {
        voodooSmsApiKey = '',
        voodooSmsSenderId = '',
      } = settingsMap;


      const baseUrl = 'https://api.voodoosms.com/';


      const response = await axios.get(`${baseUrl}v1/account/balance`, {
        headers: {
          'Authorization': `Bearer ${voodooSmsApiKey}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking balance:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new VoodooSMS();
