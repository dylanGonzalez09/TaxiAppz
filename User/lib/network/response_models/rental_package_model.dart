class RentalPackageModel {
  int? minHr;
  int? maxHr;
  int? minKm;
  int? maxKm;
  bool? zone;
  List<Package>? package;
  List<String>? paymentTypes;

  RentalPackageModel(
      {this.minHr,
        this.maxHr,
        this.minKm,
        this.maxKm,
        this.zone,
        this.package,
        this.paymentTypes});

  RentalPackageModel.fromJson(Map<String, dynamic> json) {
    minHr = json['minHr'];
    maxHr = json['maxHr'];
    minKm = json['minKm'];
    maxKm = json['maxKm'];
    zone = json['zone'];
    if (json['package'] != null) {
      package = <Package>[];
      json['package'].forEach((v) {
        package!.add(Package.fromJson(v));
      });
    }
    if (json['paymentTypes'] != null) {
      paymentTypes = List.from(json['paymentTypes'].map((m) => m));
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['minHr'] = minHr;
    data['maxHr'] = maxHr;
    data['minKm'] = minKm;
    data['maxKm'] = maxKm;
    data['zone'] = zone;
    if (package != null) {
      data['package'] = package!.map((v) => v.toJson()).toList();
    }
    if (paymentTypes?.isNotEmpty == true) {
      data['paymentTypes'] = paymentTypes;
    }
    return data;
  }
}

class Package {
  String? sId;
  int? km;
  int? hour;
  String? countryId;
  String? zoneId;
  List<VehiclePrices>? vehiclePrices;
  bool? status;
  String? clientId;
  String? createdAt;
  String? updatedAt;
  int? iV;

  Package(
      {this.sId,
        this.km,
        this.hour,
        this.countryId,
        this.zoneId,
        this.vehiclePrices,
        this.status,
        this.clientId,
        this.createdAt,
        this.updatedAt,
        this.iV});

  Package.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    km = json['km'];
    hour = json['hour'];
    countryId = json['countryId'];
    zoneId = json['zoneId'];
    if (json['vehiclePrices'] != null) {
      vehiclePrices = <VehiclePrices>[];
      json['vehiclePrices'].forEach((v) {
        vehiclePrices!.add(VehiclePrices.fromJson(v));
      });
    }
    status = json['status'];
    clientId = json['clientId'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['km'] = km;
    data['hour'] = hour;
    data['countryId'] = countryId;
    data['zoneId'] = zoneId;
    if (vehiclePrices != null) {
      data['vehiclePrices'] = vehiclePrices!.map((v) => v.toJson()).toList();
    }
    data['status'] = status;
    data['clientId'] = clientId;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    return data;
  }
}

class VehiclePrices {
  String? vehicleId;
  String? image;
  String? highlightImage;
  String? vehicleName;
  int? capacity;
  bool? status;
  int? price;
  int estimatedTime = -1;
  bool isSelected = false;
  int? graceTime;
  int? extraKmPrice;
  String? sId;
  dynamic promoAmount;

  VehiclePrices(
      {this.vehicleId,
        this.image,
        this.highlightImage,
        this.vehicleName,
        this.capacity,
        this.status,
        this.price,
        this.graceTime,
        this.extraKmPrice,
        this.sId,
        this.promoAmount});

  VehiclePrices.fromJson(Map<String, dynamic> json) {
    vehicleId = json['vehicleId'];
    image = json['image'];
    highlightImage = json['highlightImage'];
    vehicleName = json['vehicleName'];
    capacity = json['capacity'];
    status = json['status'];
    price = json['price'];
    graceTime = json['graceTime'];
    extraKmPrice = json['extraKmPrice'];
    sId = json['_id'];
    promoAmount = convertToDouble(json['promoAmount']);
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['vehicleId'] = vehicleId;
    data['image'] = image;
    data['highlightImage'] = highlightImage;
    data['vehicleName'] = vehicleName;
    data['capacity'] = capacity;
    data['status'] = status;
    data['price'] = price;
    data['graceTime'] = graceTime;
    data['extraKmPrice'] = extraKmPrice;
    data['_id'] = sId;
    data['promoAmount'] = promoAmount;
    return data;
  }
}

double convertToDouble(dynamic value) {
  if (value is int) {
    return value.toDouble();
  } else if (value is double) {
    return value;
  } else if (value is String) {
    return double.parse(value);
  } else {
    throw Exception('Unsupported type');
  }
}
