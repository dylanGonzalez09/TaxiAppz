const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const compplaintValidation = require('../../../validations/api/auth/complaints.validation');
const complaintController = require('../../../controllers/api/auth/complaints.controller');

const router = express.Router();

router.route('/create').post(auth('Complaint'),validate(compplaintValidation.createComplaint), complaintController.createComplaint);
router.route('/getComplaints').get(auth('Complaint'),validate(compplaintValidation.getComplaints), complaintController.getComplaints);
router.route('/getComplaints/:complaintId').get(auth('Complaint'),validate(compplaintValidation.getComplaint), complaintController.getComplaint);
router.route('/getComplaint/list').get(auth('Complaint'),complaintController.getComplaintWithOutPagination);
router.route('/updateComplaints/:complaintId').patch(auth('Complaint'),validate(compplaintValidation.updateComplaint), complaintController.updateComplaint);
router.route('/deleteComplaints/:complaintId').delete(auth('Complaint'),validate(compplaintValidation.deleteComplaint), complaintController.deleteComplaint);

//suggestion and complaints history

router.route('/history/complaints').get(auth('Complaint'),complaintController.getComplaintList);
router.route('/history/suggestion').get(auth('Complaint'), complaintController.getSuggestionList);
router.route('/type/list').get(auth('Complaint'),complaintController.getComplaintType);
router.route('/getComplaintsByUser/:userId').get(auth('Complaint'),complaintController.getComplaintsByUser);

module.exports = router;

