

import 'package:user/network/response_models/trip_model.dart';

class HistoryListModel {
  List<Trip>? results;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  HistoryListModel(
      {this.results,
      this.page,
      this.limit,
      this.totalPages,
      this.totalResults});

  HistoryListModel.fromJson(Map<String, dynamic> json) {
    if (json['results'] != null) {
      results = <Trip>[];
      json['results'].forEach((v) {
        results!.add(Trip.fromJson(v));
      });
    }
    page = json['page'];
    limit = json['limit'];
    totalPages = json['totalPages'];
    totalResults = json['totalResults'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    if (this.results != null) {
      data['results'] = this.results!.map((v) => v.toJson()).toList();
    }
    data['page'] = this.page;
    data['limit'] = this.limit;
    data['totalPages'] = this.totalPages;
    data['totalResults'] = this.totalResults;
    return data;
  }
}

class Results {
  String? sId;
  BillingDetails? billingDetails;
  PlacesDetails? placesDetails;
  UserDetails? userDetails;
  DriverDetails? driverDetails;
  VehicleDetails? vehicleDetails;
  VehicleModelDetails? vehicleModelDetails;
  String? requestNumber;
  int? requestOtp;
  bool? isLater;
  bool? isInstantTrip;
  bool? ifDispatch;
  String? zoneTypeId;
  String? userId;
  String? driverId;
  String? tripStartTime;
  String? arrivedAt;
  String? acceptedAt;
  String? completedAt;
  String? cancelledAt;
  bool? isDriverStarted;
  bool? isDriverArrived;
  bool? isTripStart;
  bool? isCompleted;
  bool? isCancelled;
  String? customReason;
  String? cancelMethod;
  int? totalDistance;
  int? totalTime;
  bool? isPaid;
  bool? userRated;
  bool? driverRated;
  String? timezone;
  int? attemptForSchedule;
  String? dispatcherId;
  String? driverNotes;
  String? createdBy;
  String? adminDemoKey;
  String? paymentOpt;
  String? rideType;
  String? unit;
  String? requestedCurrencyCode;
  String? requestedCurrencySymbol;
  String? promoId;
  bool? locationApprove;
  int? holdStatus;
  int? availablesStatus;
  String? tripType;
  String? rentalPackage;
  String? manualTrip;
  String? outstationId;
  String? outstationTypeId;
  String? packageId;
  String? packageItemId;
  String? bookingFor;
  String? othersUserId;
  String? clientId;
  double? pickLat;
  double? pickLng;
  String? pickAddress;
  double? dropLat;
  double? dropLng;
  String? dropAddress;
  RatingDetails? ratingDetails;

  Results(
      {this.sId,
      this.billingDetails,
      this.placesDetails,
      this.userDetails,
      this.driverDetails,
      this.vehicleDetails,
      this.vehicleModelDetails,
      this.requestNumber,
      this.requestOtp,
      this.isLater,
      this.isInstantTrip,
      this.ifDispatch,
      this.zoneTypeId,
      this.userId,
      this.driverId,
      this.tripStartTime,
      this.arrivedAt,
      this.acceptedAt,
      this.completedAt,
      this.cancelledAt,
      this.isDriverStarted,
      this.isDriverArrived,
      this.isTripStart,
      this.isCompleted,
      this.isCancelled,
      this.customReason,
      this.cancelMethod,
      this.totalDistance,
      this.totalTime,
      this.isPaid,
      this.userRated,
      this.driverRated,
      this.timezone,
      this.attemptForSchedule,
      this.dispatcherId,
      this.driverNotes,
      this.createdBy,
      this.adminDemoKey,
      this.paymentOpt,
      this.rideType,
      this.unit,
      this.requestedCurrencyCode,
      this.requestedCurrencySymbol,
      this.promoId,
      this.locationApprove,
      this.holdStatus,
      this.availablesStatus,
      this.tripType,
      this.rentalPackage,
      this.manualTrip,
      this.outstationId,
      this.outstationTypeId,
      this.packageId,
      this.packageItemId,
      this.bookingFor,
      this.othersUserId,
      this.clientId,
      this.pickLat,
      this.pickLng,
      this.pickAddress,
      this.dropLat,
      this.dropLng,
      this.dropAddress,
      this.ratingDetails});

