// const crypto = require('crypto');
// const { randomUUID } = crypto;
// const { Settings } = require('../models');
// const tokenService = require('../services/token.service');
// const { APIContracts, APIControllers, Constants } = require('authorizenet');

// const { ValidationModeEnum } = APIContracts;

// const SDKConstants = Constants;

// /** Authorize.Net AnetApiSchema: merchantCustomerId maxLength 20 (Mongo ObjectId is 24). */
// function merchantCustomerIdForAuthorizeNet(userId) {
//   const s = String(userId ?? '').trim();
//   if (!s) return 'unknown';
//   if (s.length <= 20) return s;
//   return crypto.createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 20);
// }

// function buildOrderForTransaction(prefix) {
//   const stamp = Date.now().toString(36).toUpperCase();
//   const rnd = Math.floor(Math.random() * 0xffffff).toString(36).toUpperCase();
//   const invoice = `${prefix}-${stamp}-${rnd}`.slice(0, 20);
//   const order = new APIContracts.OrderType();
//   order.setInvoiceNumber(invoice);
//   return order;
// }

// class AuthorizeNetPayment {
//   constructor() {
//     this.defaultCurrency = 'cad';
//     this.defaultEnvironment = 'test';
//   }

//   async _getSettings(forceEnvironment) {
//     const settings = await Settings.find({
//       name: {
//         $in: [
//           'authorizeNetEnvironment',
//           'authorizeNetTestLoginKey',
//           'authorizeNetTestApiLoginId',
//           'authorizeNetTestTransactionKey',
//           'authorizeNetTestSignatureKey',
//           'authorizeNetTestPublicClientKey',
//           'authorizeNetLiveLoginKey',
//           'authorizeNetLiveApiLoginId',
//           'authorizeNetLiveTransactionKey',
//           'authorizeNetLiveSignatureKey',
//           'authorizeNetLivePublicClientKey',
//           'authorizeNetCurrency',
//         ],
//       },
//     });

//     const settingsMap = Object.fromEntries(settings.map((s) => [s.name, s.value]));
//     const envRaw = forceEnvironment || settingsMap.authorizeNetEnvironment || this.defaultEnvironment;
//     const envLower = String(envRaw ?? '').toLowerCase().trim();
//     const env = /(live|production|prod)/i.test(envLower) ? 'live' : 'test';
//     const isLive = env === 'live';

//     const liveApiLoginId = String(settingsMap.authorizeNetLiveApiLoginId || '').trim();
//     const testApiLoginId = String(settingsMap.authorizeNetTestApiLoginId || '').trim();
//     const liveLoginKey = String(settingsMap.authorizeNetLiveLoginKey || '').trim();
//     const testLoginKey = String(settingsMap.authorizeNetTestLoginKey || '').trim();
//     const liveTransactionKey = String(settingsMap.authorizeNetLiveTransactionKey || '').trim();
//     const testTransactionKey = String(settingsMap.authorizeNetTestTransactionKey || '').trim();
//     const livePublicClientKey = String(settingsMap.authorizeNetLivePublicClientKey || '').trim();
//     const testPublicClientKey = String(settingsMap.authorizeNetTestPublicClientKey || '').trim();

//     const liveLoginResolved = liveApiLoginId || liveLoginKey;
//     const testLoginResolved = testApiLoginId || testLoginKey;
//     const liveKeysReady = !!(liveLoginResolved && livePublicClientKey && liveTransactionKey);
//     const testKeysReady = !!(testLoginResolved && testPublicClientKey && testTransactionKey);
//     /** Only allow jstest ↔ js.authorize.net retry when both merchant contexts are fully configured. */
//     const environmentFallbackAllowed = liveKeysReady && testKeysReady;

//     return {
//       environment: env,
//       apiLoginId: isLive
//         ? (liveApiLoginId || liveLoginKey)
//         : (testApiLoginId || testLoginKey),
//       apiLoginIdFallback: isLive
//         ? (liveLoginKey && liveLoginKey !== liveApiLoginId ? liveLoginKey : '')
//         : (testLoginKey && testLoginKey !== testApiLoginId ? testLoginKey : ''),
//       transactionKey: isLive
//         ? liveTransactionKey
//         : testTransactionKey,
//       signatureKey: isLive
//         ? String(settingsMap.authorizeNetLiveSignatureKey || '').trim()
//         : String(settingsMap.authorizeNetTestSignatureKey || '').trim(),
//       publicClientKey: isLive
//         ? livePublicClientKey
//         : testPublicClientKey,
//       currency: (settingsMap.authorizeNetCurrency || this.defaultCurrency).toLowerCase(),
//       environmentFallbackAllowed,
//     };
//   }

