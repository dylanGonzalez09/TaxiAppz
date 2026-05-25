const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const promoCodeValidation = require('../../../validations/web/master/promo.validation');
const promoCodeController = require('../../../controllers/web/master/promo.controller');
const multer = require('multer');
const upload = multer(); 


const router = express.Router();

router.route('/create').post(auth('PromoCode'),upload.none(),promoCodeController.createPromoCode);
router.route('/getPromoCodesWithPagination').get(auth('PromoCode'), promoCodeController.getPromoCodes);
router.route('/getPromoCodes/:promoCodeId').get(auth('PromoCode'), validate(promoCodeValidation.getPromoCode), promoCodeController.getPromoCode);
router.route('/updatePromoCodes/:promoCodeId').patch(auth('PromoCode'), validate(promoCodeValidation.updatePromoCode),upload.none(),promoCodeController.updatePromoCode);
router.route('/deletePromoCodes/:promoCodeId').delete(auth('PromoCode'), validate(promoCodeValidation.deletePromoCode), promoCodeController.deletePromoCode);
router.route('/getPromoCode').get(auth('PromoCode'), validate(promoCodeValidation.getPromoCodes), promoCodeController.getPromosWithoutPagination);
router.patch('/updatePromoCodeStatus/:promoCodeId', auth('PromoCode'), validate(promoCodeValidation.updatePromoStatus), promoCodeController.updatePromoStatus);
router.route('/getDropDown/list/:clientId').get(promoCodeController.getDropDownList);
router.route('/getPromoDropDown/list/:clientId').get(promoCodeController.getPromoCodeDropDownList);
router.route('/getPromoUseReport').get(promoCodeController.getPromoUseReport);
router.route('/expired-promo').get(promoCodeController.getExpiredPromo);

module.exports = router;