  Results.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    billingDetails = json['billingDetails'] != null
        ? BillingDetails.fromJson(json['billingDetails'])
        : null;
    placesDetails = json['placesDetails'] != null
        ? PlacesDetails.fromJson(json['placesDetails'])
        : null;
    userDetails = json['userDetails'] != null
        ? UserDetails.fromJson(json['userDetails'])
        : null;
    driverDetails = json['driverDetails'] != null
        ? DriverDetails.fromJson(json['driverDetails'])
        : null;
    vehicleDetails = json['vehicleDetails'] != null
        ? VehicleDetails.fromJson(json['vehicleDetails'])
        : null;
    vehicleModelDetails = json['vehicleModelDetails'] != null
        ? VehicleModelDetails.fromJson(json['vehicleModelDetails'])
        : null;
    requestNumber = json['requestNumber'];
    requestOtp = json['requestOtp'];
    isLater = json['isLater'];
    isInstantTrip = json['isInstantTrip'];
    ifDispatch = json['ifDispatch'];
    zoneTypeId = json['zoneTypeId'];
    userId = json['userId'];
    driverId = json['driverId'];
    tripStartTime = json['tripStartTime'];
    arrivedAt = json['arrivedAt'];
    acceptedAt = json['acceptedAt'];
    completedAt = json['completedAt'];
    cancelledAt = json['cancelledAt'];
    isDriverStarted = json['isDriverStarted'];
    isDriverArrived = json['isDriverArrived'];
    isTripStart = json['isTripStart'];
    isCompleted = json['isCompleted'];
    isCancelled = json['isCancelled'];
    customReason = json['customReason'];
    cancelMethod = json['cancelMethod'];
    totalDistance = json['totalDistance'];
    totalTime = json['totalTime'];
    isPaid = json['isPaid'];
    userRated = json['userRated'];
    driverRated = json['driverRated'];
    timezone = json['timezone'];
    attemptForSchedule = json['attemptForSchedule'];
    dispatcherId = json['dispatcherId'];
    driverNotes = json['driverNotes'];
    createdBy = json['createdBy'];
    adminDemoKey = json['adminDemoKey'];
    paymentOpt = json['paymentOpt'];
    rideType = json['rideType'];
    unit = json['unit'];
    requestedCurrencyCode = json['requestedCurrencyCode'];
    requestedCurrencySymbol = json['requestedCurrencySymbol'];
    promoId = json['promoId'];
    locationApprove = json['locationApprove'];
    holdStatus = json['holdStatus'];
    availablesStatus = json['availablesStatus'];
    tripType = json['tripType'];
    rentalPackage = json['rentalPackage'];
    manualTrip = json['manualTrip'];
    outstationId = json['outstationId'];
    outstationTypeId = json['outstationTypeId'];
    packageId = json['packageId'];
    packageItemId = json['packageItemId'];
    bookingFor = json['bookingFor'];
    othersUserId = json['othersUserId'];
    clientId = json['clientId'];
    pickLat = json['pickLat'];
    pickLng = json['pickLng'];
    pickAddress = json['pickAddress'];
    dropLat = json['dropLat'];
    dropLng = json['dropLng'];
    dropAddress = json['dropAddress'];
    ratingDetails = json['ratingDetails'] != null
        ? RatingDetails.fromJson(json['ratingDetails'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = this.sId;
    if (this.billingDetails != null) {
      data['billingDetails'] = this.billingDetails!.toJson();
    }
    if (this.placesDetails != null) {
      data['placesDetails'] = this.placesDetails!.toJson();
    }
    if (this.userDetails != null) {
      data['userDetails'] = this.userDetails!.toJson();
    }
    if (this.driverDetails != null) {
      data['driverDetails'] = this.driverDetails!.toJson();
    }
    if (this.vehicleDetails != null) {
      data['vehicleDetails'] = this.vehicleDetails!.toJson();
    }
    if (this.vehicleModelDetails != null) {
      data['vehicleModelDetails'] = this.vehicleModelDetails!.toJson();
    }
    data['requestNumber'] = this.requestNumber;
    data['requestOtp'] = this.requestOtp;
    data['isLater'] = this.isLater;
    data['isInstantTrip'] = this.isInstantTrip;
    data['ifDispatch'] = this.ifDispatch;
    data['zoneTypeId'] = this.zoneTypeId;
    data['userId'] = this.userId;
    data['driverId'] = this.driverId;
    data['tripStartTime'] = this.tripStartTime;
    data['arrivedAt'] = this.arrivedAt;
    data['acceptedAt'] = this.acceptedAt;
    data['completedAt'] = this.completedAt;
    data['cancelledAt'] = this.cancelledAt;
    data['isDriverStarted'] = this.isDriverStarted;
    data['isDriverArrived'] = this.isDriverArrived;
    data['isTripStart'] = this.isTripStart;
    data['isCompleted'] = this.isCompleted;
    data['isCancelled'] = this.isCancelled;
    data['customReason'] = this.customReason;
    data['cancelMethod'] = this.cancelMethod;
    data['totalDistance'] = this.totalDistance;
    data['totalTime'] = this.totalTime;
    data['isPaid'] = this.isPaid;
    data['userRated'] = this.userRated;
    data['driverRated'] = this.driverRated;
    data['timezone'] = this.timezone;
    data['attemptForSchedule'] = this.attemptForSchedule;
    data['dispatcherId'] = this.dispatcherId;
    data['driverNotes'] = this.driverNotes;
    data['createdBy'] = this.createdBy;
    data['adminDemoKey'] = this.adminDemoKey;
    data['paymentOpt'] = this.paymentOpt;
    data['rideType'] = this.rideType;
    data['unit'] = this.unit;
    data['requestedCurrencyCode'] = this.requestedCurrencyCode;
    data['requestedCurrencySymbol'] = this.requestedCurrencySymbol;
    data['promoId'] = this.promoId;
    data['locationApprove'] = this.locationApprove;
    data['holdStatus'] = this.holdStatus;
    data['availablesStatus'] = this.availablesStatus;
    data['tripType'] = this.tripType;
    data['rentalPackage'] = this.rentalPackage;
    data['manualTrip'] = this.manualTrip;
    data['outstationId'] = this.outstationId;
    data['outstationTypeId'] = this.outstationTypeId;
    data['packageId'] = this.packageId;
    data['packageItemId'] = this.packageItemId;
    data['bookingFor'] = this.bookingFor;
    data['othersUserId'] = this.othersUserId;
    data['clientId'] = this.clientId;
    data['pickLat'] = this.pickLat;
    data['pickLng'] = this.pickLng;
    data['pickAddress'] = this.pickAddress;
    data['dropLat'] = this.dropLat;
    data['dropLng'] = this.dropLng;
    data['dropAddress'] = this.dropAddress;
    if (this.ratingDetails != null) {
      data['ratingDetails'] = this.ratingDetails!.toJson();
    }
    return data;
  }
}

class BillingDetails {
  String? sId;
  String? basePrice;
  String? baseDistance;
  String? totalDistance;
  String? totalTime;
  String? pricePerDistance;
  String? distancePrice;
  String? pricePerTime;
  String? timePrice;
  String? waitingCharge;
  String? cancellationFee;
  String? serviceTax;
  String? serviceTaxPercentage;
  String? promoDiscount;
  String? adminCommission;
  String? adminCommissionWithTax;
  String? driverCommission;
  String? totalAmount;
  String? subTotal;
  String? outOfZonePrice;
  String? bookingFees;
  String? hillStationPrice;