//   /**
//    * Prepare client-side tokenization (Accept.js) — same role as Stripe PaymentIntent create.
//    * Returns public keys + refId; mobile/web uses Accept.js, then calls confirm with opaque data.
//    * @param {number} amount - Major currency units (e.g. 10.5 for CAD $10.50).
//    */
//   async createPaymentSession(amount, currencyData, req) {
//     const {
//       apiLoginId,
//       apiLoginIdFallback,
//       publicClientKey,
//       signatureKey,
//       currency,
//       environment,
//       environmentFallbackAllowed,
//     } = await this._getSettings();
//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     if (!apiLoginId || !publicClientKey) {
//       throw new Error('Authorize.Net API Login ID or Public Client Key not configured');
//     }

//     const refId = randomUUID();

//     return {
//       success: true,
//       gateway: 'AuthorizeNet',
//       refId,
//       // Keep backward compatibility for old webview code that reads loginKey.
//       loginKey: apiLoginId,
//       apiLoginId,
//       apiLoginIdFallback: apiLoginIdFallback || undefined,
//       clientKey: publicClientKey,
//       signatureKey: signatureKey || undefined,
//       environment,
//       /** When false, hosted page must not switch Accept.js between test/live (sandbox-only merchants). */
//       environmentFallbackAllowed,
//       amount,
//       currency: (currencyData || currency || this.defaultCurrency).toLowerCase(),
//     };
//   }

//   /**
//    * Charge or authorize-only using opaque data from Accept.js (dataDescriptor + dataValue).
//    * Amount is in major currency units (e.g. 10.5 for CAD $10.50), same as payment/create.
//    * @param {boolean} [authOnly=false] - If true, runs authOnlyTransaction (hold funds); capture later via capturePriorAuthorization.
//    */
//   async confirmOpaquePayment(
//     {
//       opaqueDataDescriptor,
//       opaqueDataValue,
//       amount,
//       currency,
//       authOnly = false,
//       authorizeNetEnvironment,
//     },
//     req
//   ) {
//     const settings = await this._getSettings(authorizeNetEnvironment);
//     const { apiLoginId, transactionKey, currency: defaultCurrency, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const currencyCode = (currency || defaultCurrency || this.defaultCurrency).toUpperCase();
//     const amountMajor = this._formatMajorAmountForAuthorizeNet(Number(amount), currencyCode);

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const opaqueData = new APIContracts.OpaqueDataType();
//     opaqueData.setDataDescriptor(opaqueDataDescriptor);
//     opaqueData.setDataValue(opaqueDataValue);

//     const paymentType = new APIContracts.PaymentType();
//     paymentType.setOpaqueData(opaqueData);

//     const transactionRequestType = new APIContracts.TransactionRequestType();
//     transactionRequestType.setTransactionType(
//       authOnly
//         ? APIContracts.TransactionTypeEnum.AUTHONLYTRANSACTION
//         : APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
//     );
//     transactionRequestType.setAmount(String(amountMajor));
//     transactionRequestType.setCurrencyCode(currencyCode);
//     transactionRequestType.setPayment(paymentType);
//     transactionRequestType.setOrder(buildOrderForTransaction(authOnly ? 'AUTH' : 'NEW'));

//     const createRequest = new APIContracts.CreateTransactionRequest();
//     createRequest.setMerchantAuthentication(merchantAuthenticationType);
//     createRequest.setTransactionRequest(transactionRequestType);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateTransaction(createRequest, endpoint);
//     const parsed = this._parseCreateTransactionResponse(raw);

//     return {
//       success: parsed.approved,
//       gateway: 'AuthorizeNet',
//       transactionId: parsed.transId,
//       responseCode: parsed.responseCode,
//       authCode: parsed.authCode,
//       environment,
//       amount: Number(amount),
//       currency: currencyCode.toLowerCase(),
//       message: parsed.message,
//       authOnly: !!authOnly,
//     };
//   }

