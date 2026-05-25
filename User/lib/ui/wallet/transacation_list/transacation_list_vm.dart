import '../../../network/response_models/custom_name_model.dart';
import '../../../network/response_models/transactionList_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';
import 'package:flutter/material.dart';

class TransactionListVm extends BaseVm {
  WalletTransactionModel? walletTransactionModel;
  late List<WalletTransaction> transactionList = [];
  CustomNameModel? selectedSort;
  String walletId = "";
  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;
  bool isPageLoading = false;
  bool isPaginationLoading = false;
  ScrollController scrollController = ScrollController();

  Future<void> getWalletTransactionList({bool isPagination = false}) async {
    if (isPagination) {
      isPaginationLoading = true;
    } else {
      isPageLoading = true;
    }
    notifyListeners();

    final response = await apiHelper.get(
        "${AppUrls.walletTransactionList}/$walletId?limit=10&page=$currentPage}");

    if (isPagination) {
      isPaginationLoading = false;
    } else {
      isPageLoading = false;
    }
    notifyListeners();

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

  void loadMoreData() {
    if (scrollController.position.pixels ==
        scrollController.position.maxScrollExtent) {
      if (walletTransactionModel!.page! < walletTransactionModel!.totalPages! &&
          walletTransactionModel?.totalResults != transactionList.length) {
        currentPage++;
        getWalletTransactionList(isPagination: true);
      }
    }
  }
}