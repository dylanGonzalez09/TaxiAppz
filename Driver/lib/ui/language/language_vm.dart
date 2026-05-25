import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/network/response_models/config_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

import '../../main.dart';
import '../../network/response_models/language_model.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/app_urls.dart';
import '../../utils/preference_helper.dart';

class LanguageVm extends BaseVm {
  List<LanguageModel> languages = [];
  bool showBackButton = false;

  bool isDriverIdValid() {
    final driverId = preference.getString(PreferenceHelper.driverId) ?? "";
    return driverId.isNotEmpty;
  }

  void setLanguages() {
    final data = preference.getString(PreferenceHelper.config);
    showBackButton =
        preference.getString(PreferenceHelper.languageCode)?.isNotEmpty == true;
    var selectedLanguage = "";
    if (data != null && data.isNotEmpty == true) {
      final config = ConfigModel.fromJson(jsonDecode(data));
      config.settings?.forEach((item) {
        if (item.name == SettingsEnum.keys.name) {
          selectedLanguage = item.settings?.defaultLanguage ?? "";
        }
      });
      config.languages?.forEach((language) {
        if (selectedLanguage == language.code) {
          language.isSelected = true;
        }
        languages.add(language);
      });
    }
  }

  void proceed() {
    LanguageModel? data =
        languages.firstWhereOrNull((element) => element.isSelected == true);
    if (data == null) {
      showErrorDialog(message: translation.txt_Select_language_to_proceed);
    } else {
      print('get language data: ${data.code}');
      preference.setString(PreferenceHelper.languageCode, data.code ?? "");
      preference.setString(PreferenceHelper.languageId, data.sId ?? "");
      _getTranslation(data.code ?? "en");
    }
  }

  void _getTranslation(String code) async {
    isLoading.value = true;
    final response = await apiHelper.get("${AppUrls.getTranslation}$code");
    isLoading.value = false;
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      final translation = parseData(r.data, TranslationModel.fromJson);
      if (translation != null) {
        preference.setString(
            PreferenceHelper.translation, jsonEncode(translation.toJson()));

        final locale = Locale(code);
        MyApp.of(navigatorKey.currentState!.context)?.setLocale(locale);

        if (isDriverIdValid()) {
          popAndMove(CustomRouterConfig.permissionScreen,
              args: CustomRouterConfig.mapScreen);
        } else {
          popAndMove(CustomRouterConfig.introScreen);
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }
}