//   /**
//    * Capture a prior auth-only transaction (settles/charges the card).
//    * @param {string} refTransId - transactionId returned from auth-only confirmOpaquePayment / chargeCustomerProfile(authOnly).
//    * @param {number} amount - Major units; must not exceed the authorized amount.
//    */
//   async capturePriorAuthorization({ refTransId, amount, currency }, req) {
//     const settings = await this._getSettings();
//     const { apiLoginId, transactionKey, currency: defaultCurrency, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const currencyCode = (currency || defaultCurrency || this.defaultCurrency).toUpperCase();
//     const amountMajor = this._formatMajorAmountForAuthorizeNet(Number(amount), currencyCode);

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const transactionRequestType = new APIContracts.TransactionRequestType();
//     transactionRequestType.setTransactionType(
//       APIContracts.TransactionTypeEnum.PRIORAUTHCAPTURETRANSACTION
//     );
//     transactionRequestType.setRefTransId(String(refTransId));
//     transactionRequestType.setAmount(String(amountMajor));
//     transactionRequestType.setCurrencyCode(currencyCode);

//     const createRequest = new APIContracts.CreateTransactionRequest();
//     createRequest.setMerchantAuthentication(merchantAuthenticationType);
//     createRequest.setTransactionRequest(transactionRequestType);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateTransaction(createRequest, endpoint);
//     const parsed = this._parseCreateTransactionResponse(raw);

//     return {
//       success: parsed.approved,
//       gateway: 'AuthorizeNet',
//       transactionId: parsed.transId,
//       responseCode: parsed.responseCode,
//       authCode: parsed.authCode,
//       environment,
//       amount: Number(amount),
//       currency: currencyCode.toLowerCase(),
//       message: parsed.message,
//       priorAuthTransId: String(refTransId),
//     };
//   }

//   /**
//    * Void an unsettled authorization (releases the hold). Cannot void a captured charge (use refund instead).
//    */
//   async voidAuthorization({ refTransId }, req) {
//     const settings = await this._getSettings();
//     const { apiLoginId, transactionKey, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const transactionRequestType = new APIContracts.TransactionRequestType();
//     transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.VOIDTRANSACTION);
//     transactionRequestType.setRefTransId(String(refTransId));

//     const createRequest = new APIContracts.CreateTransactionRequest();
//     createRequest.setMerchantAuthentication(merchantAuthenticationType);
//     createRequest.setTransactionRequest(transactionRequestType);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateTransaction(createRequest, endpoint);
//     const parsed = this._parseCreateTransactionResponse(raw);

//     return {
//       success: parsed.approved,
//       gateway: 'AuthorizeNet',
//       transactionId: parsed.transId,
//       responseCode: parsed.responseCode,
//       authCode: parsed.authCode,
//       environment,
//       message: parsed.message,
//       voidedRefTransId: String(refTransId),
//     };
//   }

//   /**
//    * Create CIM customer + payment profile from a successful transaction (vault at Authorize.Net).
//    * If existingCustomerProfileId is set, the new payment method is attached to that customer.
//    */
//   async createCustomerProfileFromTransaction(
//     { transId, merchantCustomerId, existingCustomerProfileId },
//     req
//   ) {
//     const settings = await this._getSettings();
//     const { apiLoginId, transactionKey, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const customer = new APIContracts.CustomerProfileBaseType();
//     customer.setMerchantCustomerId(merchantCustomerIdForAuthorizeNet(merchantCustomerId));

//     const createReq = new APIContracts.CreateCustomerProfileFromTransactionRequest();
//     createReq.setMerchantAuthentication(merchantAuthenticationType);
//     createReq.setTransId(String(transId));
//     createReq.setCustomer(customer);
//     if (existingCustomerProfileId) {
//       createReq.setCustomerProfileId(String(existingCustomerProfileId));
//     }

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateCustomerProfileFromTransaction(createReq, endpoint);
//     const parsed = this._parseCreateCustomerProfileResponse(raw);

//     if (!parsed.ok) {
//       throw new Error(parsed.message || 'Create customer profile failed');
//     }

//     // When attaching to an existing customer, Authorize.Net can return only paymentProfileId.
//     const resolvedCustomerProfileId = parsed.customerProfileId || (existingCustomerProfileId ? String(existingCustomerProfileId) : null);
//     if (!resolvedCustomerProfileId) {
//       throw new Error('Missing customerProfileId in response');
//     }

//     return {
//       success: true,
//       gateway: 'AuthorizeNet',
//       customerProfileId: resolvedCustomerProfileId,
//       paymentProfileId: parsed.paymentProfileId,
//       environment,
//     };
//   }

