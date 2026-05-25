import '../../../base/base_vm.dart';
import '../../../models/custom_history_model.dart';
import '../../../network/response_models/history_list_model.dart';
import '../../../network/response_models/trips_model.dart';
import '../../../utils/app_urls.dart';

class ScheduleScreenVm extends BaseVm {
  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;
  bool isDisposed = false;
  int previousMonth = -1;
  bool isShimmerLoading = true;
  HistoryListModel? historyListModel;
  List<CustomHistoryModel> history = [];

  List<TripModel> tripData = [];

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  Future<void> showScheduledHistory(
      int pageSize, String tripStatus, String tripType) async {

    if (!oneTime) {
      isShimmerLoading = true;
      oneTime = true;
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
          print("jjkfhksdjhfkjhs   ${history.results?.length}");
          historyListModel = history;
          if (history.results?.isNotEmpty == true) {
            tripData.clear();

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
        }
        isShimmerLoading = false;
        notifyListeners();
      },
    );
  }
}