  BillingDetails(
      {this.sId,
      this.basePrice,
      this.baseDistance,
      this.totalDistance,
      this.totalTime,
      this.pricePerDistance,
      this.distancePrice,
      this.pricePerTime,
      this.timePrice,
      this.waitingCharge,
      this.cancellationFee,
      this.serviceTax,
      this.serviceTaxPercentage,
      this.promoDiscount,
      this.adminCommission,
      this.adminCommissionWithTax,
      this.driverCommission,
      this.totalAmount,
      this.subTotal,
      this.outOfZonePrice,
      this.bookingFees,
      this.hillStationPrice});

  BillingDetails.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    basePrice = json['basePrice'];
    baseDistance = json['baseDistance'];
    totalDistance = json['totalDistance'];
    totalTime = json['totalTime'];
    pricePerDistance = json['pricePerDistance'];
    distancePrice = json['distancePrice'];
    pricePerTime = json['pricePerTime'];
    timePrice = json['timePrice'];
    waitingCharge = json['waitingCharge'];
    cancellationFee = json['cancellationFee'];
    serviceTax = json['serviceTax'];
    serviceTaxPercentage = json['serviceTaxPercentage'];
    promoDiscount = json['promoDiscount'];
    adminCommission = json['adminCommission'];
    adminCommissionWithTax = json['adminCommissionWithTax'];
    driverCommission = json['driverCommission'];
    totalAmount = json['totalAmount'];
    subTotal = json['subTotal'];
    outOfZonePrice = json['outOfZonePrice'];
    bookingFees = json['bookingFees'];
    hillStationPrice = json['hillStationPrice'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['_id'] = this.sId;
    data['basePrice'] = this.basePrice;
    data['baseDistance'] = this.baseDistance;
    data['totalDistance'] = this.totalDistance;
    data['totalTime'] = this.totalTime;
    data['pricePerDistance'] = this.pricePerDistance;
    data['distancePrice'] = this.distancePrice;
    data['pricePerTime'] = this.pricePerTime;
    data['timePrice'] = this.timePrice;
    data['waitingCharge'] = this.waitingCharge;
    data['cancellationFee'] = this.cancellationFee;
    data['serviceTax'] = this.serviceTax;
    data['serviceTaxPercentage'] = this.serviceTaxPercentage;
    data['promoDiscount'] = this.promoDiscount;
    data['adminCommission'] = this.adminCommission;
    data['adminCommissionWithTax'] = this.adminCommissionWithTax;
    data['driverCommission'] = this.driverCommission;
    data['totalAmount'] = this.totalAmount;
    data['subTotal'] = this.subTotal;
    data['outOfZonePrice'] = this.outOfZonePrice;
    data['bookingFees'] = this.bookingFees;
    data['hillStationPrice'] = this.hillStationPrice;
    return data;
  }
}

class PlacesDetails {
  String? sId;
  String? requestId;
  double? pickLat;
  double? pickLng;
  double? dropLat;
  double? dropLng;
  String? pickAddress;
  String? dropAddress;
  String? pickUpId;
  String? dropId;
  String? stopLat;
  String? stopLng;
  String? stopAddress;
  String? stopId;
  String? requestPath;
  String? createdAt;
  String? updatedAt;
  String? polyString;
  int? stops;
  int? iV;

