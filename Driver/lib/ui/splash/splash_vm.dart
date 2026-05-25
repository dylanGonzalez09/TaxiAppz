import 'dart:convert';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/network/response_models/config_model.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/custom_error_model.dart';
import '../../network/response_models/intro_model.dart';
import '../../utils/custom_navigator_observer.dart';
import '../../utils/preference_helper.dart';

class SplashVm extends BaseVm {
  final deviceInfo = DeviceInfoPlugin();

  bool isUpdateAvailable = false;
  ErrorModel? model;
  TranslationModel? translationModel;

  Future<void> getConfig() async {
    AppConstants.driverAppName = packageInfo.appName;
    final versionCode = Platform.isAndroid
        ? AppConstants.androidVersionCode
        : Platform.isIOS
            ? AppConstants.iosVersionCode
            : AppConstants.windowsVersionCode;

    final languageCode = preference.getString(PreferenceHelper.languageCode);
    final body = {AppConstants.Code: versionCode};

    final futures = [apiHelper.post(AppUrls.getConfig, params: body)];
    if (languageCode?.isNotEmpty == true) {
      futures.add(apiHelper.get("${AppUrls.getTranslation}$languageCode"));
    }

    final response = await Future.wait(futures);

    await _handleConfigResponse(response[0]);

    if (languageCode?.isNotEmpty == true) {
      await _handleTranslationResponse(response[1]);
    }
  }

