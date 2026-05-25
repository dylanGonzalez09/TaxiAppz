const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const faqValidation = require('../../validations/boilerplate/faq.validation');
const faqController = require('../../controllers/boilerplate/faq.controller');

const router = express.Router();

router.route('/create').post(auth('Faq'),validate(faqValidation.createFaq),faqController.createFaq);
router.route('/getFaqwithpagination').get(auth('Faq'),faqController.getFaqs);
router.route('/getFaq/list').get(auth('Faq'),faqController.getFaqWithoutPagination);
router.route('/updateFaq/:faqId').patch(auth('Faq'), validate(faqValidation.updateFaq), faqController.UpdateFaq);
router.route('/deleteFaq/:faqId').delete(auth('Faq'), validate(faqValidation.deleteFaq), faqController.deleteFaq);
router.route('/getFaq/:faqId').get(auth('Faq'),faqController.getFaqWithoutPagination);
router.patch('/updateFaqStatus/:faqId', auth('Faq'), validate(faqValidation.UpdateFaqStatus), faqController.UpdateFaqStatus);
router.route('/getFaqByLanguage/:langId').get( auth('Faq'),faqController.getFaqByLanguage);

module.exports = router;
