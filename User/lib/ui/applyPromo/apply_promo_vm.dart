

import 'package:flutter/cupertino.dart';


import '../../network/response_models/promo_model.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';

class ApplyPromoVm extends BaseVm{
  final TextEditingController promoController = TextEditingController();
  bool showNameTextField = false;
  List<PromoModel> promoList = [];
  bool isShimmerLoading = true;

  Future<void> getPromoList(String vehicleId) async {
    Future.delayed(Duration.zero, () {
      isShimmerLoading = true;
      //showLoader();
    });
    final response = await apiHelper.get('${AppUrls.getPromoList}?vehicleType=$vehicleId');
    isShimmerLoading = false;
    //hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        promoList = (r.data as List).map((json) => PromoModel.fromJson(json)).toList();
      }
      notifyListeners();
    });
  }
}