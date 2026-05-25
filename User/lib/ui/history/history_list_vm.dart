import 'package:flutter/cupertino.dart';
import '../../network/response_models/trip_model.dart';
import '../../utils/base_vm.dart';


import '../../network/response_models/history_list_model.dart';
import '../../utils/app_url.dart';

class HistoryListVm extends BaseVm {
  bool isDisposed = false;
  int currentScreen = 1;


  int currentPage = 0;
  int totalItem = 0;
  bool oneTime = false;

  HistoryListModel? historyListModel;

  final pageController = PageController();

  List<Trip> tripData = [];

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }


  void changePage(int num){
    currentPage = num;
    pageController.jumpToPage(num);
    notifyListeners();
  }


  Future<void> showCompletedHistory(int pageSize, String tripStatus, String tripType) async {
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

            history.results?.forEach((action) {
              tripData.add(action);
            });
            print("jjkfhksdjhfkjhs   ${tripData.length}");
            print("jjkfhksdjhfkjhs   ${tripData.first.requestNumber}");
          }
        }

        notifyListeners();
      },
    );
  }
}
