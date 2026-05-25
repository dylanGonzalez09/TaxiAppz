class MqttDriverModel {
  String? sId;
  String? driverId;
  int? iV;
  double? bearing;
  bool? isOnline;
  bool? isAvailable;
  String? lastUpdated;
  double? latitude;
  double? longitude;
  String? vehicleId, serviceType;
  double? speed;

  MqttDriverModel(
      {this.sId,
      this.driverId,
      this.iV,
      this.bearing,
      this.isOnline,
      this.isAvailable,
      this.lastUpdated,
      this.latitude,
      this.longitude,
      this.vehicleId,
      this.speed,
      this.serviceType});

  MqttDriverModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    driverId = json['driverId'];
    iV = json['__v'];
    bearing = json['bearing']?.toDouble();
    isOnline = json['isOnline'];
    isAvailable = json['isAvailable'];
    lastUpdated = "${json['lastUpdated']}";
    latitude = json['latitude'];
    longitude = json['longitude'];
    vehicleId = json['vehicleId'];
    speed = json['speed']?.toDouble();
    serviceType = json['serviceType'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['driverId'] = driverId;
    data['__v'] = iV;
    data['bearing'] = bearing;
    data['isOnline'] = isOnline;
    data['isAvailable'] = isAvailable;
    data['lastUpdated'] = lastUpdated;
    data['latitude'] = latitude;
    data['longitude'] = longitude;
    data['vehicleId'] = vehicleId;
    data['speed'] = speed;
    data['serviceType'] = serviceType;
    return data;
  }
}