  Future<void> _handleConfigResponse(dynamic result) async {
    result.fold((e) {
      model = e;
      if (e.statusCode == 426) {
        isUpdateAvailable = true;
        final code =
            preference.getString(PreferenceHelper.languageCode) ?? "en";
        print(":rfokrpoefeprog");
        _initNavigation(code);
      } else {
        showErrorDialog(errorModel: e);
      }
    }, (r) {
      final config = parseData(r.data, ConfigModel.fromJson);
      if (config != null) {
        preference.setString(
            PreferenceHelper.config, jsonEncode(config.toJson()));
        if (preference.getString(PreferenceHelper.languageCode)?.isNotEmpty !=
            true) {
          config.settings?.forEach((data) {
            if (data.name == SettingsEnum.general.name) {
              final code = data.settings?.defaultLanguage ?? "en";
              _initNavigation(code);
              return;
            }
          });
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> _handleTranslationResponse(dynamic result) async {
    result.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) async {
      translationModel = parseData(r.data, TranslationModel.fromJson);
      if (translationModel != null) {
        preference.setString(PreferenceHelper.translation,
            jsonEncode(translationModel?.toJson()));
        if (!isUpdateAvailable) {
          final hasToken =
              (preference.getString(PreferenceHelper.authToken) ?? "")
                  .isNotEmpty;
          print("frefpefrge$hasToken");
          if (hasToken) {
            print("wefwfergeg$hasToken");
            await _connectToMqttAndMove();
          } else {
            popAndMove(CustomRouterConfig.loginScreen);
          }
        } else {
          updateApp(model, translationModel);
        }
      } else {
        handleTranslationError();
      }
    });
  }

  void handleTranslationError() {
    if (model?.statusCode == 426) {
      isUpdateAvailable = true;
      updateApp(model, translationModel);
    } else {
      showErrorDialog(message: AppConstants.someThingWentWrong);
    }
  }

  Future<void> _getTranslation(String code, bool moveToLogin) async {
    final response = await apiHelper.get("${AppUrls.getTranslation}$code");
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) async {
      translationModel = parseData(r.data, TranslationModel.fromJson);
      if (translationModel != null) {
        preference.setString(PreferenceHelper.translation,
            jsonEncode(translationModel?.toJson()));
        if (!isUpdateAvailable) {
          moveToLogin
              ? await _connectToMqttAndMove()
              : popAndMove(CustomRouterConfig.loginScreen);
        } else {
          updateApp(model, translationModel);
        }
      } else {
        handleTranslationError();
      }
    });
  }

  Future<void> _initNavigation(String code,
      {bool isLanguageSelected = false}) async {
    print("ojfpfjepgreg");
    final token = preference.getString(PreferenceHelper.authToken) ?? "";
    if (token.isNotEmpty) {
      print("rfjpjrepjgrege");
      _getTranslation(code, true);
    } else {
      print("fokoperkfeg");
      final selectedLanguageCode =
          preference.getString(PreferenceHelper.languageCode) ?? "";
      if (selectedLanguageCode.isNotEmpty) {
        _getTranslation(code, false);
      } else {
        await _fetchInitialData(code);
        if (!isUpdateAvailable) {
          popAndMove(CustomRouterConfig.languageScreen);
        } else {
          updateApp(model, translationModel);
        }
      }
    }
  }

  Future<void> _fetchInitialData(String code) async {
    final allResponse = await Future.wait([
      apiHelper.get("${AppUrls.getTranslation}$code"),
      apiHelper.get(AppUrls.getIntroList),
      apiHelper.get(AppUrls.getCountryList),
    ]);

    await _handleInitialTranslation(allResponse[0]);
    await _handleIntroList(allResponse[1]);
    await _handleCountryList(allResponse[2]);
  }

  Future<void> _handleInitialTranslation(dynamic response) async {
    response.fold((e) {
      if (e.statusCode == 426) {
        updateApp(e, translationModel);
      } else {
        showErrorDialog(errorModel: e);
      }
    }, (r) {
      translationModel = parseData(r.data, TranslationModel.fromJson);
      if (translationModel != null) {
        preference.setString(PreferenceHelper.translation,
            jsonEncode(translationModel?.toJson()));
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> _handleIntroList(dynamic response) async {
    response.fold((e) {
      if (e.statusCode == 426) {
        updateApp(e, translationModel);
      } else {
        showErrorDialog(errorModel: e);
      }
    }, (r) async {
      try {
        final jsonList = List<IntroModel>.from(
          (jsonDecode(json.encode(r.data)) as List)
              .map((model) => IntroModel.fromJson(model)),
        );
        final list = jsonList
            .map((e) => precacheImage(
                  CachedNetworkImageProvider(
                      "${AppConstants.imageBaseUrl}${e.image}"),
                  navigatorKey.currentState!.context,
                ))
            .toList();
        await Future.wait(list);
        preference.setString(PreferenceHelper.introContent,
            jsonEncode(jsonList.map((e) => e.toJson()).toList()));
      } catch (e) {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> _handleCountryList(dynamic response) async {
    response.fold((e) {
      if (e.statusCode == 426) {
        updateApp(e, translationModel);
      } else {
        showErrorDialog(errorModel: e);
      }
    }, (r) {
      final countryList = List<CountryModel>.from(
        (jsonDecode(json.encode(r.data)) as List)
            .map((e) => CountryModel.fromJson(e)),
      );
      preference.setString(
          PreferenceHelper.countryList, jsonEncode(countryList));
    });
  }

  Future<void> _connectToMqttAndMove() async {
    final context = navigatorKey.currentState!.context;
    await MyApp.of(context)?.connectToMqtt();
    await MyApp.of(context)?.subscribeTODriverDetails();
    MyApp.of(context)?.overlayHelper.closeOverlayWindow();
    moveToMapScreen();
  }

  void moveToMapScreen() {
    popAndMove(CustomRouterConfig.permissionScreen,
        args: CustomRouterConfig.mapScreen);
  }

  void updateApp(ErrorModel? model, TranslationModel? translation) {
    checkAndOpenSecondScreen(navigatorKey.currentState!.context, translation);
  }

  Future<void> checkAndOpenSecondScreen(
      BuildContext context, TranslationModel? model) async {
    if (CustomNavigatorObserver.currentRoute != CustomRouterConfig.updateApp) {
      popAndMove(CustomRouterConfig.updateApp, args: model);
    }
  }

  Future<void> getAppVersion() async {
    await deviceInfo.androidInfo; // If you plan to use it later
  }
}
