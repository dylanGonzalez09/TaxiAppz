const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invoiceQuestionValidation = require('../../validations/boilerplate/invoicequestion.validation');
const invoiceQuestionsController = require('../../controllers/boilerplate/invoicequestion.controller');

const router = express.Router();

router
  .route('/create')
  .post(
    auth('InvoiceQuestions'),
    validate(invoiceQuestionValidation.createInvoiceQuestion),
    invoiceQuestionsController.createInvoiceQuestion,
  );
router.route('/invoicewithpagination').get(auth('InvoiceQuestions'), invoiceQuestionsController.getInvoiceQuestions);
router
  .route('/getInvoiceQuestions/list')
  .get(auth('InvoiceQuestions'), invoiceQuestionsController.getInvoiceQuestionWithoutPagination);
router
  .route('/updateInvoiceQuestions/:invoiceQuestionId')
  .patch(
    auth('InvoiceQuestions'),
    validate(invoiceQuestionValidation.updateInvoiceQuestion),
    invoiceQuestionsController.UpdateInvoiceQuestion,
  );
router
  .route('/deleteInvoiceQuestions/:invoiceQuestionId')
  .delete(
    auth('InvoiceQuestions'),
    validate(invoiceQuestionValidation.deleteInvoiceQuestion),
    invoiceQuestionsController.deleteInvoiceQuestion,
  );
router
  .route('/getInvoiceQuestions')
  .get(
    auth('InvoiceQuestions'),
    validate(invoiceQuestionValidation.getInvoiceQuestions),
    invoiceQuestionsController.getInvoiceQuestionWithoutPagination,
  );
router.patch(
  '/updateInvoiceQuestionsStatus/:invoiceQuestionId',
  auth('InvoiceQuestions'),
  validate(invoiceQuestionValidation.UpdateInvoiceQuestionStatus),
  invoiceQuestionsController.UpdateInvoiceQuestionStatus,
);
router
  .route('/user/getInvoice/list')
  .post(auth('InvoiceQuestions'), invoiceQuestionsController.getUserInvoiceQuestionWithoutPagination);
router
  .route('/driver/getInvoice/list')
  .post(auth('InvoiceQuestions'), invoiceQuestionsController.getDriverInvoiceQuestionWithoutPagination);
router.route('/getQuestionsReport').get(auth('InvoiceQuestions'), invoiceQuestionsController.getQuestionReport);
router.route('/questionReportDetails/:id').get(invoiceQuestionsController.getQuestionDetails);
router.route('/getInvoiceByLanguage/:langId').get(auth('InvoiceQuestions'), invoiceQuestionsController.getInvoiceByLanguage);

module.exports = router;