  PlacesDetails(
      {this.sId,
      this.requestId,
      this.pickLat,
      this.pickLng,
      this.dropLat,
      this.dropLng,
      this.pickAddress,
      this.dropAddress,
      this.pickUpId,
      this.dropId,
      this.stopLat,
      this.stopLng,
      this.stopAddress,
      this.stopId,
      this.requestPath,
      this.createdAt,
      this.updatedAt,
      this.polyString,
      this.stops,
      this.iV});

  PlacesDetails.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    requestId = json['requestId'];
    pickLat = json['pickLat'];
    pickLng = json['pickLng'];
    dropLat = json['dropLat'];
    dropLng = json['dropLng'];
    pickAddress = json['pickAddress'];
    dropAddress = json['dropAddress'];
    pickUpId = json['pickUpId'];
    dropId = json['dropId'];
    stopLat = json['stopLat'].toString();
    stopLng = json['stopLng'].toString();
    stopAddress = json['stopAddress'];
    stopId = json['stopId'];
    requestPath = json['requestPath'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    polyString = json['polyString'];
    stops = json['stops'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['_id'] = this.sId;
    data['requestId'] = this.requestId;
    data['pickLat'] = this.pickLat;
    data['pickLng'] = this.pickLng;
    data['dropLat'] = this.dropLat;
    data['dropLng'] = this.dropLng;
    data['pickAddress'] = this.pickAddress;
    data['dropAddress'] = this.dropAddress;
    data['pickUpId'] = this.pickUpId;
    data['dropId'] = this.dropId;
    data['stopLat'] = this.stopLat;
    data['stopLng'] = this.stopLng;
    data['stopAddress'] = this.stopAddress;
    data['stopId'] = this.stopId;
    data['requestPath'] = this.requestPath;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['polyString'] = this.polyString;
    data['stops'] = this.stops;
    data['__v'] = this.iV;
    return data;
  }
}

class UserDetails {
  String? sId;
  String? firstName;
  String? lastName;
  String? email;
  String? phoneNumber;
  String? emergencyNumber;
  String? gender;
  String? language;
  String? country;
  String? address;
  bool? active;
  String? profilePic;
  String? clientId;
  String? zoneId;

