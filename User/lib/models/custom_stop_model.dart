class CustomStopModel {
  double? latitude;
  double? longitude;
  String? address;

  CustomStopModel({this.latitude, this.longitude, this.address});

  CustomStopModel.fromJson(Map<String, dynamic> json) {
    latitude = json['latitude'];
    longitude = json['longitude'];
    address = json['address'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['latitude'] = latitude;
    data['longitude'] = longitude;
    data['address'] = address;
    return data;
  }
}
