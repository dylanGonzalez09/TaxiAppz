/**
 * Sets boolean `isTip` on request/trip payloads (REST + MQTT).
 * Defaults to CARD-only when tip config is absent.
 */
function setIsTipOnTripPayload(payload, tipConfig = {}) {
  if (!payload || typeof payload !== 'object') return;
  const raw =
    payload.paymentOpt !== undefined && payload.paymentOpt !== null
      ? String(payload.paymentOpt)
      : payload.payment_opt !== undefined && payload.payment_opt !== null
        ? String(payload.payment_opt)
        : '';
  const pay = raw.trim().toUpperCase();
  const enabled =
    tipConfig.enabled !== undefined
      ? Boolean(tipConfig.enabled)
      : String(payload.tipEnabled || 'yes').toLowerCase() !== 'no';

  const configuredTypes = Array.isArray(tipConfig.paymentTypes)
    ? tipConfig.paymentTypes
    : typeof payload.tipPaymentTypes === 'string'
      ? payload.tipPaymentTypes.split(',').map((item) => item.trim().toUpperCase())
      : ['CARD'];

  const allowedTypes = configuredTypes.filter((item) => ['CASH', 'CARD', 'WALLET'].includes(item));
  payload.isTip = enabled && allowedTypes.includes(pay);
}

module.exports = { setIsTipOnTripPayload };
