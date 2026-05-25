import 'package:taxiappzpro/utils/utils.dart';

class WalletDetailModel {
  String? sId;
  String? earnedAmount;
  String? amountSpent;
  String? balance;
  String? country;
  String? currency;
  String? due;

  WalletDetailModel(
      {this.sId,
      this.earnedAmount,
      this.amountSpent,
      this.balance,
      this.country,
      this.currency,
      this.due});

  WalletDetailModel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    earnedAmount = json['earnedAmount'];
    amountSpent = json['amountSpent'];
    balance = json['balance'] != null
        ? Utils.formatDecimalPointValue(json['balance'], 2)
        : "0";
    country = json['country'];
    currency = json['currency'] ?? json['currencySymbol'];
    due = json['due'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['earnedAmount'] = earnedAmount;
    data['amountSpent'] = amountSpent;
    data['balance'] = balance;
    data['country'] = country;
    data['currencySymbol'] = currency;
    data['due'] = due;
    return data;
  }
}
