import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/custom_name_model.dart';

import '../../../network/response_models/wallet_transaction_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/app_urls.dart';

class TransactionListVm extends BaseVm {
  WalletTransactionModel? walletTransactionModel;
  late List<WalletTransaction> transactionList = [];
  CustomNameModel? selectedSort;
  String walletId = "";
  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;

  Future<void> getWalletTransactionList(
      int pageSize, Map<String, dynamic> data) async {
    showLoader();
    if (data[AppConstants.walletId] is String) {
      walletId = data[AppConstants.walletId];
    }
    final response = await apiHelper.get(
        "${AppUrls.getWalletList}/$walletId?limit=${walletTransactionModel?.totalPages ?? "10"}&page=$pageSize}");
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        final response = parseData(r.data, WalletTransactionModel.fromJson);
        if (response != null) {
          if (walletTransactionModel == null) {
            walletTransactionModel = response;
          } else {
            walletTransactionModel?.limit = response.limit;
            walletTransactionModel?.page = response.page;
            walletTransactionModel?.totalPages = response.totalPages;
            walletTransactionModel?.totalResults = response.totalResults;
            walletTransactionModel?.walletTransaction
                ?.addAll(response.walletTransaction!);
          }
          if (selectedSort != null) {
            initializeData();
          } else {
            if (walletTransactionModel?.walletTransaction?.isNotEmpty == true) {
              transactionList
                  .addAll(walletTransactionModel!.walletTransaction!);
            }
          }
        }
      }
      notifyListeners();
    });
  }

  void initializeData({bool isClearData = false}) {
    if (isClearData) {
      transactionList.clear();
    }
    if (selectedSort?.name?.toUpperCase() == AppConstants.all.toUpperCase() &&
        walletTransactionModel?.walletTransaction?.isNotEmpty == true) {
      transactionList.addAll(walletTransactionModel!.walletTransaction!);
    } else {
      walletTransactionModel?.walletTransaction?.forEach((e) {
        if (e.type?.toUpperCase() == selectedSort?.name?.toUpperCase()) {
          transactionList.add(e);
        }
      });
    }
    notifyListeners();
  }
}
