class LanguageModel {
  String? sId;
  String? name;
  String? code;
  bool? status;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? clientId;
  bool isSelected = false;

  LanguageModel(
      {this.sId,
        this.name,
        this.code,
        this.status,
        this.createdAt,
        this.updatedAt,
        this.iV,
        this.clientId});

  LanguageModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    name = json['name'];
    code = json['code'];
    status = json['status'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    clientId = json['clientId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['name'] = name;
    data['code'] = code;
    data['status'] = status;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    data['clientId'] = clientId;
    return data;
  }
}