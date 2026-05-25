class RecentModel {
  String? sId;
  double? pickLat;
  double? pickLng;
  String? pickAddress;
  double? dropLat;
  double? dropLng;
  String? dropAddress;

  RecentModel(
      {this.sId,
        this.pickLat,
        this.pickLng,
        this.pickAddress,
        this.dropLat,
        this.dropLng,
        this.dropAddress});

  RecentModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    pickLat = json['pickLat'];
    pickLng = json['pickLng'];
    pickAddress = json['pickAddress'];
    dropLat = json['dropLat'];
    dropLng = json['dropLng'];
    dropAddress = json['dropAddress'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['pickLat'] = pickLat;
    data['pickLng'] = pickLng;
    data['pickAddress'] = pickAddress;
    data['dropLat'] = dropLat;
    data['dropLng'] = dropLng;
    data['dropAddress'] = dropAddress;
    return data;
  }
}
