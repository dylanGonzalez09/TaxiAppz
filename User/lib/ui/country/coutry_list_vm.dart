import 'dart:convert';

import 'package:flutter/cupertino.dart';

import '../../network/response_models/country_model.dart';
import '../../utils/base_vm.dart';
import '../../utils/preference_helper.dart';

class CountryListVm extends BaseVm {
  final searchController = TextEditingController();
  final List<CountryModel> oldCountryList = [];
  final List<CountryModel> countryList = [];

  bool isDisposed = false;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void setUpCountry() {
    final data = preference.getString(PreferenceHelper.countryList) ?? "";
    if (data.isNotEmpty) {
      final response = jsonDecode(data);
      final countryModel = List<CountryModel>.from(
          response.map((model) => CountryModel.fromJson(model)));
      oldCountryList.addAll(countryModel);
      countryList.addAll(countryModel);
    }
  }

  void addSearchListener() {
    searchController.addListener(() {
      if (searchController.text.isNotEmpty) {
        final list = oldCountryList
            .where((e) =>
                e.name
                        ?.toLowerCase()
                        .contains(searchController.text.toLowerCase().trim()) ==
                    true ||
                e.dialCode
                        ?.toLowerCase()
                        .contains(searchController.text.toLowerCase().trim()) ==
                    true)
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
