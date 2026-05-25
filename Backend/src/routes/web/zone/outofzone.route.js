const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const outOfZoneValidation = require('../../../validations/web/zone/outofzone.validation');
const outOfZoneController = require('../../../controllers/web/zone/outofzone.controller');

const router = express.Router();

router.route('/create').post(auth('OutOfZone'),validate(outOfZoneValidation.createOutOfZone), outOfZoneController.createOutOfZone);
router.route('/outofzonewithpagination').get(auth('OutOfZone'), outOfZoneController.getOutOfZones);
router.route('/getOutOfZone/list').get(auth('OutOfZone'),outOfZoneController.getOutOfZoneWithoutPagination);
router.route('/updateOutOfZone/:outOfZoneId').patch(auth('OutOfZone'), validate(outOfZoneValidation.updateOutOfZone), outOfZoneController.UpdateOutOfZone);
router.route('/deleteOutOfZone/:outOfZoneId').delete(auth('OutOfZone'), validate(outOfZoneValidation.deleteOutOfZone), outOfZoneController.deleteOutOfZone);
router.route('/getOutOfZone').get(auth('OutOfZone'), validate(outOfZoneValidation.getOutOfZone), outOfZoneController.getOutOfZoneWithoutPagination);
router.patch('/updateOutOfZoneStatus/:outOfZoneId', auth('OutOfZone'), validate(outOfZoneValidation.UpdateOutOfZoneStatus), outOfZoneController.UpdateOutOfZoneStatus);

module.exports = router;