//   /**
//    * Create customer profile + payment profile from Accept.js opaque data (no charge).
//    * Handles E00039 duplicate customer: extracts existing profileId and adds the payment profile to it.
//    */
//   async createCustomerProfileFromOpaque(
//     { opaqueDataDescriptor, opaqueDataValue, merchantCustomerId, authorizeNetEnvironment },
//     req
//   ) {
//     const settings = await this._getSettings(authorizeNetEnvironment);
//     const { apiLoginId, transactionKey, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const opaqueData = new APIContracts.OpaqueDataType();
//     opaqueData.setDataDescriptor(opaqueDataDescriptor);
//     opaqueData.setDataValue(opaqueDataValue);

//     const payment = new APIContracts.PaymentType();
//     payment.setOpaqueData(opaqueData);

//     const paymentProfile = new APIContracts.CustomerPaymentProfileType();
//     paymentProfile.setPayment(payment);
//     paymentProfile.setDefaultPaymentProfile(true);

//     const profile = new APIContracts.CustomerProfileType();
//     profile.setMerchantCustomerId(merchantCustomerIdForAuthorizeNet(merchantCustomerId));
//     profile.setDescription('23 Cabs mobile');
//     profile.setPaymentProfiles([paymentProfile]);

//     const createReq = new APIContracts.CreateCustomerProfileRequest();
//     createReq.setMerchantAuthentication(merchantAuthenticationType);
//     createReq.setProfile(profile);
//     // NONE: skip $0 validation charge — we validate on the real charge.
//     createReq.setValidationMode(ValidationModeEnum.NONE);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateCustomerProfile(createReq, endpoint);
//     const parsed = this._parseCreateCustomerProfileResponse(raw);

//     // E00039: customer profile already exists in Authorize.Net (e.g. previously deleted from our DB).
//     // Extract the existing customerProfileId and attach the new payment method to it instead.
//     if (!parsed.ok && parsed.isDuplicateCustomer && parsed.existingCustomerProfileId) {
//       return this.addPaymentProfileToCustomer(
//         {
//           customerProfileId: parsed.existingCustomerProfileId,
//           opaqueDataDescriptor,
//           opaqueDataValue,
//           authorizeNetEnvironment,
//         },
//         req
//       );
//     }

//     if (!parsed.ok) {
//       throw new Error(parsed.message || 'Create customer profile failed');
//     }
//     if (!parsed.customerProfileId) {
//       throw new Error('Missing customerProfileId in response');
//     }

//     return {
//       success: true,
//       gateway: 'AuthorizeNet',
//       customerProfileId: parsed.customerProfileId,
//       paymentProfileId: parsed.paymentProfileId,
//       environment,
//     };
//   }

//   /**
//    * Add a payment method to an existing Authorize.Net customer profile (opaque data).
//    * Handles E00039 duplicate payment profile: returns existing paymentProfileId as success.
//    */
//   async addPaymentProfileToCustomer(
//     { customerProfileId, opaqueDataDescriptor, opaqueDataValue, authorizeNetEnvironment },
//     req
//   ) {
//     const settings = await this._getSettings(authorizeNetEnvironment);
//     const { apiLoginId, transactionKey, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const opaqueData = new APIContracts.OpaqueDataType();
//     opaqueData.setDataDescriptor(opaqueDataDescriptor);
//     opaqueData.setDataValue(opaqueDataValue);

//     const payment = new APIContracts.PaymentType();
//     payment.setOpaqueData(opaqueData);

//     const paymentProfile = new APIContracts.CustomerPaymentProfileType();
//     paymentProfile.setPayment(payment);
//     paymentProfile.setDefaultPaymentProfile(false);

//     const createReq = new APIContracts.CreateCustomerPaymentProfileRequest();
//     createReq.setMerchantAuthentication(merchantAuthenticationType);
//     createReq.setCustomerProfileId(String(customerProfileId));
//     createReq.setPaymentProfile(paymentProfile);
//     // NONE: skip $0 validation charge — we validate on the real charge.
//     createReq.setValidationMode(ValidationModeEnum.NONE);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateCustomerPaymentProfile(createReq, endpoint);
//     const parsed = this._parseCreateCustomerPaymentProfileResponse(raw);

//     // E00039 duplicate payment profile — treat as success with the existing profileId.
//     if (!parsed.ok) {
//       throw new Error(parsed.message || 'Add payment profile failed');
//     }

