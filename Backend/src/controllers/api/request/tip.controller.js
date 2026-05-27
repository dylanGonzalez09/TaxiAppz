const httpStatus = require('../../../utils/httpStatus');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const Response = require('../../../config/response');
// const authorizeNet = require('../../../config/authorizeNet');
const {
  Request,
  RequestBill,
  Settings,
  requestListView,
  Driver,
  Wallet,
  WalletTransaction,
  AuthorizeNetPaymentMethod,
} = require('../../../models');
const { setIsTipOnTripPayload } = require('../../../utils/tripIsTip.util');
const { walletTransaction } = require('../../../utils/commonFunction');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Mobile calls this when user selects a tip.
 * - If `isPercentage=true`, `tipAmount` is treated as % and converted to money using current (base) total.
 * - If `isPercentage=false`, `tipAmount` is treated as fixed money.
 *
 * Updates `RequestBill.tipAmount`, `RequestBill.isPercentage` and recalculates invoice totals.
 */
const updateTip = catchAsync(async (req, res) => {
  const { requestId, tipAmount, isPercentage } = req.body;
  const tripRequest = await Request.findById(requestId)
    .select(
      'paymentOpt clientId finalAmount driverId userId',
    )
    .lean();
  if (!tripRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const tipSettings = await Settings.find({
    // clientId: tripRequest.clientId,
    name: { $in: ['tipEnabled', 'tipPaymentTypes'] },
  })
    .select('name value')
    .lean();

  const tipEnabledSetting = tipSettings.find((item) => item.name === 'tipEnabled')?.value;
  const paymentTypesRaw = tipSettings.find((item) => item.name === 'tipPaymentTypes')?.value;
  const tipEnabled = String(tipEnabledSetting || 'yes').toLowerCase() !== 'no';
  const tipPaymentTypes = (
    typeof paymentTypesRaw === 'string' && paymentTypesRaw.trim() !== ''
      ? paymentTypesRaw.split(',').map((item) => item.trim().toUpperCase())
      : ['WALLET']
  ).filter((item) => ['CASH', 'CARD', 'WALLET'].includes(item));
  if (!tipEnabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tip is disabled');
  }

  const currentPaymentType = String(tripRequest.paymentOpt || '').toUpperCase();

// Tip support is not available for card payments.that is implemented in a later phase.

  if (!tipPaymentTypes.includes(currentPaymentType) || currentPaymentType === 'CARD') {
    throw new ApiError(httpStatus.BAD_REQUEST, `Tip is not available for ${currentPaymentType || 'UNKNOWN'} payment type`);
  }

  const requestBill = await RequestBill.findOne({ requestId: new ObjectId(requestId) });
  if (!requestBill) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request invoice (RequestBill) not found');
  }

  const previousTipAmount = Number(requestBill.tipAmount || 0);

  // let tipPaymentIntentId =
  //   tripRequest.cardCaptureTransactionId ||
  //   tripRequest.cardAdditionalChargeTransactionId ||
  //   tripRequest.cardHoldTransactionId ||
  //   `${String(requestId)}`;

  const baseTotal = Math.max(0, Number(requestBill.totalAmount || 0) - previousTipAmount);

  const rawTipAmount = Number(tipAmount);
  const tipMoney = isPercentage === true ? (baseTotal * rawTipAmount) / 100 : rawTipAmount;

  const computedTipMoney = Number((tipMoney || 0).toFixed(2));
  const updatedTotal = Number((baseTotal + computedTipMoney).toFixed(2));
  const isTipPaid = computedTipMoney > 0;

  requestBill.tipAmount = computedTipMoney;
  requestBill.isPercentage = Boolean(isPercentage);
  // requestBill.totalAmount = updatedTotal;

  // Keep finalAmount consistent if it exists (PARCEL trips may keep it null)
  if (requestBill.totalAmount !== null && requestBill.totalAmount !== undefined) {
    requestBill.totalAmount = updatedTotal;
  }

  await requestBill.save();

  // Credit the tip delta to the driver's wallet
  const tipDelta = Number((computedTipMoney - previousTipAmount).toFixed(2));
  if (tipDelta !== 0 && tripRequest.driverId) {
    try {
      const ensureUserTipLedger = async () => {
        if (!tripRequest?.userId) return;

        const tipPurpose = tipDelta > 0 ? 'Tip' : 'Tip Adjustment';
        const userTipType = tipDelta > 0 ? 'Spent' : 'Earned';
        const userTipAmountAbs = Math.abs(tipDelta);

        const existingUserTipTx = await WalletTransaction.findOne({
          requestId: tripRequest._id,
          userId: tripRequest.userId,
          purpose: tipPurpose,
          type: userTipType,
          amount: userTipType === 'Spent' ? -userTipAmountAbs : userTipAmountAbs,
        })
          .select('_id')
          .lean();

        if (existingUserTipTx) return;

        await walletTransaction(
          userTipAmountAbs,
          tripRequest.userId,
          userTipType,
          tipPurpose,
          tripRequest._id,
          null,
          tripRequest.clientId || null,
        );
      };

      // For CARD trips: charge the positive tip delta directly from saved card
      // and persist gateway transaction id in wallet transaction history.
      // if (currentPaymentType === 'CARD' && tipDelta > 0) {
      //   let customerProfileId = tripRequest.cardCustomerProfileId || null;
      //   let paymentProfileId = tripRequest.cardPaymentProfileId || null;

      //   // Fallback: use user's default/latest saved card when request card profile is missing.
      //   if (!customerProfileId || !paymentProfileId) {
      //     const userIdForCardLookup = tripRequest.userId || req.user?.id || null;
      //     if (!userIdForCardLookup) {
      //       throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve user for tip card payment');
      //     }

      //     const savedMethod = await AuthorizeNetPaymentMethod.findOne({ userId: userIdForCardLookup })
      //       .sort({ isDefault: -1, createdAt: -1 })
      //       .select('customerProfileId paymentProfileId')
      //       .lean();

      //     customerProfileId = savedMethod?.customerProfileId || null;
      //     paymentProfileId = savedMethod?.paymentProfileId || null;
      //   }

      //   if (!customerProfileId || !paymentProfileId) {
      //     throw new ApiError(httpStatus.BAD_REQUEST, 'Saved card profile not found for tip payment');
      //   }

      //   const tipCurrency = 'CAD';

      //   const tipChargeResult = await authorizeNet.chargeCustomerProfile(
      //     {
      //       customerProfileId,
      //       paymentProfileId,
      //       amount: Number(Math.abs(tipDelta).toFixed(2)),
      //       currency: tipCurrency,
      //       authOnly: false,
      //     },
      //     req
      //   );

      //   console.log('Authorize.Net chargeCustomerProfile result for tip:', tipChargeResult);

      //   const chargedTxnId =
      //     tipChargeResult?.transactionId ||
      //     tipChargeResult?.transId ||
      //     tipChargeResult?.id ||
      //     null;

      //   if (!chargedTxnId) {
      //     throw new ApiError(httpStatus.BAD_REQUEST, 'Tip card payment failed: transaction id missing');
      //   }

      //   tipPaymentIntentId = chargedTxnId;
      // }

      await ensureUserTipLedger();

      // Try by Driver._id first, then fallback to Driver.userId match
      let driverDoc = await Driver.findById(tripRequest.driverId).lean();
      if (!driverDoc) {
        driverDoc = await Driver.findOne({ userId: tripRequest.driverId }).lean();
      }

      if (!driverDoc) {
        console.error(`[updateTip] Driver not found for driverId=${tripRequest.driverId} requestId=${requestId}`);
      } else if (!driverDoc.userId) {
        console.error(`[updateTip] Driver has no userId driverId=${tripRequest.driverId}`);
      } else {
        const tipType = tipDelta > 0 ? 'Earned' : 'Spent';
        const tipPurpose = tipDelta > 0 ? 'Tip' : 'Tip Adjustment';
        const clientId = driverDoc.clientId || tripRequest.clientId || null;

        await walletTransaction(
          Math.abs(tipDelta),
          driverDoc.userId,
          tipType,
          tipPurpose,
          tripRequest._id,
          
        );
      }
    } catch (walletErr) {
      // Log the error but do NOT fail the tip API — the RequestBill is already saved
      console.error(`[updateTip] Failed to credit driver wallet for tip: ${walletErr?.message || walletErr}`);

      // Record the failed transaction so it appears in transaction history
      try {
        let driverDoc = await Driver.findById(tripRequest.driverId).lean();
        if (!driverDoc) driverDoc = await Driver.findOne({ userId: tripRequest.driverId }).lean();
        if (driverDoc?.userId) {
          const driverWallet = await Wallet.findOne({ userId: driverDoc.userId });
          if (driverWallet) {
            await WalletTransaction.create({
              walletId: driverWallet._id,
              amount: Math.abs(tipDelta),
              purpose: 'Tip',
              requestId: tripRequest._id,
              type: 'Earned',
              userId: driverDoc.userId,
              status: 'failed',
              failureReason: walletErr?.message || 'Wallet credit failed',
              paymentIntentId: tipPaymentIntentId,
              paymentId: tipPaymentIntentId,
              paymentMethod: String(tripRequest.paymentOpt || '').toUpperCase() || null,
              sourceModule: 'api.request.tip',
              sourceApi: 'updateTip',
              ...(driverDoc.clientId && { clientId: driverDoc.clientId }),
            });
          }
        }
      } catch (recordErr) {
        console.error(`[updateTip] Failed to record failed tip transaction: ${recordErr?.message || recordErr}`);
      }
    }
  }

  // Update Request.finalAmount too (some UI/reporting may use it).
  const tripRequestDoc = await Request.findById(requestId);
  if (tripRequestDoc && tripRequestDoc.totalAmount !== null && tripRequestDoc.totalAmount !== undefined) {
    tripRequestDoc.totalAmount = requestBill.totalAmount ?? updatedTotal;
    await tripRequestDoc.save();
  }

  // Return updated trip row for invoice UI
  const rows = await requestListView.aggregate([{ $match: { _id: new ObjectId(requestId) } }]);

  const trip = rows?.[0] || null;
  if (trip) {
    setIsTipOnTripPayload(trip, { enabled: tipEnabled, paymentTypes: tipPaymentTypes });
    trip.isTipPaid = isTipPaid;
  }

  const responseData = {
    trip,
    billingDetails: trip?.billingDetails || null,
    tipAmount: computedTipMoney,
    isPercentage: Boolean(isPercentage),
    isTipPaid,
  };

  const response = Response(true, responseData, 'Tip updated successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  updateTip,
};
