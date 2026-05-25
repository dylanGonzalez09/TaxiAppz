const { model } = require('mongoose');

module.exports.Token = require('./token.model');
module.exports.User = require('./user.model');
module.exports.Role = require('./boilerplate/role.model');
module.exports.Permission = require('./boilerplate/permissions.model');
module.exports.Privillege = require('./boilerplate/privilege.model');
module.exports.Users = require('./boilerplate/users.model');
module.exports.Language = require('./boilerplate/languages.model');
module.exports.Country = require('./boilerplate/country.model');
module.exports.ProjectVersion = require('./boilerplate/projectversion.model');
module.exports.Settings = require('./boilerplate/settings.model');
module.exports.Company = require('./boilerplate/company.model');
module.exports.Category = require('./boilerplate/category.model');
module.exports.GroupDocument = require('./boilerplate/groupdocument.model');
module.exports.Document = require('./boilerplate/document.model');
module.exports.Vehicle = require('./boilerplate/vehicle.model');
module.exports.VehicleModel = require('./boilerplate/vehiclemodel.model');
module.exports.Driver = require('./boilerplate/driver.model');
module.exports.Dispatcher = require('./boilerplate/dispatcher.model');
module.exports.Notification = require('./boilerplate/notification.model');

module.exports.Wallet = require('./boilerplate/wallet.model');
module.exports.WalletTransaction = require('./boilerplate/walletTransaction.model');

module.exports.DriverDocument = require('./boilerplate/driverdocument.model');
module.exports.CancellationReason = require('./boilerplate/cancellationReason.model');

module.exports.SubScription = require('./client/subscription.model');
module.exports.Client = require('./client/clients.model');
module.exports.Demo = require('./client/demo.model');

module.exports.Intro = require('./client/intro.model');

module.exports.Zone = require('./zone/zone.model');
module.exports.ZonePrice = require('./zone/zoneprice.model');
module.exports.ZoneSurgePrice = require('./zone/zonesurgeprice.model');
module.exports.OutOfZone = require('./zone/outofzone.model');

module.exports.PromoCode = require('./boilerplate/promo.model');
module.exports.InvoiceQuestion = require('./boilerplate/invoicequestion.model');

module.exports.Request = require('./boilerplate/request.model');
module.exports.RequestMeta = require('./boilerplate/requestMeta.model');
module.exports.RequestBid = require('./boilerplate/requestBid.model');
module.exports.RequestPlace = require('./boilerplate/requestplaces.model');
module.exports.RequestBill = require('./boilerplate/requestbills.model');
module.exports.RequestDriverData = require('./boilerplate/requestDriverData.model');

module.exports.RequestRating = require('./boilerplate/requestrating.model');
module.exports.MobileOtp = require('./boilerplate/mobileotp.model');
module.exports.Sos = require('./boilerplate/sos.model');
module.exports.Complaints = require('./boilerplate/complaints.model');
module.exports.mqttMessage = require('./mqttMessage.model');
module.exports.FavouritePlace = require('./boilerplate/favourite_place.model');
module.exports.DriverLog = require('./boilerplate/driverlog.model');
module.exports.Referral = require('./boilerplate/referral.model');
module.exports.ReferralAmount = require('./boilerplate/referralAmount.model');
module.exports.CompanySubscription = require('./boilerplate/companySubscription.model');
module.exports.Faq = require('./boilerplate/faq.model');
module.exports.UserComplaint = require('./boilerplate/user_complaint.model');
module.exports.Rental = require('./boilerplate/rental.model');
module.exports.DriverLocation = require('./driverLocation.model');
module.exports.TripDetails =  require('./boilerplate/tripDetails.model');
module.exports.Ticket =  require('./boilerplate/ticket.model')
module.exports.ClientToken =  require('./boilerplate/clientTokens.model');
module.exports.NoDriverTrips = require('./boilerplate/noDriverTrips.model');
module.exports.Fine = require('./boilerplate/fine.model');
module.exports.ErrorLog = require('./boilerplate/errorLog.model');


//views
module.exports.requestListView =  require('./views/requestListView.model');
module.exports.UserInProgressView =  require('./views/userRequestView.model');
module.exports.DriverInProgressView =  require('./views/driverRequestDetailedView.model');
module.exports.DriverBidListView = require('./views/driverBidListView.model');



module.exports.DriverSubscription = require('./boilerplate/driver_subscription.model');

module.exports.PaymentHistory = require('./boilerplate/paymentHistory.model');
module.exports.Counter = require('./boilerplate/counter.model');