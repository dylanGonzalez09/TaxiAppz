class DurationModel {
  String? distance;
  String? duration;
  String? calculationMethod;

  DurationModel({this.distance, this.duration, this.calculationMethod});

  DurationModel.fromJson(Map<String, dynamic> json) {
    distance = json['distance'];
    duration = json['duration'];
    calculationMethod = json['calculation_method'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['distance'] = this.distance;
    data['duration'] = this.duration;
    data['calculation_method'] = this.calculationMethod;
    return data;
  }
}