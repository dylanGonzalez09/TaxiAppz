import 'package:taxiappzpro/network/response_models/language_model.dart';
import 'package:taxiappzpro/network/response_models/settings_model.dart';

class ConfigModel {
  List<LanguageModel>? languages;
  List<SettingsModel>? settings;

  ConfigModel({this.languages, this.settings});

  ConfigModel.fromJson(Map<String, dynamic> json) {
    if (json['languages'] != null) {
      languages = <LanguageModel>[];
      json['languages'].forEach((v) {
        languages!.add( LanguageModel.fromJson(v));
      });
    }
    if (json['settings'] != null) {
      settings = <SettingsModel>[];
      json['settings'].forEach((v) {
        settings!.add( SettingsModel.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data =  <String, dynamic>{};
    if (languages != null) {
      data['languages'] = languages!.map((v) => v.toJson()).toList();
    }
    if (settings != null) {
      data['settings'] = settings!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}





