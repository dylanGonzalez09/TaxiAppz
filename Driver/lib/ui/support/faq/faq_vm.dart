import 'dart:convert';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import '../../../network/response_models/faq_model.dart';
import '../../../utils/app_urls.dart';

class FaqVm extends BaseVm{

  List<FaqModel>? faqList = [];
  RequestInProModel? requestInProModel;

  void setArgs(Map<String, dynamic> request) {
    requestInProModel = request["request"];
  }

  Future<void> getFaqList() async {
    showLoader();
    final map = {
      "type": "Driver",
      "zoneId": requestInProModel?.zoneId
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