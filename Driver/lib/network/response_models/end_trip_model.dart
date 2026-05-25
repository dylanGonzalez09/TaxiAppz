class EndTripModel {
  String? sId;
  BillingDetails? billingDetails;
  User? user;
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
  bool? isDriverStarted;
  bool? isDriverArrived;
  bool? isTripStart;
  bool? isCompleted;
  bool? isCancelled;

  int? totalDistance;
  int? totalTime;
  bool? isPaid;
  bool? userRated;
  bool? driverRated;
  int? attemptForSchedule;
  String? paymentOpt;
  String? rideType;
  String? requestedCurrencyCode;
  String? requestedCurrencySymbol;
  bool? locationApprove;
  int? availablesStatus;
  String? tripType;
  String? bookingFor;
  double? pickLat;
  double? pickLng;
  String? pickAddress;
  double? dropLat;
  double? dropLng;
  String? dropAddress;
  Driver? driver;
  RatingDetails? ratingDetails;
  VehicleDetails? vehicleDetails;
  VehicleModelDetails? vehicleModelDetails;

  EndTripModel(
      {this.sId,
      this.billingDetails,
      this.user,
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
      this.isDriverStarted,
      this.isDriverArrived,
      this.isTripStart,
      this.isCompleted,
      this.isCancelled,
      this.totalDistance,
      this.totalTime,
      this.isPaid,
      this.userRated,
      this.driverRated,
      this.attemptForSchedule,
      this.paymentOpt,
      this.rideType,
      this.requestedCurrencyCode,
      this.requestedCurrencySymbol,
      this.locationApprove,
      this.availablesStatus,
      this.tripType,
      this.bookingFor,
      this.pickLat,
      this.pickLng,
      this.pickAddress,
      this.dropLat,
      this.dropLng,
      this.dropAddress,
      this.driver,
      this.ratingDetails,
      this.vehicleDetails,
      this.vehicleModelDetails});

  EndTripModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    billingDetails = json['billingDetails'] != null
        ? BillingDetails.fromJson(json['billingDetails'])
        : null;
    user = json['user'] != null ? User.fromJson(json['user']) : null;
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
    isDriverStarted = json['isDriverStarted'];
    isDriverArrived = json['isDriverArrived'];
    isTripStart = json['isTripStart'];
    isCompleted = json['isCompleted'];
    isCancelled = json['isCancelled'];
    totalDistance = json['totalDistance'];
    totalTime = json['totalTime'];
    isPaid = json['isPaid'];
    userRated = json['userRated'];
    driverRated = json['driverRated'];
    attemptForSchedule = json['attemptForSchedule'];
    paymentOpt = json['paymentOpt'];
    rideType = json['rideType'];
    requestedCurrencyCode = json['requestedCurrencyCode'];
    requestedCurrencySymbol = json['requestedCurrencySymbol'];

    locationApprove = json['locationApprove'];
    availablesStatus = json['availablesStatus'];
    tripType = json['tripType'];
    bookingFor = json['bookingFor'];
    pickLat = json['pickLat'];
    pickLng = json['pickLng'];
    pickAddress = json['pickAddress'];
    dropLat = json['dropLat'];
    dropLng = json['dropLng'];
    dropAddress = json['dropAddress'];
    driver = json['driver'] != null ? Driver.fromJson(json['driver']) : null;
    ratingDetails = json['ratingDetails'] != null
        ? RatingDetails.fromJson(json['ratingDetails'])
        : null;
    vehicleDetails = json['vehicleDetails'] != null
        ? VehicleDetails.fromJson(json['vehicleDetails'])
        : null;
    vehicleModelDetails = json['vehicleModelDetails'] != null
        ? VehicleModelDetails.fromJson(json['vehicleModelDetails'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    if (billingDetails != null) {
      data['billingDetails'] = billingDetails!.toJson();
    }
    if (user != null) {
      data['user'] = user!.toJson();
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
    data['isDriverStarted'] = isDriverStarted;
    data['isDriverArrived'] = isDriverArrived;
    data['isTripStart'] = isTripStart;
    data['isCompleted'] = isCompleted;
    data['isCancelled'] = isCancelled;
    data['totalDistance'] = totalDistance;
    data['totalTime'] = totalTime;
    data['isPaid'] = isPaid;
    data['userRated'] = userRated;
    data['driverRated'] = driverRated;
    data['attemptForSchedule'] = attemptForSchedule;
    data['paymentOpt'] = paymentOpt;
    data['rideType'] = rideType;
    data['requestedCurrencyCode'] = requestedCurrencyCode;
    data['requestedCurrencySymbol'] = requestedCurrencySymbol;
    data['locationApprove'] = locationApprove;
    data['availablesStatus'] = availablesStatus;
    data['tripType'] = tripType;
    data['bookingFor'] = bookingFor;
    data['pickLat'] = pickLat;
    data['pickLng'] = pickLng;
    data['pickAddress'] = pickAddress;
    data['dropLat'] = dropLat;
    data['dropLng'] = dropLng;
    data['dropAddress'] = dropAddress;
    if (driver != null) {
      data['driver'] = driver!.toJson();
    }
    if (ratingDetails != null) {
      data['ratingDetails'] = ratingDetails!.toJson();
    }
    if (vehicleDetails != null) {
      data['vehicleDetails'] = vehicleDetails!.toJson();
    }
    if (vehicleModelDetails != null) {
      data['vehicleModelDetails'] = vehicleModelDetails!.toJson();
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

class User {
  String? sId;
  String? firstName;
  String? lastName;
  dynamic email;
  String? phoneNumber;
  dynamic emergencyNumber;
  String? referralCode;
  dynamic gender;
  dynamic language;
  String? country;
  dynamic address;
  bool? active;
  dynamic profilePic;
  dynamic password;
  String? clientId;

  User(
      {this.sId,
      this.firstName,
      this.lastName,
      this.email,
      this.phoneNumber,
      this.emergencyNumber,
      this.referralCode,
      this.gender,
      this.language,
      this.country,
      this.address,
      this.active,
      this.profilePic,
      this.password,
      this.clientId});

  User.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    email = json['email'];
    phoneNumber = json['phoneNumber'];
    emergencyNumber = json['emergencyNumber'];
    referralCode = json['referralCode'];
    gender = json['gender'];
    language = json['language'];
    country = json['country'];
    address = json['address'];
    active = json['active'];
    profilePic = json['profilePic'] is String ? json['profilePic'] : null;
    password = json['password'];
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
    data['referralCode'] = referralCode;
    data['gender'] = gender;
    data['language'] = language;
    data['country'] = country;
    data['address'] = address;
    data['active'] = active;
    data['profilePic'] = profilePic;
    data['password'] = password;
    data['clientId'] = clientId;
    return data;
  }
}

class Driver {
  String? sId;
  String? userId;
  String? carNumber;
  String? firstName;
  String? lastName;
  dynamic email;
  String? phoneNumber;
  dynamic emergencyNumber;
  dynamic gender;
  dynamic language;
  String? country;
  dynamic address;
  dynamic profilePic;
  bool? active;

  Driver(
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
      this.active});

  Driver.fromJson(Map<String, dynamic> json) {
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
    return data;
  }
}

class RatingDetails {
  dynamic rating;
  dynamic feedback;
  dynamic userId;
  dynamic requestId;
  dynamic createdAt;
  dynamic updatedAt;
  dynamic deletedAt;

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

class VehicleDetails {
  String? sId;
  String? vehicleName;
  String? image;
  int? capacity;
  String? serviceType;
  String? categoryId;
  int? sortingorder;
  String? highlightImage;
  bool? status;
  String? clientId;
  String? createdAt;
  String? updatedAt;
  int? iV;

  VehicleDetails(
      {this.sId,
      this.vehicleName,
      this.image,
      this.capacity,
      this.serviceType,
      this.categoryId,
      this.sortingorder,
      this.highlightImage,
      this.status,
      this.clientId,
      this.createdAt,
      this.updatedAt,
      this.iV});

  VehicleDetails.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    vehicleName = json['vehicleName'];
    image = json['image'];
    capacity = json['capacity'];
    serviceType = json['serviceType'];
    categoryId = json['categoryId'];
    sortingorder = json['sortingorder'];
    highlightImage = json['highlightImage'];
    status = json['status'];
    clientId = json['clientId'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['vehicleName'] = vehicleName;
    data['image'] = image;
    data['capacity'] = capacity;
    data['serviceType'] = serviceType;
    data['categoryId'] = categoryId;
    data['sortingorder'] = sortingorder;
    data['highlightImage'] = highlightImage;
    data['status'] = status;
    data['clientId'] = clientId;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    return data;
  }
}

class VehicleModelDetails {
  String? sId;
  String? modelname;
  String? description;
  String? image;
  String? vehicleId;
  bool? status;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? clientId;

  VehicleModelDetails(
      {this.sId,
      this.modelname,
      this.description,
      this.image,
      this.vehicleId,
      this.status,
      this.createdAt,
      this.updatedAt,
      this.iV,
      this.clientId});

  VehicleModelDetails.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    modelname = json['modelname'];
    description = json['description'];
    image = json['image'];
    vehicleId = json['vehicleId'];
    status = json['status'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    clientId = json['clientId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['modelname'] = modelname;
    data['description'] = description;
    data['image'] = image;
    data['vehicleId'] = vehicleId;
    data['status'] = status;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    data['clientId'] = clientId;
    return data;
  }
}
