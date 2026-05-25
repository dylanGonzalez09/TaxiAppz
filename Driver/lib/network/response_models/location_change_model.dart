class LocationChangeModel {
  double? pickLat;
  double? pickLng;
  String? requestId;
  String? driverId;
  String? address;

  LocationChangeModel(
      {this.pickLat,
      this.pickLng,
      this.requestId,
      this.driverId,
      this.address});

  LocationChangeModel.fromJson(Map<String, dynamic> json) {
    pickLat = json['pick_lat'];
    pickLng = json['pick_lng'];
    requestId = json['requestId'];
    driverId = json['driverId'];
    address = json['address'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['pick_lat'] = pickLat;
    data['pick_lng'] = pickLng;
    data['requestId'] = requestId;
    data['driverId'] = driverId;
    data['address'] = address;
    return data;
  }
}
