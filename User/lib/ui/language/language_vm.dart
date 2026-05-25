import 'dart:convert';
import 'dart:ui';
import 'package:collection/collection.dart';

import '../../main.dart';
import '../../modeldata/app_enum.dart';
import '../../network/response_models/config_model.dart';
import '../../network/response_models/language_model.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_router.dart';
import '../../utils/preference_helper.dart';

class LanguageVm extends BaseVm {
  List<LanguageModel> languages = [];

  bool isUserIdValid() {
    final userId = preference.getString(PreferenceHelper.userId) ?? "";
    return userId.isNotEmpty;
  }

  void setLanguages() {
    final data = preference.getString(PreferenceHelper.config);
    var selectedLanguage = "";
    if (data != null && data.isNotEmpty == true) {
      final config = ConfigModel.fromJson(jsonDecode(data));
      config.settings?.forEach((item) {
        if (item.name == SettingsEnum.keys.name) {
          selectedLanguage = item.settings?.defaultLanguage ?? "";
        }
      });
      config.languages?.forEach((language) {
        if(selectedLanguage == language.code){
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
      preference.setString(PreferenceHelper.languageCode, data.code ?? "");
      print('data.code ${data.code}');
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

        if (isUserIdValid()) {
          popAndMove(CustomRouter.mapScreen);
        } else {
          popAndMove(CustomRouter.introScreen);
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }
}
