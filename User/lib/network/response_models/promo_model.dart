class PromoModel {
  String? zoneId;
  String? promoCode;
  String? promoCodeType;
  String? description;
  int? targetAmount;
  String? promoType;
  int? amount;
  int? percentage;
  String? clientId;
  List<dynamic>? userId;
  String? fromDate;
  String? toDate;
  bool? status;
  int? totalCount;
  String? banner;
  int? promoReuseCount;
  int? newUserCount;
  dynamic createdBy;
  String? id;

  PromoModel(
      {this.zoneId,
      this.promoCode,
      this.promoCodeType,
      this.description,
      this.targetAmount,
      this.promoType,
      this.amount,
      this.percentage,
      this.clientId,
      this.userId,
      this.fromDate,
      this.toDate,
      this.status,
      this.totalCount,
      this.banner,
      this.promoReuseCount,
      this.newUserCount,
      this.createdBy,
      this.id});

  PromoModel.fromJson(Map<String, dynamic> json) {
    zoneId = json['zoneId'];
    promoCode = json['promoCode'];
    promoCodeType = json['promoCodeType'];
    description = json['description'];
    targetAmount = json['targetAmount'];
    promoType = json['promoType'];
    amount = json['amount'];
    percentage = json['percentage'];
    clientId = json['clientId'];
    if (json['userId'] != null) {
      userId = <dynamic>[];
      json['userId'].forEach((v) {
        userId!.add(v);
      });
    }
    fromDate = json['fromDate'];
    toDate = json['toDate'];
    status = json['status'];
    totalCount = json['totalCount'];
    banner = json['banner'];
    promoReuseCount = json['promoReuseCount'];
    newUserCount = json['newUserCount'];
    createdBy = json['createdBy'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['zoneId'] = this.zoneId;
    data['promoCode'] = this.promoCode;
    data['promoCodeType'] = this.promoCodeType;
    data['description'] = this.description;
    data['targetAmount'] = this.targetAmount;
    data['promoType'] = this.promoType;
    data['amount'] = this.amount;
    data['percentage'] = this.percentage;
    data['clientId'] = this.clientId;
    if (this.userId != null) {
      data['userId'] = this.userId!.map((v) => v).toList();
    }
    data['fromDate'] = this.fromDate;
    data['toDate'] = this.toDate;
    data['status'] = this.status;
    data['totalCount'] = this.totalCount;
    data['banner'] = this.banner;
    data['promoReuseCount'] = this.promoReuseCount;
    data['newUserCount'] = this.newUserCount;
    data['createdBy'] = this.createdBy;
    data['id'] = this.id;
    return data;
  }
}