//     return {
//       success: true,
//       gateway: 'AuthorizeNet',
//       customerProfileId: String(customerProfileId),
//       paymentProfileId: parsed.paymentProfileId,
//       environment,
//     };
//   }

//   /**
//    * Charge or auth-only using stored customerProfileId + paymentProfileId (CIM).
//    * Amount is in major currency units (e.g. 10.5 for CAD $10.50).
//    * cardCode (CVV) optional — required by some issuers for profile charges.
//    * @param {boolean} [authOnly=false] - Hold funds only; capture with capturePriorAuthorization using returned transactionId.
//    */
//   async chargeCustomerProfile(
//     { customerProfileId, paymentProfileId, cardCode, amount, currency, authOnly = false },
//     req
//   ) {
//     const settings = await this._getSettings();
//     const { apiLoginId, transactionKey, currency: defaultCurrency, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const currencyCode = (currency || defaultCurrency || this.defaultCurrency).toUpperCase();
//     const amountMajor = this._formatMajorAmountForAuthorizeNet(Number(amount), currencyCode);

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const paymentProfile = new APIContracts.PaymentProfile();
//     paymentProfile.setPaymentProfileId(String(paymentProfileId));
//     if (cardCode) {
//       paymentProfile.setCardCode(String(cardCode));
//     }

//     const profileCharge = new APIContracts.CustomerProfilePaymentType();
//     profileCharge.setCustomerProfileId(String(customerProfileId));
//     profileCharge.setPaymentProfile(paymentProfile);

//     const transactionRequestType = new APIContracts.TransactionRequestType();
//     transactionRequestType.setTransactionType(
//       authOnly
//         ? APIContracts.TransactionTypeEnum.AUTHONLYTRANSACTION
//         : APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
//     );
//     transactionRequestType.setAmount(String(amountMajor));
//     transactionRequestType.setCurrencyCode(currencyCode);
//     transactionRequestType.setProfile(profileCharge);
//     transactionRequestType.setOrder(buildOrderForTransaction(authOnly ? 'AUTHSV' : 'SAVED'));

//     const createRequest = new APIContracts.CreateTransactionRequest();
//     createRequest.setMerchantAuthentication(merchantAuthenticationType);
//     createRequest.setTransactionRequest(transactionRequestType);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeCreateTransaction(createRequest, endpoint);
//     const parsed = this._parseCreateTransactionResponse(raw);

//     return {
//       success: parsed.approved,
//       gateway: 'AuthorizeNet',
//       transactionId: parsed.transId,
//       responseCode: parsed.responseCode,
//       authCode: parsed.authCode,
//       environment,
//       amount: Number(amount),
//       currency: currencyCode.toLowerCase(),
//       message: parsed.message,
//       authOnly: !!authOnly,
//     };
//   }

//   async deleteCustomerPaymentProfile({ customerProfileId, paymentProfileId }, req) {
//     const settings = await this._getSettings();
//     const { apiLoginId, transactionKey, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     await tokenService.verifyTokenAndGetUser(this._getBearerToken(req));

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const delReq = new APIContracts.DeleteCustomerPaymentProfileRequest();
//     delReq.setMerchantAuthentication(merchantAuthenticationType);
//     delReq.setCustomerProfileId(String(customerProfileId));
//     delReq.setCustomerPaymentProfileId(String(paymentProfileId));

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeDeleteCustomerPaymentProfile(delReq, endpoint);
//     const parsed = this._parseDeleteCustomerPaymentProfileResponse(raw);

//     if (!parsed.ok) {
//       throw new Error(parsed.message || 'Delete payment profile failed');
//     }

//     return { success: true, gateway: 'AuthorizeNet', environment };
//   }

//   async getTransactionStatus(transactionId) {
//     const settings = await this._getSettings();
//     const { apiLoginId, transactionKey, environment } = settings;

//     if (!apiLoginId || !transactionKey) {
//       throw new Error('Authorize.Net credentials not configured');
//     }

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(apiLoginId);
//     merchantAuthenticationType.setTransactionKey(transactionKey);

//     const getRequest = new APIContracts.GetTransactionDetailsRequest();
//     getRequest.setMerchantAuthentication(merchantAuthenticationType);
//     getRequest.setTransId(transactionId);

//     const endpoint =
//       environment === 'live'
//         ? SDKConstants.endpoint.production
//         : SDKConstants.endpoint.sandbox;

//     const raw = await this._executeGetTransactionDetails(getRequest, endpoint);
//     const parsed = this._parseGetTransactionDetailsResponse(raw);

