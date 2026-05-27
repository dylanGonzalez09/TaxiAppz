const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');

const roleRoute = require('../web/privilege/role.route');
const permissionRoute = require('../web/privilege/permissions.route');
const privillegeRoute = require('../web/privilege/privillege.route');
const ProjectVersionRoute = require('../web/master/projectversion.route');
const CategoryRoute = require('../web/master/category.route');
const GroupDocumentRoute = require('../web/master/groupdocument.route');
const AdvertisementRoute = require('../web/master/advertisement.route');

const DocumentRoute = require('../web/master/document.route');
const VehicleRoute = require('../web/master/vehicle.route');
const BrandRoute = require('../web/master/brand.route');
const VehicleModelRoute = require('../web/master/vehiclemodel.route');
const VehicleVariantRoute = require('../web/master/vehiclevariant.route');

const DriverDocumentRoute = require('../web/master/driverdocument.route');
const VehicleDocumentRoute = require('../web/master/vehicledocument.route');

const CancellationReasonRoute = require('../web/master/cancellationReason.route');
const WalletRoute = require('../web/master/wallet.route');

const OutOfZoneRoute = require('../web/zone/outofzone.route');
const ApiTicketRoute = require('../api/auth/ticket.route.js');

const TranslationRoute = require('../boilerplate/translation.route');
const JsonRoute = require('../boilerplate/json.route');
const SettingRoute = require('../boilerplate/setting.route');
const DriverRoute = require('../boilerplate/driver.route');
const DispatcherRoute = require('../boilerplate/dispatcher.route');

const UsersRoute = require('../boilerplate/users.route');
const AdminRoute = require('../boilerplate/admin.route');
const LanguageRoute = require('../boilerplate/language.route');
const CountryRoute = require('../boilerplate/country.route');
const InvoiceQuestionRoute = require('../boilerplate/invoicequestion.route');

const SubscriptionRoute = require('../web/client/subscription.route');

const ClientRoute = require('../web/client/clients.route');
const DemoClientRoute = require('../web/client/democlient.route');

const ImagetRoute = require('../web/client/intro.route');
const ComplaintsRoute = require('../boilerplate/complaints.route');

const ZoneRoute = require('../web/zone/zone.route');
const ZonePriceRoute = require('../web/zone/zoneprice.route');
const ZoneSurgePriceRoute = require('../web/zone/zonesurgeprice.route');
const PromoCodeRoute = require('../web/master/promo.route');
const RequestRoute = require('../web/request/request.route');
const RentalRoute = require('../boilerplate/rental.route');
const FaqRoute = require('../boilerplate/faq.route');
const TicketRoute = require('../boilerplate/ticket.route');
const ClientToken = require('../boilerplate/clientToken.route');

const SosRoute = require('../web/master/sos.route');

const deleteAccountRoute = require('../web/delete/deleteAccount.route');

const docsRoute = require('./docs.route');
const config = require('../../config/config');
require('../../services');

const router = express.Router();

//
// API Routes
// 1. Module Name =  Auth
//    1. languages
const APIDriverSubscriptionRoute = require('../api/auth/driverSubscription.route.js');
const APILanguageRoute = require('../api/auth/language.route');
const APIAuthRoute = require('../api/auth/auth.route');
const APIDriverRoute = require('../api/auth/driver.route');
const APISosRoute = require('../api/auth/sos.route');
const APIComplaintRoute = require('../api/auth/complaints.route');
const APIRequestRoute = require('../api/auth/request.route');
const APIRequestRoute1 = require('../api/request/request.route');
const APIWalletRoute = require('../api/auth/wallet.route');
const APIIntroRoute = require('../api/auth/intro.route');
const APIDriverLocationRoute = require('../api/auth/driver_location.route');
const APIDriverDocumentRoute = require('../api/auth/driver_document.route');
const APIFavoriteRoute = require('../web/master/favourite_place.route');
const APISubscriptionRoute = require('../api/auth/subscription.route');
const APICancellationoute = require('../api/auth/cancellationReason.route');
const APIZoneoute = require('../api/auth/zone.route');
const APIReferralRoute = require('../api/auth/referral.route');
const APIUserRoute = require('../api/auth/user.route');
const APIFaqRoute = require('../api/auth/faq.route');
const APIUserComplaintRoute = require('../api/auth/user_complaint.route');
const sendRoute = require('../api/auth/pushnotification.route');
const mqttRoutes = require('../mqtt/mqtt.route');
const APIRatingRoute = require('../api/auth/rating.route');
const APIPromocodeRoute = require('../api/auth/promo.route');


