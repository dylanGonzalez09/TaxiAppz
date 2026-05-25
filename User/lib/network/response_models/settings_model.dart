



import 'package:user/network/response_models/setting.dart';

class SettingsModel {
  String? name;
  Setting? settings;

  SettingsModel({this.name, this.settings});

  SettingsModel.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    settings = json['settings'] != null
        ?  Setting.fromJson(json['settings'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data =  <String, dynamic>{};
    data['name'] = name;
    if (settings != null) {
      data['settings'] = settings!.toJson();
    }
    return data;
  }
}