//     return {
//       success: true,
//       gateway: 'AuthorizeNet',
//       transactionId: parsed.transId,
//       status: parsed.transactionStatus,
//       responseCode: parsed.responseCode,
//       environment,
//     };
//   }

//   _getBearerToken(req) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new Error('Authorization header is missing or invalid');
//     }
//     return authHeader.substring(7);
//   }

//   /** Major units → decimal string for Authorize.Net setAmount. */
//   _formatMajorAmountForAuthorizeNet(amountMajor, currencyCode) {
//     const zeroDecimal = ['JPY', 'KRW', 'VND', 'CLP', 'XAF', 'XOF', 'XPF', 'ISK'];
//     const c = (currencyCode || 'USD').toUpperCase();
//     const n = Number(amountMajor);
//     if (!Number.isFinite(n) || n < 0) {
//       return zeroDecimal.includes(c) ? '0' : '0.00';
//     }
//     if (zeroDecimal.includes(c)) {
//       return String(Math.round(n));
//     }
//     return n.toFixed(2);
//   }

//   _normalizeGatewayError(err, fallbackMessage = 'Authorize.Net request failed') {
//     const fallback = String(fallbackMessage || 'Authorize.Net request failed').trim();
//     const clean = (value) => {
//       const text = String(value ?? '').trim();
//       if (!text || text === '-' || text === '[object Object]') return '';
//       return text;
//     };

//     if (!err) return fallback;
//     if (typeof err === 'string') {
//       const direct = clean(err);
//       return direct || fallback;
//     }

//     const directFields = [
//       err.message,
//       err.text,
//       err.description,
//       err.detail,
//       err.error,
//       err.errorText,
//       err.reason,
//     ];
//     for (const field of directFields) {
//       const direct = clean(field);
//       if (direct) {
//         const code = clean(err.code);
//         return code ? `${code}: ${direct}` : direct;
//       }
//     }

//     const asString = clean(err.toString && err.toString());
//     if (asString) return asString;
//     return fallback;
//   }

//   _executeCreateTransaction(createRequest, endpoint) {
//     return new Promise((resolve, reject) => {
//       const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
//       ctrl.setEnvironment(endpoint);
//       ctrl.execute(() => {
//         const err = ctrl.getError();
//         if (err) {
//           reject(new Error(this._normalizeGatewayError(err, 'Authorize.Net transaction request failed')));
//           return;
//         }
//         resolve(ctrl.getResponse());
//       });
//     });
//   }

//   _executeGetTransactionDetails(getRequest, endpoint) {
//     return new Promise((resolve, reject) => {
//       const ctrl = new APIControllers.GetTransactionDetailsController(getRequest.getJSON());
//       ctrl.setEnvironment(endpoint);
//       ctrl.execute(() => {
//         const err = ctrl.getError();
//         if (err) {
//           reject(new Error(this._normalizeGatewayError(err, 'Authorize.Net get transaction details failed')));
//           return;
//         }
//         resolve(ctrl.getResponse());
//       });
//     });
//   }

//   _executeCreateCustomerProfileFromTransaction(request, endpoint) {
//     return new Promise((resolve, reject) => {
//       const ctrl = new APIControllers.CreateCustomerProfileFromTransactionController(request.getJSON());
//       ctrl.setEnvironment(endpoint);
//       ctrl.execute(() => {
//         const err = ctrl.getError();
//         if (err) {
//           reject(new Error(this._normalizeGatewayError(err, 'Authorize.Net create profile from transaction failed')));
//           return;
//         }
//         resolve(ctrl.getResponse());
//       });
//     });
//   }

//   _executeCreateCustomerProfile(request, endpoint) {
//     return new Promise((resolve, reject) => {
//       const ctrl = new APIControllers.CreateCustomerProfileController(request.getJSON());
//       ctrl.setEnvironment(endpoint);
//       ctrl.execute(() => {
//         const err = ctrl.getError();
//         if (err) {
//           reject(new Error(this._normalizeGatewayError(err, 'Authorize.Net create customer profile failed')));
//           return;
//         }
//         resolve(ctrl.getResponse());
//       });
//     });
//   }