  UserDetails(
      {this.sId,
      this.firstName,
      this.lastName,
      this.email,
      this.phoneNumber,
      this.emergencyNumber,
      this.gender,
      this.language,
      this.country,
      this.address,
      this.active,
      this.profilePic,
      this.clientId,
      this.zoneId});

  UserDetails.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    email = json['email'];
    phoneNumber = json['phoneNumber'];
    emergencyNumber = json['emergencyNumber'];
    gender = json['gender'];
    language = json['language'];
    country = json['country'];
    address = json['address'];
    active = json['active'];
    profilePic = json['profilePic'];
    clientId = json['clientId'];
    zoneId = json['zoneId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['_id'] = this.sId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['email'] = this.email;
    data['phoneNumber'] = this.phoneNumber;
    data['emergencyNumber'] = this.emergencyNumber;
    data['gender'] = this.gender;
    data['language'] = this.language;
    data['country'] = this.country;
    data['address'] = this.address;
    data['active'] = this.active;
    data['profilePic'] = this.profilePic;
    data['clientId'] = this.clientId;
    data['zoneId'] = this.zoneId;
    return data;
  }
}

class DriverDetails {
  String? sId;
  String? userId;
  String? carNumber;
  String? firstName;
  String? lastName;
  String? email;
  String? phoneNumber;
  String? emergencyNumber;
  String? gender;
  String? language;
  String? country;
  String? address;
  String? profilePic;
  bool? active;
  String? clientId;

  DriverDetails(
      {this.sId,
      this.userId,
      this.carNumber,
      this.firstName,
      this.lastName,
      this.email,
      this.phoneNumber,
      this.emergencyNumber,
      this.gender,
      this.language,
      this.country,
      this.address,
      this.profilePic,
      this.active,
      this.clientId});

