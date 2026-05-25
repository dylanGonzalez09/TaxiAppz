import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/intro_model.dart';

import '../../utils/preference_helper.dart';

class IntroVm extends BaseVm {

  List<IntroModel> introContent = [];
  RxInt selectedIndex = 0.obs;
  final pageController = PageController();
  RxBool isLastPage = false.obs;

  void onPageChanged(int value){
    selectedIndex.value = value;
    notifyListeners();
  }

  void changePageIndex(int index){
    if(pageController.hasClients){
      pageController.jumpToPage(index);
    }
    selectedIndex.value = index;
    notifyListeners();
  }

  void setContent(){
    final data = preference.getString(PreferenceHelper.introContent) ??"";
    if(data.isNotEmpty){
      final response = jsonDecode(data);
      var jsonString = jsonDecode(json.encode(response));
      final introContent = List<IntroModel>.from(
          jsonString.map((model) => IntroModel.fromJson(model)));
      this.introContent.addAll(introContent);
      checkForLastPage(0);
    }
    notifyListeners();
  }

  void checkForLastPage(int index){
    if(index == introContent.length-1){
      isLastPage.value = true;
    }else{
      isLastPage.value = false;
    }
    notifyListeners();
  }


}
