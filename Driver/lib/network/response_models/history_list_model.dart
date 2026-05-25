import 'package:taxiappzpro/network/response_models/trips_model.dart';

class HistoryListModel {
  List<TripModel>? results;
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
      results = <TripModel>[];
      json['results']?.forEach((v) {
        results!.add(TripModel.fromJson(v));
      });
    }
    page = json['page'];
    limit = json['limit'];
    totalPages = json['totalPages'];
    totalResults = json['totalResults'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (results != null) {
      data['results'] = results!.map((v) => v.toJson()).toList();
    }
    data['page'] = page;
    data['limit'] = limit;
    data['totalPages'] = totalPages;
    data['totalResults'] = totalResults;
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
    data['_id'] = sId;
    if (billingDetails != null) {
      data['billingDetails'] = billingDetails!.toJson();
    }
    if (placesDetails != null) {
      data['placesDetails'] = placesDetails!.toJson();
    }
    if (userDetails != null) {
      data['userDetails'] = userDetails!.toJson();
    }
    if (driverDetails != null) {
      data['driverDetails'] = driverDetails!.toJson();
    }
    if (vehicleDetails != null) {
      data['vehicleDetails'] = vehicleDetails!.toJson();
    }
    if (vehicleModelDetails != null) {
      data['vehicleModelDetails'] = vehicleModelDetails!.toJson();
    }
    data['requestNumber'] = requestNumber;
    data['requestOtp'] = requestOtp;
    data['isLater'] = isLater;
    data['isInstantTrip'] = isInstantTrip;
    data['ifDispatch'] = ifDispatch;
    data['zoneTypeId'] = zoneTypeId;
    data['userId'] = userId;
    data['driverId'] = driverId;
    data['tripStartTime'] = tripStartTime;
    data['arrivedAt'] = arrivedAt;
    data['acceptedAt'] = acceptedAt;
    data['completedAt'] = completedAt;
    data['cancelledAt'] = cancelledAt;
    data['isDriverStarted'] = isDriverStarted;
    data['isDriverArrived'] = isDriverArrived;
    data['isTripStart'] = isTripStart;
    data['isCompleted'] = isCompleted;
    data['isCancelled'] = isCancelled;
    data['customReason'] = customReason;
    data['cancelMethod'] = cancelMethod;
    data['totalDistance'] = totalDistance;
    data['totalTime'] = totalTime;
    data['isPaid'] = isPaid;
    data['userRated'] = userRated;
    data['driverRated'] = driverRated;
    data['timezone'] = timezone;
    data['attemptForSchedule'] = attemptForSchedule;
    data['dispatcherId'] = dispatcherId;
    data['driverNotes'] = driverNotes;
    data['createdBy'] = createdBy;
    data['adminDemoKey'] = adminDemoKey;
    data['paymentOpt'] = paymentOpt;
    data['rideType'] = rideType;
    data['unit'] = unit;
    data['requestedCurrencyCode'] = requestedCurrencyCode;
    data['requestedCurrencySymbol'] = requestedCurrencySymbol;
    data['promoId'] = promoId;
    data['locationApprove'] = locationApprove;
    data['holdStatus'] = holdStatus;
    data['availablesStatus'] = availablesStatus;
    data['tripType'] = tripType;
    data['rentalPackage'] = rentalPackage;
    data['manualTrip'] = manualTrip;
    data['outstationId'] = outstationId;
    data['outstationTypeId'] = outstationTypeId;
    data['packageId'] = packageId;
    data['packageItemId'] = packageItemId;
    data['bookingFor'] = bookingFor;
    data['othersUserId'] = othersUserId;
    data['clientId'] = clientId;
    data['pickLat'] = pickLat;
    data['pickLng'] = pickLng;
    data['pickAddress'] = pickAddress;
    data['dropLat'] = dropLat;
    data['dropLng'] = dropLng;
    data['dropAddress'] = dropAddress;
    if (ratingDetails != null) {
      data['ratingDetails'] = ratingDetails!.toJson();
    }
    return data;
  }
}

