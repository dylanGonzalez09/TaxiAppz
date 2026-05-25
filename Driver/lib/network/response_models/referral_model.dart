class ReferralModel {
  String? referralCode, currencySymbol;
  int? referByDriverAmount;
  int? referByUserAmount;
  int? referralAmount;

  ReferralModel(
      {this.referralCode,
      this.referByDriverAmount,
      this.currencySymbol,
      this.referByUserAmount,
      this.referralAmount});

  ReferralModel.fromJson(Map<String, dynamic> json) {
    referralCode = json['referralCode'];
    referByDriverAmount = json['referByDriverAmount'];
    referByUserAmount = json['referByUserAmount'];
    referralAmount = json['referralAmount'];
    currencySymbol = json['currencySymbol'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['referralCode'] = referralCode;
    data['referByDriverAmount'] = referByDriverAmount;
    data['referByUserAmount'] = referByUserAmount;
    data['referralAmount'] = referralAmount;
    data['currencySymbol'] = currencySymbol;
    return data;
  }
}