//   _executeCreateCustomerPaymentProfile(request, endpoint) {
//     return new Promise((resolve, reject) => {
//       const ctrl = new APIControllers.CreateCustomerPaymentProfileController(request.getJSON());
//       ctrl.setEnvironment(endpoint);
//       ctrl.execute(() => {
//         const err = ctrl.getError();
//         if (err) {
//           reject(new Error(this._normalizeGatewayError(err, 'Authorize.Net add payment profile failed')));
//           return;
//         }
//         resolve(ctrl.getResponse());
//       });
//     });
//   }

//   _executeDeleteCustomerPaymentProfile(request, endpoint) {
//     return new Promise((resolve, reject) => {
//       const ctrl = new APIControllers.DeleteCustomerPaymentProfileController(request.getJSON());
//       ctrl.setEnvironment(endpoint);
//       ctrl.execute(() => {
//         const err = ctrl.getError();
//         if (err) {
//           reject(new Error(this._normalizeGatewayError(err, 'Authorize.Net delete payment profile failed')));
//           return;
//         }
//         resolve(ctrl.getResponse());
//       });
//     });
//   }

//   _parseCreateCustomerProfileResponse(raw) {
//     const body =
//       (raw && (raw.createCustomerProfileResponse || raw.createCustomerProfileFromTransactionResponse)) || raw;
//     if (!body) {
//       return { ok: false, message: 'Invalid Authorize.Net profile response' };
//     }

//     const rc = body.messages && body.messages.resultCode;
//     if (rc && String(rc).toLowerCase() !== 'ok') {
//       let msg = '';
//       let isDuplicateCustomer = false;
//       let existingCustomerProfileId = null;
//       if (body.messages.message && body.messages.message.length) {
//         // Prefer `description` when available; avoid returning Authorize.Net placeholder '-'.
//         msg = body.messages.message
//           .map((m) => {
//             const text = (m.text ?? '').toString().trim();
//             const desc = (m.description ?? '').toString().trim();
//             if (desc) return desc;
//             if (!text || text === '-') return null;
//             return text;
//           })
//           .filter(Boolean)
//           .join('; ');
//         // E00039: "A duplicate record with ID XXXXXXXX already exists."
//         for (const m of body.messages.message) {
//           if (m.code === 'E00039') {
//             isDuplicateCustomer = true;
//             const text = (m.text ?? '').toString().trim();
//             const desc = (m.description ?? '').toString().trim();
//             const matchSource = desc || text || '';
//             const match = matchSource.match(/\b(\d{5,})\b/);
//             if (match) existingCustomerProfileId = match[1];
//             break;
//           }
//         }
//       }
//       if (isDuplicateCustomer && existingCustomerProfileId) {
//         return { ok: false, isDuplicateCustomer: true, existingCustomerProfileId, message: msg };
//       }
//       return { ok: false, message: msg || 'Authorize.Net profile error' };
//     }

//     const customerProfileId = body.customerProfileId || body.customerProfileID || null;
//     let paymentProfileId = null;
//     const list = body.customerPaymentProfileIdList;

//     // JSON API may return: array of ids, { numericString: "x" | ["x"] }, or a single id field.
//     if (Array.isArray(list) && list.length) {
//       paymentProfileId = list[0];
//     } else if (list && typeof list === 'object') {
//       if (Array.isArray(list.numericString)) {
//         paymentProfileId = list.numericString[0] ?? null;
//       } else if (list.numericString != null && list.numericString !== '') {
//         paymentProfileId = list.numericString;
//       }
//     }
//     if (!paymentProfileId && body.customerPaymentProfileId != null && body.customerPaymentProfileId !== '') {
//       paymentProfileId = body.customerPaymentProfileId;
//     }
//     if (!paymentProfileId && body.customerPaymentProfileID != null && body.customerPaymentProfileID !== '') {
//       paymentProfileId = body.customerPaymentProfileID;
//     }

//     if (!paymentProfileId) {
//       return { ok: false, message: 'Missing paymentProfileId in response' };
//     }

//     return {
//       ok: true,
//       customerProfileId: customerProfileId ? String(customerProfileId) : null,
//       paymentProfileId: String(paymentProfileId),
//     };
//   }

