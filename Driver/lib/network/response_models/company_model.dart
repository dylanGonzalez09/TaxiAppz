class CompanyModel {
  String? sId;
  String? companyName;
  String? companyCode;

  CompanyModel({this.sId, this.companyName, this.companyCode});

  CompanyModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    companyName = json['companyName'];
    companyCode = json['companyCode'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['companyName'] = companyName;
    data['companyCode'] = companyCode;
    return data;
  }
}
