const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const cancellationReasonValidation = require('../../../validations/web/master/cancellationReason.validation');
const cancellationReasonController = require('../../../controllers/api/auth/cancellationReason.controller');

const router = express.Router();

router
  .route('/create')
  .post(
    auth('CancellationReason'),
    validate(cancellationReasonValidation.createCancellation),
    cancellationReasonController.createCancellation,
  );
router
  .route('/getCancellationsWithPagination')
  .get(auth('CancellationReason'), cancellationReasonController.getCancellations);
router
  .route('/getCancellation/list')
  .post(auth('CancellationReason'), cancellationReasonController.getCancellationWithoutPagination);
router
  .route('/user/getCancellation/list')
  .post(auth('CancellationReason'), cancellationReasonController.getUserCancellationWithoutPagination);
router
  .route('/updateCancellations/:cancellationId')
  .patch(
    auth('CancellationReason'),
    validate(cancellationReasonValidation.updateCancellation),
    cancellationReasonController.UpdateCancellation,
  );
router
  .route('/deleteCancellations/:cancellationId')
  .delete(
    auth('CancellationReason'),
    validate(cancellationReasonValidation.deleteCancellation),
    cancellationReasonController.deleteCancellation,
  );
router
  .route('/getCancellation')
  .get(
    auth('CancellationReason'),
    validate(cancellationReasonValidation.getCancellations),
    cancellationReasonController.getCancellationWithoutPagination,
  );
router.patch(
  '/UpdateCancellationStatus/:cancellationId',
  auth('CancellationReason'),
  validate(cancellationReasonValidation.UpdateCancellationStatus),
  cancellationReasonController.UpdateCancellationStatus,
);

module.exports = router;
