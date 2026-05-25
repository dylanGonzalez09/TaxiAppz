const Stripe = require('stripe');
const { Settings } = require('../models');
const tokenService = require('../services/token.service');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Console } = require('winston/lib/winston/transports');

class StripePayment {
  constructor() {
    this.defaultCurrency = 'usd';
    this.defaultEnvironment = 'test';
  }

  /**
   * Get Stripe settings from database
   * @private
   */
  async _getSettings() {
    const settings = await Settings.find({
      name: {
        $in: [
          'stripeTestSecretKey',
          'stripeLiveSecretKey',
          'stripeTestPublishableKey',
          'stripeLivePublishableKey',
          'stripeEnvironment',
          'stripeCurrency'
        ]
      }
    });

    const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

    return {
      environment: settingsMap.stripeEnvironment || this.defaultEnvironment,
      secretApiKey: settingsMap.stripeEnvironment === 'live'
        ? settingsMap.stripeLiveSecretKey
        : settingsMap.stripeTestSecretKey,
      publishApiKey: settingsMap.stripeEnvironment === 'live'
        ? settingsMap.stripeLivePublishableKey
        : settingsMap.stripeTestPublishableKey,
      currency: settingsMap.stripeCurrency || this.defaultCurrency,
    };
  }

  async getuserId(req) {
    let userId = '';

    let driverId = '';

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
      return;
    }
    // Remove the 'Bearer ' prefix and get the token
    const token = authHeader.substring(7);

    const user = await tokenService.verifyTokenAndGetUser(token);

    return user;
  }

  /**
   * Create a payment intent
   * @param {number} amount - Amount in smallest currency unit (e.g., cents)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Payment intent object
   */
  async createPaymentIntent(amount, currencyData, req) {
    try {
      const { secretApiKey, publishApiKey, currency, environment } = await this._getSettings();
      const user = await this.getuserId(req);

      if (!secretApiKey) {
        throw new Error('Stripe API key not configured');
      }

      const client = Stripe(secretApiKey);

      const payload = {
        amount,
        currency: currencyData || currency,
        payment_method_types: ['card'],
        ...{}
      };

      // Remove undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      const paymentIntent = await client.paymentIntents.create(payload);

      const customer = await client.customers.create({
        email: user.email,
        name: user.firstName
      });

    

      let response = {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
        secretApiKey: secretApiKey,
        publishApiKey: publishApiKey,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        environment
      };


      return response;
    } catch (error) {
      console.error('StripePayment Error:', {
        type: error.type,
        code: error.code,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - ID of the payment intent to confirm
   * @param {Object} options - Additional confirmation options
   * @returns {Promise<Object>} Confirmed payment intent object
   */
  async confirmPayment(paymentIntentId, options = {}, req) {
    try {
      const { secretApiKey, publishApiKey, currency, environment } = await this._getSettings();

      if (!secretApiKey) {
        throw new Error('Stripe API key not configured');
      }

      const client = Stripe(secretApiKey);



      const paymentIntent = await client.paymentIntents.confirm(
        paymentIntentId,
        options
      );

      return {
        success: true,
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        environment
      };
    } catch (error) {
      console.error('StripePayment Error:', {
        type: error.type,
        code: error.code,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Get payment intent status
   * @param {string} paymentIntentId - ID of the payment intent
   * @returns {Promise<Object>} Payment intent object with status
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const { secretApiKey, publishApiKey, currency, environment } = await this._getSettings();

      if (!secretApiKey) {
        throw new Error('Stripe API key not configured');
      }

      const client = Stripe(secretApiKey);

      const paymentIntent = await client.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        environment
      };
    } catch (error) {
      console.error('StripePayment Error:', error);
      throw error;
    }
  }
}

module.exports = new StripePayment();