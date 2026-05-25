class CompanyVehicleModel {
  List<Vehicle>? vehicle;

  CompanyVehicleModel({this.vehicle});

  CompanyVehicleModel.fromJson(Map<String, dynamic> json) {
    if (json['vehicle'] != null) {
      vehicle = <Vehicle>[];
      json['vehicle'].forEach((v) {
        vehicle!.add(new Vehicle.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.vehicle != null) {
      data['vehicle'] = this.vehicle!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Vehicle {
  String? sId;
  String? companyId;
  VehicleId? vehicleId;
  VehicleModelId? vehicleModelId;
  String? registrationNumber;
  String? color;
  int? seatingCapacity;
  String? status;
  bool? active;
  String? createdAt;
  String? updatedAt;
  int? iV;

  Vehicle(
      {this.sId,
        this.companyId,
        this.vehicleId,
        this.vehicleModelId,
        this.registrationNumber,
        this.color,
        this.seatingCapacity,
        this.status,
        this.active,
        this.createdAt,
        this.updatedAt,
        this.iV});

  Vehicle.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    companyId = json['companyId'];
    vehicleId = json['vehicleId'] != null
        ? new VehicleId.fromJson(json['vehicleId'])
        : null;
    vehicleModelId = json['vehicleModelId'] != null
        ? new VehicleModelId.fromJson(json['vehicleModelId'])
        : null;
    registrationNumber = json['registrationNumber'];
    color = json['color'];
    seatingCapacity = json['seatingCapacity'];
    status = json['status'];
    active = json['active'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['companyId'] = this.companyId;
    if (this.vehicleId != null) {
      data['vehicleId'] = this.vehicleId!.toJson();
    }
    if (this.vehicleModelId != null) {
      data['vehicleModelId'] = this.vehicleModelId!.toJson();
    }
    data['registrationNumber'] = this.registrationNumber;
    data['color'] = this.color;
    data['seatingCapacity'] = this.seatingCapacity;
    data['status'] = this.status;
    data['active'] = this.active;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

class VehicleId {
  String? sId;
  String? vehicleName;

  VehicleId({this.sId, this.vehicleName});

  VehicleId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    vehicleName = json['vehicleName'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['vehicleName'] = this.vehicleName;
    return data;
  }
}

class VehicleModelId {
  String? sId;
  String? modelname;

  VehicleModelId({this.sId, this.modelname});

  VehicleModelId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    modelname = json['modelname'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['modelname'] = this.modelname;
    return data;
  }
}