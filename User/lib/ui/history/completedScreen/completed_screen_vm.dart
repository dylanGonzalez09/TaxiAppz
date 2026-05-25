import 'package:flutter/cupertino.dart';

import '../../../models/custom_history_model.dart';
import '../../../network/response_models/history_list_model.dart';
import '../../../network/response_models/history_page_model.dart';
import '../../../network/response_models/trip_model.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';

class CompletedScreenVm extends BaseVm {
  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;
  bool isDisposed = false;
  bool isShimmerLoading = true;
  HistoryPageModel? mode;
  HistoryPageModel? model;
  HistoryListModel? historyListModel;
  List<Trip> tripData = [];
  List<CustomHistoryModel> history = [];
  final ScrollController singleChildScrollController = ScrollController();

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  Future<void> showCompletedHistory(
      int pageSize, String tripStatus, String tripType) async {
    if (!oneTime) {
      oneTime = true;
      isShimmerLoading = true;
    }
    isLoading.value = true;

    // final request = await apiHelper.get(
    //     "${AppUrls.tripHistory}?search=&page=$pageSize&limit=10&rideType=$tripType&tripStatus=$tripStatus");
    final request = await apiHelper.get(
        "${AppUrls.tripHistory}?search=&page=$pageSize&tripStatus=$tripStatus");

    request.fold(
      (e) => showErrorDialog(errorModel: e),
      (r) {
        final history = parseData(r.data, HistoryListModel.fromJson);
        if (history != null) {
          print("jjkfhksdjhfkjhs   ${history.results?.length}");
          historyListModel = history;
          if (history.results?.isNotEmpty == true) {
            tripData.clear();
            int previousMonth = -1;
            history.results?.forEach((action) {
              tripData.add(action);
              final month = getMonthFromDate(action.completedAt);
              if (previousMonth != month) {
                print("CheckDate $action");
                previousMonth = month;
                final data =
                    CustomHistoryModel(action.completedAt ?? "", [action]);
                this.history.add(data);
              } else {
                final index = this.history.indexWhere((item) {
                  final initDate = getMonthFromDate(item.date);
                  final actionDate = getMonthFromDate(action.completedAt);
                  return initDate == actionDate;
                });
                print("CheckDate $action date $index");
                if (index != -1) {
                  this.history[index].trip.add(action);
                }
              }
            });

            // print("jjkfhksdjhfkjhs   ${tripData.first.requestNumber}");
          }

          // var model= PageTrial();
          // model.dataList= tripData;
          // model.month= tr
          // model.page= history.page;
          // model.limit= history.limit;
          // model.totalPages= history.totalPages;
          // model.totalResults= history.totalResults;
        }
        isLoading.value = false;
        isShimmerLoading = false;
        notifyListeners();
      },
    );
  }
}