  DriverDetails.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    userId = json['userId'];
    carNumber = json['carNumber'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    email = json['email'];
    phoneNumber = json['phoneNumber'];
    emergencyNumber = json['emergencyNumber'];
    gender = json['gender'];
    language = json['language'];
    country = json['country'];
    address = json['address'];
    profilePic = json['profilePic'];
    active = json['active'];
    clientId = json['clientId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['_id'] = this.sId;
    data['userId'] = this.userId;
    data['carNumber'] = this.carNumber;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['email'] = this.email;
    data['phoneNumber'] = this.phoneNumber;
    data['emergencyNumber'] = this.emergencyNumber;
    data['gender'] = this.gender;
    data['language'] = this.language;
    data['country'] = this.country;
    data['address'] = this.address;
    data['profilePic'] = this.profilePic;
    data['active'] = this.active;
    data['clientId'] = this.clientId;
    return data;
  }
}

class VehicleDetails {
  String? vehicleName;
  String? image;
  int? capacity;
  String? serviceType;
  String? categoryId;
  int? sortingorder;
  String? highlightImage;
  bool? status;
  String? clientId;

  VehicleDetails(
      {this.vehicleName,
      this.image,
      this.capacity,
      this.serviceType,
      this.categoryId,
      this.sortingorder,
      this.highlightImage,
      this.status,
      this.clientId});

  VehicleDetails.fromJson(Map<String, dynamic> json) {
    vehicleName = json['vehicleName'];
    image = json['image'];
    capacity = json['capacity'];
    serviceType = json['serviceType'];
    categoryId = json['categoryId'];
    sortingorder = json['sortingorder'];
    highlightImage = json['highlightImage'];
    status = json['status'];
    clientId = json['clientId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['vehicleName'] = this.vehicleName;
    data['image'] = this.image;
    data['capacity'] = this.capacity;
    data['serviceType'] = this.serviceType;
    data['categoryId'] = this.categoryId;
    data['sortingorder'] = this.sortingorder;
    data['highlightImage'] = this.highlightImage;
    data['status'] = this.status;
    data['clientId'] = this.clientId;
    return data;
  }
}

class VehicleModelDetails {
  String? modelname;
  String? description;
  String? image;
  String? vehicleId;
  bool? status;
  String? clientId;

  VehicleModelDetails(
      {this.modelname,
      this.description,
      this.image,
      this.vehicleId,
      this.status,
      this.clientId});

  VehicleModelDetails.fromJson(Map<String, dynamic> json) {
    modelname = json['modelname'];
    description = json['description'];
    image = json['image'];
    vehicleId = json['vehicleId'];
    status = json['status'];
    clientId = json['clientId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['modelname'] = this.modelname;
    data['description'] = this.description;
    data['image'] = this.image;
    data['vehicleId'] = this.vehicleId;
    data['status'] = this.status;
    data['clientId'] = this.clientId;
    return data;
  }
}

class RatingDetails {
  int? rating;
  List<Feedback>? feedback;
  String? userId;
  String? requestId;
  String? createdAt;
  String? updatedAt;
  String? deletedAt;

  RatingDetails(
      {this.rating,
      this.feedback,
      this.userId,
      this.requestId,
      this.createdAt,
      this.updatedAt,
      this.deletedAt});

  RatingDetails.fromJson(Map<String, dynamic> json) {
    rating = json['rating'];
    if (json['feedback'] != null) {
      feedback = <Feedback>[];
      json['feedback'].forEach((v) {
        feedback!.add(new Feedback.fromJson(v));
      });
    }
    userId = json['userId'];
    requestId = json['requestId'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    deletedAt = json['deletedAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data['rating'] = this.rating;
    if (this.feedback != null) {
      data['feedback'] = this.feedback!.map((v) => v.toJson()).toList();
    }
    data['userId'] = this.userId;
    data['requestId'] = this.requestId;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['deletedAt'] = this.deletedAt;
    return data;
  }
}

class Feedback {
  bool? status;
  String? id;
  String? question;

  Feedback({this.status, this.id, this.question});

  Feedback.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    id = json['id'];
    question = json['question'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['status'] = this.status;
    data['id'] = this.id;
    data['question'] = this.question;
    return data;
  }
}