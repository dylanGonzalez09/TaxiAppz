import 'package:taxiappzpro/base/base_vm.dart';
import '../../network/response_models/dashboard_history_model.dart';
import '../../network/response_models/earnings_model.dart';
import '../../utils/app_urls.dart';

class DashboardVm extends BaseVm {
  int selectedPageIndex = 0;
  int yearIndex = 0;
  EarningsModel? earningsModel;
  DashboardHistoryModel? dashboardHistoryModel;


  String filteredDate = "Select Month";
  List<String> monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  List<String> yearList = [
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
  ];


  Future<void> getEarningsList() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.dashboardEarningsList);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        earningsModel = EarningsModel.fromJson(r.data);
      }
    });
    notifyListeners();
  }

  Future<void> getHistoryList() async {
    final response = await apiHelper.get(AppUrls.dashboardHistoryList);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        dashboardHistoryModel = DashboardHistoryModel.fromJson(r.data);
      }
      notifyListeners();
    });
  }
}