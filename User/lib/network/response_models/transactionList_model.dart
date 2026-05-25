import 'dart:ffi';

class WalletTransactionModel {
  List<WalletTransaction>? walletTransaction;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  WalletTransactionModel(
      {this.walletTransaction,
      this.page,
      this.limit,
      this.totalPages,
      this.totalResults});

  WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    if (json['walletTransaction'] != null) {
      walletTransaction = <WalletTransaction>[];
      json['walletTransaction'].forEach((v) {
        walletTransaction!.add(WalletTransaction.fromJson(v));
      });
    }
    page = json['page'];
    limit = json['limit'];
    totalPages = json['totalPages'];
    totalResults = json['totalResults'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (walletTransaction != null) {
      data['walletTransaction'] =
          walletTransaction!.map((v) => v.toJson()).toList();
    }
    data['page'] = page;
    data['limit'] = limit;
    data['totalPages'] = totalPages;
    data['totalResults'] = totalResults;
    return data;
  }
}

class WalletTransaction {
  int? amount;
  String? purpose;
  String? type;
  String? walletId;
  String? userId;
  String? clientId;
  String? id;
  String? createdAt;
  String? currencySymbol;

  WalletTransaction(
      {this.amount,
      this.purpose,
      this.type,
      this.walletId,
      this.userId,
      this.clientId,
      this.id,
      this.createdAt,
      this.currencySymbol});

  WalletTransaction.fromJson(Map<String, dynamic> json) {
    amount = int.tryParse(json['amount'].toString(),) ?? 0;
    purpose = json['purpose'];
    type = json['type'];
    walletId = json['walletId'];
    userId = json['userId'];
    clientId = json['clientId'];
    id = json['id'];
    createdAt = json['createdAt'];
    currencySymbol = json['currencySymbol'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['amount'] = amount;
    data['purpose'] = purpose;
    data['type'] = type;
    data['walletId'] = walletId;
    data['userId'] = userId;
    data['clientId'] = clientId;
    data['id'] = id;
    data['createdAt'] = createdAt;
    data['currencySymbol'] = currencySymbol;
    return data;
  }
}
