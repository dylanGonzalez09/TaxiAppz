
class User {
  String? sId;
  String? workTypeId;
  Vehicle? vehicle;
  String? workTypeName;
  int? workHour;
  String? perHourPrice;
  int? contractAmountPerDay;
  String? firstName;
  String? lastName;
  String? email;
  String? address;
  int? rating;
  bool? isSuspended;
  String? gender;
  String? phoneNumber;
  String? profilePic;
  String? userId;
  String? countryCode;
  String? currencySymbol;
  String? zoneId;
  List<ContractTimeSlots>? contractTimeSlots;
  List<String>? serviceType, secondaryZone;
  String? blockReason;
  List<Categories>? categories;
  String? regDate, regTime;
  String? adminPhoneNumber;
  String? headOfficeNumber;


  User(
      {this.sId,
        this.workTypeId,
        this.secondaryZone,
        this.serviceType,
        this.vehicle,
        this.workTypeName,
        this.workHour,
        this.perHourPrice,
        this.contractAmountPerDay,
        this.firstName,
        this.lastName,
        this.email,
        this.address,
        this.rating,
        this.gender,
        this.phoneNumber,
        this.profilePic,
        this.userId,
        this.countryCode,
        this.currencySymbol,
        this.blockReason,
        this.zoneId,
        this.contractTimeSlots,
        this.categories,
      this.regDate,
      this.regTime,
      this.adminPhoneNumber,
      this.headOfficeNumber
      });

  User.fromJson(Map<String, dynamic> json) {
    sId = json['_id'] ?? json['id'];
    workTypeId = json['workTypeId'];
    serviceType = json['serviceType'] != null
        ? List<String>.from(json['serviceType'])
        : null;
    secondaryZone = json['secondaryZone'] != null
        ? List<String>.from(json['secondaryZone'])
        : null;
    vehicle =
    json['vehicle'] != null ? Vehicle.fromJson(json['vehicle']) : null;
    workTypeName = json['workTypeName'];
    workHour = json['workHour'];
    isSuspended = json['isSuspended'];
    perHourPrice = json['perHourPrice'];
    contractAmountPerDay = json['contractAmountPerDay'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    email = json['email'];
    address = json['address'];
    rating = json['rating'];
    gender = json['gender'];
    phoneNumber = json['phoneNumber'];
    profilePic = json['profilePic'];
    userId = json['userId'];
    blockReason = json['blockReason'];
    countryCode = json['countryCode'];
    currencySymbol = json['currencySymbol'];
    zoneId = json['zoneId'];
    regTime = json['regTime'];
    regDate = json['regDate'];
    headOfficeNumber = json['headOfficeNumber'];
    adminPhoneNumber = json['adminPhoneNumber'];
    if (json['contractTimeSlots'] != null) {
      contractTimeSlots = <ContractTimeSlots>[];
      json['contractTimeSlots'].forEach((v) {
        contractTimeSlots!.add(ContractTimeSlots.fromJson(v));
      });
    }
    if (json['categories'] != null) {
      categories = <Categories>[];
      json['categories'].forEach((v) {
        categories!.add(Categories.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['workTypeId'] = workTypeId;
    data['blockReason'] = blockReason;
    if (serviceType != null) {
      data['serviceType'] = serviceType;
    }
    if (secondaryZone != null) {
      data['secondaryZone'] = secondaryZone;
    }
    if (vehicle != null) {
      data['vehicle'] = vehicle!.toJson();
    }
    data['workTypeName'] = workTypeName;
    data['workHour'] = workHour;
    data['isSuspended'] = isSuspended;
    data['perHourPrice'] = perHourPrice;
    data['contractAmountPerDay'] = contractAmountPerDay;
    data['firstName'] = firstName;
    data['lastName'] = lastName;
    data['email'] = email;
    data['address'] = address;
    data['rating'] = rating;
    data['gender'] = gender;
    data['phoneNumber'] = phoneNumber;
    data['profilePic'] = profilePic;
    data['userId'] = userId;
    data['countryCode'] = countryCode;
    data['currencySymbol'] = currencySymbol;
    data['zoneId'] = zoneId;
    data['regDate'] = regDate;
    data['regTime'] = regTime;
    if (contractTimeSlots != null) {
      data['contractTimeSlots'] =
          contractTimeSlots!.map((v) => v.toJson()).toList();
    }
    if (categories != null) {
      data['categories'] = categories!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Vehicle {
  String? id;
  String? vehicleName;
  String? vehicleNumber;
  String? image;
  String? highlightImage;
  String? vehicleModelId;
  String? vehicleBrandId;
  String? vehicleBrandName;
  String? vehicleModelName;
  String? vehicleVariantId;
  String? vehicleVariantName;
  String? zoneName;
  String? carColour;

  Vehicle(
      {this.id,
        this.vehicleName,
        this.vehicleNumber,
        this.image,
        this.highlightImage,
        this.vehicleModelId,
        this.vehicleBrandId,
        this.vehicleBrandName,
        this.vehicleModelName,
        this.vehicleVariantId,
        this.vehicleVariantName,
        this.zoneName,
        this.carColour});

  Vehicle.fromJson(Map<String, dynamic> json) {
    id = json['_id'] ?? json['id'];
    vehicleName = json['vehicleName'];
    vehicleNumber = json['vehicleNumber'];
    image = json['image'];
    highlightImage = json['highlightImage'];
    vehicleModelId = json['vehicleModelId'];
    vehicleBrandId = json['vehicleBrandId'];
    vehicleBrandName = json['vehicleBrandName'];
    vehicleModelName = json['vehicleModelName'];
    vehicleVariantId = json['vehicleVariantId'];
    vehicleVariantName = json['vehicleVariantName'];
    zoneName = json['zoneName'];
    carColour = json['carColour'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = id;
    data['vehicleName'] = vehicleName;
    data['vehicleNumber'] = vehicleNumber;
    data['image'] = image;
    data['highlightImage'] = highlightImage;
    data['vehicleModelId'] = vehicleModelId;
    data['vehicleBrandId'] = vehicleBrandId;
    data['vehicleBrandName'] = vehicleBrandName;
    data['vehicleModelName'] = vehicleModelName;
    data['vehicleVariantId'] = vehicleVariantId;
    data['vehicleVariantName'] = vehicleVariantName;
    data['zoneName'] = zoneName;
    data['carColour'] = carColour;
    return data;
  }
}

class ContractTimeSlots {
  String? day;
  String? startTime;
  String? endTime;

  ContractTimeSlots({this.day, this.startTime, this.endTime});

  ContractTimeSlots.fromJson(Map<String, dynamic> json) {
    day = json['day'].toString();
    startTime = json['startTime'].toString();
    endTime = json['endTime'].toString();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['day'] = day;
    data['startTime'] = startTime;
    data['endTime'] = endTime;
    return data;
  }
}

class Categories {
  String? sId;
  String? name;
  bool? isSelected;

  Categories({this.sId, this.name, this.isSelected});

  Categories.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    name = json['name'];
    isSelected = json['isSelected'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['name'] = name;
    data['isSelected'] = isSelected;
    return data;
  }
}