import 'company_vehicle_model.dart';

class ManageVehicleListModel {
  String? sId;
  String? driverId;
  VehicleId? vehicleId;
  VehicleModelId? vehicleModelId;
  String? vehicleMake;
  String? vehicleModelName;
  int? manufactureYear;
  String? licensePlateNumber;
  String? vehicleColor;
  int? passengerCapacity;
  bool? status;
  bool? isApprove;
  bool? isOnline; // <-- NEW FIELD
  String? createdAt;
  String? updatedAt;
  int? iV;

  ManageVehicleListModel({
    this.sId,
    this.driverId,
    this.vehicleId,
    this.vehicleModelId,
    this.vehicleMake,
    this.vehicleModelName,
    this.manufactureYear,
    this.licensePlateNumber,
    this.vehicleColor,
    this.passengerCapacity,
    this.status,
    this.isApprove,
    this.isOnline, // <-- NEW FIELD
    this.createdAt,
    this.updatedAt,
    this.iV,
  });

  ManageVehicleListModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    driverId = json['driverId'];
    vehicleId = json['vehicleId'] != null
        ? VehicleId.fromJson(json['vehicleId'])
        : null;
    vehicleModelId = json['vehicleModelId'] != null
        ? VehicleModelId.fromJson(json['vehicleModelId'])
        : null;
    vehicleMake = json['vehicleMake'];
    vehicleModelName = json['vehicleModelName'];
    manufactureYear = json['manufactureYear'];
    licensePlateNumber = json['licensePlateNumber'];
    vehicleColor = json['vehicleColor'];
    passengerCapacity = json['passengerCapacity'];
    status = json['status'];
    isApprove = json['isApprove'];

    isOnline = json['isOnline']; // <-- PARSE NEW FIELD

    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['_id'] = sId;
    data['driverId'] = driverId;

    if (vehicleId != null) data['vehicleId'] = vehicleId!.toJson();
    if (vehicleModelId != null) data['vehicleModelId'] = vehicleModelId!.toJson();

    data['vehicleMake'] = vehicleMake;
    data['vehicleModelName'] = vehicleModelName;
    data['manufactureYear'] = manufactureYear;
    data['licensePlateNumber'] = licensePlateNumber;
    data['vehicleColor'] = vehicleColor;
    data['passengerCapacity'] = passengerCapacity;
    data['status'] = status;
    data['isApprove'] = isApprove;

    data['isOnline'] = isOnline; // <-- ADD TO JSON

    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    return data;
  }
}
