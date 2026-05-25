class ZoneModel {
  String? sId;
  String? zoneName;
  String? primaryZoneId;
  String? zoneLevel;

  ZoneModel({this.sId, this.zoneName, this.primaryZoneId, this.zoneLevel});

  ZoneModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    zoneName = json['zoneName'];
    primaryZoneId = json['primaryZoneId'];
    zoneLevel = json['zoneLevel'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['zoneName'] = zoneName;
    data['primaryZoneId'] = primaryZoneId;
    data['zoneLevel'] = zoneLevel;
    return data;
  }
}
