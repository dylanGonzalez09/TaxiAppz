const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const complaintsValidation = require('../../validations/boilerplate/complaints.validation');
const complaintsController = require('../../controllers/boilerplate/complaints.controller');

const router = express.Router();

router
  .route('/create')
  .post(auth('Complaints'), validate(complaintsValidation.createComplaints), complaintsController.createComplaints);
router.route('/getComplaintswithpagination').get(auth('Complaints'), complaintsController.getComplaints);
router.route('/getComplaints/list').get(auth('Complaints'), complaintsController.getComplaintsWithoutPagination);
router
  .route('/updateComplaints/:complaintsId')
  .patch(auth('Complaints'), validate(complaintsValidation.updateComplaints), complaintsController.UpdateComplaints);
router
  .route('/deleteComplaints/:complaintsId')
  .delete(auth('Complaints'), validate(complaintsValidation.deleteComplaints), complaintsController.deleteComplaints);
router.route('/getComplaints/:complaintsId').get(auth('Complaints'), complaintsController.getComplaintsWithoutPagination);
router.patch(
  '/updateComplaintsStatus/:complaintsId',
  auth('Complaints'),
  validate(complaintsValidation.UpdateComplaintsStatus),
  complaintsController.UpdateComplaintsStatus,
);
router.route('/getComplaintsByLanguage/:langId').get(complaintsController.getComplaintsByLanguage);

module.exports = router;
