class ServiceTypeModel {
  List<String>? serviceType;

  ServiceTypeModel({this.serviceType});

  ServiceTypeModel.fromJson(Map<String, dynamic> json) {
    serviceType = json['servicetype'].cast<String>();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['servicetype'] = serviceType;
    return data;
  }
}
