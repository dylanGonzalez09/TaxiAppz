import '../../network/response_models/notification_model.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';

class NotificationVm extends BaseVm {
  NotificationModel? notificationModel;
  List<Results>? notificationList = [];
  int currentPage = 1;
  int totalItem = 0;
  bool oneTime = false;

  Future<dynamic> getNotificationList(int pageSize) async {
    if (!oneTime) {
      oneTime = true;
      showLoader();
    }
    final response = await apiHelper.get("${AppUrls.getNotificationList}?limit=10&page=$pageSize}");
    hideLoader();
    response.fold((e) {
      //showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        final apiNotify = parseData(r.data, NotificationModel.fromJson);
        if (apiNotify != null) {
          notificationModel = apiNotify;
          notificationList?.addAll(apiNotify.results!);
        }
      }
      notifyListeners();
    });
  }

  Future<dynamic> updateNotificationRead(Results? data, bool allClear) async {
    showLoader();
    final response = await apiHelper
        .patch("${AppUrls.updateNotification}${allClear?"all":data?.id}");
    hideLoader();
    response.fold((e) {
      //showErrorDialog(errorModel: e);
    }, (r) {
      data?.isSelected= true;
      if (r.data != null) {
        if(allClear){
          notificationList= null;
        }
      }
      notifyListeners();
    });
  }
}