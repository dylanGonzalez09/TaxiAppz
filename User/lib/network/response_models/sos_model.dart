class SOSModel {
  String? dialCode;
  String? title;
  String? phoneNumber;
  bool? status;
  Null? deletedAt;
  bool? isAdminAdded;
  String? clientId;
  String? userId;
  String? id;
  String? countryCode;

  SOSModel(
      {this.dialCode,
        this.title,
        this.phoneNumber,
        this.status,
        this.deletedAt,
        this.isAdminAdded,
        this.clientId,
        this.userId,
        this.id,
        this.countryCode});

  SOSModel.fromJson(Map<String, dynamic> json) {
    dialCode = json['dialCode'];
    title = json['title'];
    phoneNumber = json['phoneNumber'];
    status = json['status'];
    deletedAt = json['deletedAt'];
    isAdminAdded = json['isAdminAdded'];
    clientId = json['clientId'];
    userId = json['userId'];
    id = json['id'];
    countryCode = json['countryCode'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['dialCode'] = this.dialCode;
    data['title'] = this.title;
    data['phoneNumber'] = this.phoneNumber;
    data['status'] = this.status;
    data['deletedAt'] = this.deletedAt;
    data['isAdminAdded'] = this.isAdminAdded;
    data['clientId'] = this.clientId;
    data['userId'] = this.userId;
    data['id'] = this.id;
    data['countryCode'] = this.countryCode;
    return data;
  }
}