//   _parseCreateCustomerPaymentProfileResponse(raw) {
//     const body = raw && (raw.createCustomerPaymentProfileResponse || raw);
//     if (!body) {
//       return { ok: false, message: 'Invalid add payment profile response' };
//     }
//     const rc = body.messages && body.messages.resultCode;
//     if (rc && String(rc).toLowerCase() !== 'ok') {
//       let msg = '';
//       let isDuplicatePaymentProfile = false;
//       let existingPaymentProfileId = null;
//       if (body.messages.message && body.messages.message.length) {
//         // Prefer `description` when available; avoid returning Authorize.Net placeholder '-'.
//         msg = body.messages.message
//           .map((m) => {
//             const text = (m.text ?? '').toString().trim();
//             const desc = (m.description ?? '').toString().trim();
//             if (desc) return desc;
//             if (!text || text === '-') return null;
//             return text;
//           })
//           .filter(Boolean)
//           .join('; ');
//         // E00039: "A duplicate record with ID XXXXXXXX already exists." (payment profile)
//         for (const m of body.messages.message) {
//           if (m.code === 'E00039') {
//             isDuplicatePaymentProfile = true;
//             const text = (m.text ?? '').toString().trim();
//             const desc = (m.description ?? '').toString().trim();
//             const matchSource = desc || text || '';
//             const match = matchSource.match(/\b(\d{5,})\b/);
//             if (match) existingPaymentProfileId = match[1];
//             break;
//           }
//         }
//       }
//       if (isDuplicatePaymentProfile && existingPaymentProfileId) {
//         return { ok: true, isDuplicate: true, paymentProfileId: existingPaymentProfileId };
//       }
//       return { ok: false, message: msg || 'Authorize.Net error' };
//     }
//     const paymentProfileId = body.customerPaymentProfileId || body.customerPaymentProfileID;
//     if (!paymentProfileId) {
//       return { ok: false, message: 'Missing payment profile id' };
//     }
//     return { ok: true, paymentProfileId: String(paymentProfileId) };
//   }

//   _parseDeleteCustomerPaymentProfileResponse(raw) {
//     const body = raw && (raw.deleteCustomerPaymentProfileResponse || raw);
//     if (!body) {
//       return { ok: false, message: 'Invalid delete profile response' };
//     }
//     const rc = body.messages && body.messages.resultCode;
//     if (rc && String(rc).toLowerCase() !== 'ok') {
//       let msg = '';
//       if (body.messages.message && body.messages.message.length) {
//         msg = body.messages.message.map((m) => m.text || m.description).filter(Boolean).join('; ');
//       }
//       return { ok: false, message: msg || 'Delete failed' };
//     }
//     return { ok: true };
//   }

//   _parseCreateTransactionResponse(raw) {
//     const body = raw && (raw.createTransactionResponse || raw);
//     if (!body || !body.transactionResponse) {
//       let topLevelMessage = '';
//       if (body && body.messages && body.messages.message && body.messages.message.length) {
//         topLevelMessage = body.messages.message
//           .map((m) => [m.code, m.text || m.description].filter(Boolean).join(': '))
//           .join('; ');
//       }
//       return {
//         approved: false,
//         transId: null,
//         responseCode: null,
//         authCode: null,
//         message: topLevelMessage || 'Invalid Authorize.Net response',
//       };
//     }

//     const tr = body.transactionResponse;
//     const code = tr.responseCode;
//     const codeStr = code != null ? String(code) : '';
//     // Authorize.Net responseCode:
//     // 1 = approved, 4 = held for review (transaction created but pending review).
//     const approved = codeStr === '1' || codeStr === '4';
//     const heldForReview = codeStr === '4';

//     let message = '';
//     if (tr.messages && tr.messages.message && tr.messages.message.length) {
//       message = tr.messages.message.map((m) => m.description || m.text).filter(Boolean).join('; ');
//     }
//     if (!message && tr.errors && tr.errors.error && tr.errors.error.length) {
//       message = tr.errors.error.map((e) => e.errorText || e.errorCode).join('; ');
//     }

//     return {
//       approved,
//       transId: tr.transId || null,
//       responseCode: codeStr || null,
//       authCode: tr.authCode || null,
//       message: message || (heldForReview ? 'Held for review' : (approved ? 'Approved' : 'Declined')),
//     };
//   }

//   _parseGetTransactionDetailsResponse(raw) {
//     const body = raw && (raw.getTransactionDetailsResponse || raw);
//     const tr = body && body.transaction;
//     if (!tr) {
//       return {
//         transId: null,
//         transactionStatus: null,
//         responseCode: null,
//       };
//     }

//     return {
//       transId: tr.transId || null,
//       transactionStatus: tr.transactionStatus || null,
//       responseCode: tr.responseCode != null ? String(tr.responseCode) : null,
//     };
//   }
// }

// module.exports = new AuthorizeNetPayment();
