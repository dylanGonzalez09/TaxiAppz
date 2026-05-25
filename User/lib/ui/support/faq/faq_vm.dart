import 'dart:convert';
import '../../../network/response_models/faq_model.dart';
import '../../../network/response_models/reqin_progress_model.dart';
import '../../../utils/app_url.dart';
import '../../../utils/base_vm.dart';

class FaqVm extends BaseVm{

  List<FaqModel>? faqList = [];
  ReqInProgressModel? requestInProModel;

  void setArgs(Map<String, dynamic> request) {
    requestInProModel = request["request"];
  }

  Future<void> getFaqList() async {
    showLoader();
    final map = {
      "type": "User",
      "zoneId": requestInProModel?.user?.zoneId
    };
    final response = await apiHelper.post(AppUrls.getFaqList,params: map);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final data = List<FaqModel>.from(
            jsonString.map((model) => FaqModel.fromJson(model)));
        faqList?.clear();
        faqList?.addAll(data);
      }
      notifyListeners();
    });
  }
}