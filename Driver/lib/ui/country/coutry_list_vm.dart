import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/country_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';

import '../../utils/preference_helper.dart';

class CountryListVm extends BaseVm {
  final searchController = TextEditingController();
  final List<CountryModel> oldCountryList = [];
  final List<CountryModel> countryList = [];

  bool isDisposed = false;

  @override
  void notifyListeners() {
   if(!isDisposed){
     super.notifyListeners();
   }
  }

  void setUpCountry() {
    final data = preference.getString(PreferenceHelper.countryList) ?? "";
    if (data.isNotEmpty) {
      final response = jsonDecode(data);
      var jsonString = jsonDecode(json.encode(response));
      final countryModel = List<CountryModel>.from(
          jsonString.map((model) => CountryModel.fromJson(model)));
      oldCountryList.addAll(countryModel);
      countryList.addAll(countryModel);
    }
  }

  void addSearchListener(){
    searchController.addListener((){
      if (searchController.text.isNotEmpty) {
        final list = oldCountryList
            .where((e) =>
        e.name?.toLowerCase().contains(searchController.text.toLowerCase().trim()) == true ||
            e.dialCode?.toLowerCase().contains(searchController.text.toLowerCase().trim()) == true)
            .toList();
        print(list);
        countryList.clear();
        countryList.addAll(list);
      } else {
        countryList.clear();
        countryList.addAll(oldCountryList);
      }
      notifyListeners();
    });
  }
}

