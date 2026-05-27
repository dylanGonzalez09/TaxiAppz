const ObjectId = require('mongoose').Types.ObjectId;
const { RequestBill } = require('../models');
const logger = require('../config/logger');

/**
 * Merge waiting fare fields from RequestBill onto a trip-shaped payload (HTTP or MQTT).
 * Sets billingDetails.*, billingDetails.waiting object, and root-level mirrors.
 */
const mergeWaitingChargeFromRequestBill = async (requestId, requestData, tripRequestDoc = null) => {
  if (!requestData || !requestId) return;
  try {
    const idStr = typeof requestId === 'object' && requestId?.toString ? requestId.toString() : String(requestId);

    let billDoc = await RequestBill.findOne({ requestId: new ObjectId(idStr) })
      .select(
        'waitingCharge beforeWaitingCharge afterWaitingCharge chargeableWaitingMinutesTotal'
      )
      .lean();

    if (!billDoc) {
      billDoc = await RequestBill.findOne({ requestId: idStr })
        .select(
          'waitingCharge beforeWaitingCharge afterWaitingCharge chargeableWaitingMinutesTotal'
        )
        .lean();
    }

    if (!billDoc && tripRequestDoc?._id) {
      const tid = tripRequestDoc._id;
      billDoc = await RequestBill.findOne({ requestId: tid })
        .select(
          'waitingCharge beforeWaitingCharge afterWaitingCharge chargeableWaitingMinutesTotal'
        )
        .lean();
    }

    if (!requestData.billingDetails) {
      requestData.billingDetails = {};
    }
    const billing = requestData.billingDetails;

    const pickStr = (fromBill, fromView) => {
      if (fromBill !== null && fromBill !== undefined && fromBill !== '') {
        return String(fromBill);
      }
      if (fromView !== null && fromView !== undefined && fromView !== '') {
        return String(fromView);
      }
      return '0';
    };

    if (billDoc) {
      billing.waitingCharge = pickStr(billDoc.waitingCharge, billing.waitingCharge);
      billing.beforeWaitingCharge = pickStr(billDoc.beforeWaitingCharge, billing.beforeWaitingCharge);
      billing.afterWaitingCharge = pickStr(billDoc.afterWaitingCharge, billing.afterWaitingCharge);
      billing.chargeableWaitingMinutesTotal = pickStr(
        billDoc.chargeableWaitingMinutesTotal,
        billing.chargeableWaitingMinutesTotal
      );
      billing.waiting = {
        totalWaitingCharge: Number(billDoc.waitingCharge || 0),
        beforeWaitingCharge: Number(billDoc.beforeWaitingCharge || 0),
        afterWaitingCharge: Number(billDoc.afterWaitingCharge || 0),
        chargeableWaitingMinutesTotal: Number(billDoc.chargeableWaitingMinutesTotal || 0),
      };
    } else {

      billing.waitingCharge = pickStr(null, billing.waitingCharge);
      billing.beforeWaitingCharge = pickStr(null, billing.beforeWaitingCharge);
      billing.afterWaitingCharge = pickStr(null, billing.afterWaitingCharge);
      billing.chargeableWaitingMinutesTotal = pickStr(null, billing.chargeableWaitingMinutesTotal);
      billing.waiting = {
        totalWaitingCharge: Number(billing.waitingCharge) || 0,
        beforeWaitingCharge: Number(billing.beforeWaitingCharge) || 0,
        afterWaitingCharge: Number(billing.afterWaitingCharge) || 0,
        chargeableWaitingMinutesTotal: Number(billing.chargeableWaitingMinutesTotal) || 0,
      };
    }

    requestData.waitingCharge = billing.waitingCharge;
    requestData.beforeWaitingCharge = billing.beforeWaitingCharge;
    requestData.afterWaitingCharge = billing.afterWaitingCharge;
    requestData.chargeableWaitingMinutesTotal = billing.chargeableWaitingMinutesTotal;
    requestData.waiting = billing.waiting;
  } catch (e) {
    logger.warn(`mergeWaitingChargeFromRequestBill: ${e?.message || e}`);
  }
};

module.exports = { mergeWaitingChargeFromRequestBill };