class BillingDetails {
  String? sId;
  int? basePrice;
  int? baseDistance;
  int? totalDistance;
  int? totalTime;
  int? pricePerDistance;
  int? distancePrice;
  int? pricePerTime;
  int? timePrice;
  int? waitingCharge;
  int? cancellationFee;
  int? serviceTax;
  int? serviceTaxPercentage;
  int? promoDiscount;
  int? adminCommission;
  int? adminCommissionWithTax;
  int? driverCommission;
  int? totalAmount;
  int? subTotal;
  int? outOfZonePrice;
  int? bookingFees;
  int? hillStationPrice;

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
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['basePrice'] = basePrice;
    data['baseDistance'] = baseDistance;
    data['totalDistance'] = totalDistance;
    data['totalTime'] = totalTime;
    data['pricePerDistance'] = pricePerDistance;
    data['distancePrice'] = distancePrice;
    data['pricePerTime'] = pricePerTime;
    data['timePrice'] = timePrice;
    data['waitingCharge'] = waitingCharge;
    data['cancellationFee'] = cancellationFee;
    data['serviceTax'] = serviceTax;
    data['serviceTaxPercentage'] = serviceTaxPercentage;
    data['promoDiscount'] = promoDiscount;
    data['adminCommission'] = adminCommission;
    data['adminCommissionWithTax'] = adminCommissionWithTax;
    data['driverCommission'] = driverCommission;
    data['totalAmount'] = totalAmount;
    data['subTotal'] = subTotal;
    data['outOfZonePrice'] = outOfZonePrice;
    data['bookingFees'] = bookingFees;
    data['hillStationPrice'] = hillStationPrice;
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
    stopLat = json['stopLat'];
    stopLng = json['stopLng'];
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
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['requestId'] = requestId;
    data['pickLat'] = pickLat;
    data['pickLng'] = pickLng;
    data['dropLat'] = dropLat;
    data['dropLng'] = dropLng;
    data['pickAddress'] = pickAddress;
    data['dropAddress'] = dropAddress;
    data['pickUpId'] = pickUpId;
    data['dropId'] = dropId;
    data['stopLat'] = stopLat;
    data['stopLng'] = stopLng;
    data['stopAddress'] = stopAddress;
    data['stopId'] = stopId;
    data['requestPath'] = requestPath;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['polyString'] = polyString;
    data['stops'] = stops;
    data['__v'] = iV;
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
      this.clientId});

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
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['firstName'] = firstName;
    data['lastName'] = lastName;
    data['email'] = email;
    data['phoneNumber'] = phoneNumber;
    data['emergencyNumber'] = emergencyNumber;
    data['gender'] = gender;
    data['language'] = language;
    data['country'] = country;
    data['address'] = address;
    data['active'] = active;
    data['profilePic'] = profilePic;
    data['clientId'] = clientId;
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
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['userId'] = userId;
    data['carNumber'] = carNumber;
    data['firstName'] = firstName;
    data['lastName'] = lastName;
    data['email'] = email;
    data['phoneNumber'] = phoneNumber;
    data['emergencyNumber'] = emergencyNumber;
    data['gender'] = gender;
    data['language'] = language;
    data['country'] = country;
    data['address'] = address;
    data['profilePic'] = profilePic;
    data['active'] = active;
    data['clientId'] = clientId;
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
    final Map<String, dynamic> data = <String, dynamic>{};
    data['vehicleName'] = vehicleName;
    data['image'] = image;
    data['capacity'] = capacity;
    data['serviceType'] = serviceType;
    data['categoryId'] = categoryId;
    data['sortingorder'] = sortingorder;
    data['highlightImage'] = highlightImage;
    data['status'] = status;
    data['clientId'] = clientId;
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
    final Map<String, dynamic> data = <String, dynamic>{};
    data['modelname'] = modelname;
    data['description'] = description;
    data['image'] = image;
    data['vehicleId'] = vehicleId;
    data['status'] = status;
    data['clientId'] = clientId;
    return data;
  }
}

class RatingDetails {
  String? rating;
  String? feedback;
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
    feedback = json['feedback'];
    userId = json['userId'];
    requestId = json['requestId'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    deletedAt = json['deletedAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['rating'] = rating;
    data['feedback'] = feedback;
    data['userId'] = userId;
    data['requestId'] = requestId;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['deletedAt'] = deletedAt;
    return data;
  }
}
