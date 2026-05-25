class WalletDetailModel {
  String? sId;
  String? earnedAmount;
  String? amountSpent;
  String? balance;
  String? country;
  String? currency;

  WalletDetailModel(
      {this.sId,
      this.earnedAmount,
      this.amountSpent,
      this.balance,
      this.country,
      this.currency});

  WalletDetailModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    earnedAmount = json['earnedAmount'].toString();
    amountSpent = json['amountSpent'].toString();
    balance = json['balance'].toString();
    country = json['country'];
    currency = json['currency'] ?? json['currencySymbol'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['earnedAmount'] = earnedAmount;
    data['amountSpent'] = amountSpent;
    data['balance'] = balance;
    data['country'] = country;
    data['currencySymbol'] = currency;
    return data;
  }
}