const WebUserRoute = require('../web/user/user.route');
const WebCountryRoute = require('../web/country/country.route');
const WebSettingsRoute = require('../web/settings/settings.route');
const WebPromoRoute = require('../web/promo/promo.route');
const WebRequestRoute = require('../web/request/request.route');
const WebRentalRoute = require('../web/rental/rental.route');
const WebDriverRoute = require('../web/driver/driver.route');

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/api/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/permission',
    route: permissionRoute,
  },
  {
    path: '/privillege',
    route: privillegeRoute,
  },
  {
    path: '/users',
    route: UsersRoute,
  },
  {
    path: '/admin',
    route: AdminRoute,
  },
  {
    path: '/language',
    route: LanguageRoute,
  },
  {
    path: '/country',
    route: CountryRoute,
  },
  {
    path: '/version',
    route: ProjectVersionRoute,
  },
  {
    path: '/setting',
    route: SettingRoute,
  },
  {
    path: '/translation',
    route: TranslationRoute,
  },
  {
    path: '/json',
    route: JsonRoute,
  },
  {
    path: '/driverDocument',
    route: DriverDocumentRoute,
  },
  {
    path: '/vehicleDocument',
    route: VehicleDocumentRoute,
  },
  {
    path: '/category',
    route: CategoryRoute,
  },
  {
    path: '/groupDocument',
    route: GroupDocumentRoute,
  },
  {
    path: '/advertisement',
    route: AdvertisementRoute,
  },
  {
    path: '/api/advertisement',
    route: AdvertisementRoute,
  },
  {
    path: '/document',
    route: DocumentRoute,
  },
  {
    path: '/vehicle',
    route: VehicleRoute,
  },
  {
    path: '/vehicleModel',
    route: VehicleModelRoute,
  },
  {
    path: '/driver',
    route: DriverRoute,
  },
  {
    path: '/dispatcher',
    route: DispatcherRoute,
  },
  {
    path: '/subscription',
    route: SubscriptionRoute,
  },
  {
    path: '/client',
    route: ClientRoute,
  },
  {
    path: '/democlient',
    route: DemoClientRoute,
  },
  {
    path: '/intro',
    route: ImagetRoute,
  },
  {
    path: '/zone',
    route: ZoneRoute,
  },
  {
    path: '/zoneprice',
    route: ZonePriceRoute,
  },
  {
    path: '/sos',
    route: SosRoute,
  },
  {
    path: '/outOfZone',
    route: OutOfZoneRoute,
  },
  {
    path: '/wallet',
    route: WalletRoute,
  },
  {
    path: '/zonesurgeprice',
    route: ZoneSurgePriceRoute,
  },
  {
    path: '/promocode',
    route: PromoCodeRoute,
  },
  {
    path: '/cancellationReason',
    route: CancellationReasonRoute,
  },
  {
    path: '/complaints',
    route: ComplaintsRoute,
  },
  {
    path: '/request',
    route: RequestRoute,
  },
  {
    path: '/notification',
    route: sendRoute,
  },
  {
    path: '/rental',
    route: RentalRoute,
  },
  {
    path: '/clientToken',
    route: ClientToken,
  },
  {
    path: '/brand',
    route: BrandRoute,
  },
  {
    path: '/vehicleVariant',
    route: VehicleVariantRoute,
  },
  {
    path: '/api/rental',
    route: RentalRoute,
  },
  {
    path: '/invoiceQuestion',
    route: InvoiceQuestionRoute,
  },
  {
    path: '/deleteAccount',
    route: deleteAccountRoute,
  },
  {
    path: '/api/language',
    route: APILanguageRoute,
  },
  {
    path: '/api/user',
    route: APIUserRoute,
  },
  {
    path: '/api/driver',
    route: APIDriverRoute,
  },
  {
    path: '/api/brand',
    route: BrandRoute,
  },
  {
    path: '/api/sos',
    route: APISosRoute,
  },
  {
    path: '/api/complaint',
    route: APIComplaintRoute,
  },
  {
    path: '/api/request',
    route: APIRequestRoute,
  },
  {
    path: '/api/request',
    route: APIRequestRoute1,
  },
  {
    path: '/api/wallet',
    route: APIWalletRoute,
  },
  {
    path: '/api/Intro',
    route: APIIntroRoute,
  },
  {
    path: '/mqtt',
    route: mqttRoutes,
  },
  {
    path: '/api/mqtt',
    route: mqttRoutes,
  },
  {
    path: '/api/driverlocation',
    route: APIDriverLocationRoute,
  },
  {
    path: '/api/driver_document',
    route: APIDriverDocumentRoute,
  },
  {
    path: '/api/favourite',
    route: APIFavoriteRoute,
  },
  {
    path: '/api/subscription',
    route: APISubscriptionRoute,
  },
    {
    path: '/api/driversubscription',
    route: APIDriverSubscriptionRoute,
  },
  {
    path: '/api/cancellationReason',
    route: APICancellationoute,
  },
  {
    path: '/api/zone',
    route: APIZoneoute,
  },
  {
    path: '/api/referral',
    route: APIReferralRoute,
  }, 
  {
    path: '/api/user',
    route: APIUserRoute,
  },
  {
    path: '/api/faq',
    route: APIFaqRoute,
  },
  {
    path: '/api/userComplaint',
    route: APIUserComplaintRoute,
  },
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/api/rating',
    route: APIRatingRoute,
  },
  {
    path: '/api/invoiceQuestion',
    route: InvoiceQuestionRoute,
  },
  {
    path: '/faq',
    route: FaqRoute,
  },
  {
    path: '/ticket',
    route: TicketRoute,
  },
  {
    path: '/api/promocode',
    route: APIPromocodeRoute,
  },
  {
    path: '/api/notification',
    route: sendRoute,
  },
  {
    path: '/api/ticket',
    route: ApiTicketRoute,
  },
  // Web-specific routes (separate from mobile API)
  {
    path: '/web/user',
    route: WebUserRoute,
  },
  {
    path: '/web/country',
    route: WebCountryRoute,
  },
  {
    path: '/web/settings',
    route: WebSettingsRoute,
  },
  {
    path: '/web/promo',
    route: WebPromoRoute,
  },
  {
    path: '/web/request',
    route: WebRequestRoute,
  },
  {
    path: '/web/rental',
    route: WebRentalRoute,
  },
  {
    path: '/web/driver',
    route: WebDriverRoute,
  }
];
const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
