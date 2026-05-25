import 'package:flutter/cupertino.dart';
import '../../../base/base_vm.dart';
import '../../../models/custom_history_model.dart';
import '../../../network/response_models/history_list_model.dart';
import '../../../network/response_models/trips_model.dart';
import '../../../utils/app_urls.dart';

class CancelledScreenVm extends BaseVm {
  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;
  bool isDisposed = false;
  bool isShimmerLoading = true;
  HistoryListModel? historyListModel;
  List<CustomHistoryModel> history = [];
  final ScrollController singleChildScrollController = ScrollController();
  List<TripModel> tripData = [];

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  Future<void> showCancelledHistory(
      int pageSize, String tripStatus, String tripType) async {

    if (!oneTime) {
      oneTime = true;
      isShimmerLoading = true;
      isLoading.value = true;
    }

    final request = await apiHelper.get(
        "${AppUrls.tripHistory}?search=&page=$pageSize&limit=10&rideType=$tripType&tripStatus=$tripStatus");

    isLoading.value = false;

    request.fold(
          (e) => showErrorDialog(errorModel: e),
          (r) {
        final history = parseData(r.data, HistoryListModel.fromJson);

        if (history != null) {
          historyListModel = history;

          final results = history.results ?? [];

          final hasValidDate = results.any((e) => e.cancelledAt != null && e.cancelledAt!.isNotEmpty);

          if (hasValidDate) {
            results.sort((a, b) {
              final aDate = safeParseDate(a.cancelledAt);
              final bDate = safeParseDate(b.cancelledAt);

              if (aDate == null && bDate == null) return 0;

              if (aDate == null) return 1;
              if (bDate == null) return -1;

              return bDate.compareTo(aDate);
            });
          }

          tripData.clear();
          this.history.clear();

          int previousMonth = -1;

          for (var action in results) {
            tripData.add(action);

            final date = action.cancelledAt;
            final month = getMonthFromDate(date);

            if (date == null || date.isEmpty) {
              this.history.add(CustomHistoryModel("", [action]));
              continue;
            }

            if (previousMonth != month) {
              previousMonth = month;
              this.history.add(CustomHistoryModel(date, [action]));
            } else {
              final index = this.history.indexWhere((item) {
                final initDate = getMonthFromDate(item.date);
                final actionDate = getMonthFromDate(date);
                return initDate == actionDate;
              });

              if (index != -1) {
                this.history[index].trip.add(action);
              }
            }
          }
        }

        isShimmerLoading = false;
        notifyListeners();
      },
    );
  }
}
