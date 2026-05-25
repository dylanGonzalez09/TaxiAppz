import '../../../models/custom_history_model.dart';
import '../../../network/response_models/history_list_model.dart';
import '../../../network/response_models/trip_model.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';

class ScheduleScreenVm extends BaseVm {

  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;
  bool isDisposed = false;

  bool isShimmerLoading = true;
  HistoryListModel? historyListModel;
  List<CustomHistoryModel> history = [];

  List<Trip> tripData = [];

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  Future<void> showScheduledHistory(int pageSize, String tripStatus, String tripType) async {
    isShimmerLoading = true;
    if (!oneTime) {
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
          historyListModel= history;
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

                final index = this.history.indexWhere((item){
                  final initDate = getMonthFromDate(item.date);
                  final actionDate = getMonthFromDate(action.completedAt);
                  return initDate ==actionDate;
                });
                print("CheckDate $action date $index");
                if(index != -1){
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
