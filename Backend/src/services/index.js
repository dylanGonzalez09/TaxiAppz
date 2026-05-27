module.exports.authService = require('./auth.service');
module.exports.emailService = require('./email.service');
module.exports.tokenService = require('./token.service');
module.exports.userService = require('./user.service');

module.exports.roleService = require('./web/privilege/role.service');
module.exports.permissionsService = require('./web/privilege/permissions.service');
module.exports.privilegeService = require('./web/privilege/privilege.service');
module.exports.versionService = require('./web/master/projectversion.service');
module.exports.categoryService = require('./web/master/category.service');
module.exports.groupDocumentService = require('./web/master/groupdocument.service');
module.exports.advertisementService = require('./web/master/advertisement.service');
module.exports.documentService = require('./web/master/document.service');
module.exports.vehicleService = require('./web/master/vehicle.service');
module.exports.vehicleModelService = require('./web/master/vehiclemodel.service');
module.exports.walletService = require('./web/master/wallet.service');

module.exports.driverDocumentService = require('./web/master/driverdocument.service');
module.exports.vehicleDocumentService = require('./web/master/vehicledocument.service');

module.exports.translationService = require('./boilerplate/translation.service');
module.exports.languagesService = require('./boilerplate/languages.service');
module.exports.countryService = require('./boilerplate/country.service');
module.exports.settingService = require('./boilerplate/settings.service');
module.exports.driverService = require('./boilerplate/driver.service');

module.exports.dispatcherService = require('./boilerplate/dispatcher.service');

module.exports.usersService = require('./boilerplate/users.service');
module.exports.adminService = require('./boilerplate/admin.service');
module.exports.invoiceQuestionService = require('./boilerplate/invoicequestion.service');
module.exports.faqService = require('./boilerplate/faq.service');
module.exports.ticketService = require('./boilerplate/ticket.service');
module.exports.clienttokenService = require('./boilerplate/clientToken.service');

module.exports.subscriptionService = require('./web/client/subscription.service');
module.exports.clientService = require('./web/client/clients.service');
module.exports.demoClientService = require('./web/client/democlient.service');

module.exports.introService = require('./web/client/intro.service');
module.exports.brandService = require('./web/master/brand.service');
module.exports.vehicleVariantService = require('./web/master/vehiclevariant.service');

module.exports.zoneService = require('./web/zone/zone.service');
module.exports.zonePriceService = require('./web/zone/zoneprice.service');
module.exports.zoneSurgePriceService = require('./web/zone/zonesurgeprice.service');

module.exports.promoCodeService = require('./web/master/promo.service');
module.exports.cancellationReasonService = require('./web/master/cancellationReason.service');
module.exports.complaintsService = require('./boilerplate/complaints.service');
module.exports.outOfZoneService = require('./web/zone/outofzone.service');

module.exports.requestService = require('./web/request/request.service');
module.exports.deleteAccountService = require('./web/delete/deleteAccount.service');

module.exports.mobilelanguagesService = require('./api/auth/languages.service');
module.exports.mobileauthService = require('./api/auth/auth.service');
module.exports.mobiledriverService = require('./api/auth/driver.service');
module.exports.mobilesosService = require('./api/auth/sos.service');
module.exports.mobilecomplaintsService = require('./api/auth/complaints.service');
module.exports.mobilerequestService = require('./api/auth/request.service');
module.exports.mobilewalletService = require('./api/auth/wallet.service');
module.exports.mobileIntroService = require('./api/auth/intro.service');
module.exports.mobileDriverDocumentService = require('./api/auth/driver_document.service');
module.exports.favouritePlaceService = require('./api/auth/favourite_place.service');
module.exports.mobileZoneService = require('./api/auth/zone.service');

// request management
module.exports.mobilecreateTrip = require('./api/request/createTrip.service');
module.exports.acceptReject = require('./api/request/acceptReject.service');
module.exports.arrived = require('./api/request/arrived.service');
module.exports.startTrip = require('./api/request/startTrip.service');
module.exports.endTrip = require('./api/request/endTrip.service');
module.exports.cancelTrip = require('./api/request/cancel.service');

module.exports.pushNotificationService = require('./api/auth/pushnotification.service');
module.exports.mobilsubscriptionService = require('./api/auth/subscription.service');
module.exports.mobilReferralService = require('./api/auth/referral.service');

module.exports.mobileFaqService = require('./api/auth/faq.service');
module.exports.mobileUserComplaintService = require('./api/auth/user_complaint.service');
module.exports.rentalService = require('./boilerplate/rental.service');
module.exports.mobileratingService = require('./api/auth/rating.service');
module.exports.sosService = require('./web/master/sos.service');
module.exports.mqttService = require('./mqtt/mqtt.service');
module.exports.apipromoCodeService = require('./api/auth/promo.service');

module.exports.phoneInfoService = require('./api/auth/phoneInfo.service');

module.exports.apiticketService = require('./api/auth/ticket.service.js');
module.exports.driverSubscriptionService = require('./api/auth/driver_subscription.service.js');

module.exports.webUserService = require('./web/user/user.service');

