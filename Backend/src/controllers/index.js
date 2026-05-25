module.exports.authController = require('./auth.controller');
module.exports.userController = require('./user.controller');

module.exports.roleController = require('./web/privilege/role.controller');
module.exports.permissionsController = require('./web/privilege/permissions.controller');
module.exports.privillegeController = require('./web/privilege/privilege.controller');
module.exports.versionController = require('./web/master/projectversion.controller');
module.exports.categoryController = require('./web/master/category.controller');
module.exports.groupDocumentController = require('./web/master/groupdocument.controller');
module.exports.documentController = require('./web/master/document.controller');
module.exports.vehicleController = require('./web/master/vehicle.controller');
module.exports.vehicleModelController = require('./web/master/vehiclemodel.controller');

module.exports.driverController = require('./boilerplate/driver.controller');
module.exports.companyController = require('./boilerplate/company.controller');
module.exports.usersController = require('./boilerplate/users.controller');
module.exports.adminController = require('./boilerplate/admin.controller');
module.exports.countryController = require('./boilerplate/country.controller');
module.exports.langageController = require('./boilerplate/language.controller');
module.exports.usersController = require('./boilerplate/users.controller');
module.exports.settingsController = require('./boilerplate/settings.controller');
module.exports.translationController = require('./boilerplate/translation.controller');
module.exports.invoiceQuestionController = require('./boilerplate/invoicequestion.controller');
module.exports.rentalController = require('./boilerplate/rental.controller');
module.exports.subscriptionController = require('./web/client/subscription.controller');
module.exports.introController = require('./web/client/intro.controller');
module.exports.complaintsController = require('./boilerplate/complaints.controller');

module.exports.promoCodeController = require('./web/master/promo.controller');
module.exports.cancellationReasonController = require('./web/master/cancellationReason.controller');
module.exports.WalletController = require('./web/master/wallet.controller');

module.exports.outOfZoneController = require('./web/zone/outofzone.controller');
module.exports.faqController = require('./boilerplate/faq.controller');
module.exports.ticketController = require('./boilerplate/ticket.controller');

module.exports.sosController = require('./web/master/sos.controller');
module.exports.deleteAccountController = require('./web/delete/deleteAccount.controller');
module.exports.fineController = require('./web/master/fine.controller');
