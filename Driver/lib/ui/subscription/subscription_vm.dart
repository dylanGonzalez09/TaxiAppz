import 'dart:convert';
import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../base/base_vm.dart';
import '../../bottom_sheets/confirmation_bs/confirmation_bs.dart';
import '../../main.dart';
import '../../network/response_models/subscription_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router_config.dart';

class SubscriptionVm extends BaseVm {
  int isSubscriptionListEmpty = 0;
  bool isDisposed = false;
  final random = Random();
  final List<Color> _subscriptionColorList = [
    CustomColors.subscrtionColorOne,
    CustomColors.subscrtionColorThree,
    CustomColors.subscrtionColorTwo,
    CustomColors.subscrtionColorFour,
  ];
  final List<String> _subscriptionBgList = [
    CustomImages.subscriptionBgOne,
    CustomImages.subscriptionBgTwo,
    CustomImages.subscriptionBgThree,
    CustomImages.subscriptionBgFour,
  ];
  int _listPosition = 0;
  List<SubscriptionModel>? subscriptionModelList;

  void getSubscriptionPackageList() async {
    final response = await apiHelper.get(AppUrls.subscriptionList);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data != null && r.data is List<dynamic>) {
        subscriptionModelList =
            List.from(r.data.map((m) => SubscriptionModel.fromJson(m)));
        if (subscriptionModelList?.isNotEmpty == true) {
          subscriptionModelList?.forEach((i) {
            i.color = _subscriptionColorList[
                _listPosition]; //getRandomColor(_subscriptionColorList, random);
            i.materialColor =
                createMaterialColor(i.color ?? CustomColors.subscrtionColorOne);
            i.imageUrl = _subscriptionBgList[_listPosition];
            _listPosition++;
            if (_listPosition == 4) {
              _listPosition = 0;
            }
          });
        }
      }
    });
    isSubscriptionListEmpty = subscriptionModelList?.isNotEmpty == true ? 2 : 1;
    notifyListeners();
  }

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void addSubscription(SubscriptionModel subscriptionModel) async {
    showLoader();
    final response = await showModalBottomSheet(
        context: navigatorKey.currentState!.context,
        backgroundColor: Colors.white,
        isDismissible: true,
        isScrollControlled: true,
        enableDrag: false,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20), topRight: Radius.circular(20))),
        builder: (_) {
          return ConfirmationBs(
            title: translation.txtSubscription,
            subTitle:
                "${translation.txtAreYouSureToSubscribe} ${subscriptionModel.name} ${translation.txtPlan}",
            primaryBtnTitle: translation.txtSubscribe,
            secondaryBtnTitle: translation.txt_cancel,
          );
        });
    if (response == true) {
      final response = await apiHelper.post(AppUrls.addSubscription,
          params: {AppConstants.subScriptionId: subscriptionModel.id});
      response.fold((e) => showErrorDialog(errorModel: e), (r) {
        if (r.data != null) {
          popAndMove(CustomRouterConfig.mapScreen);
        }
      });
    }
    hideLoader();
  }
}
