

import '../../utils/app_constants.dart';

class CustomNameModel {
  String? name;
  String? id;
  bool isSelected = false;

  CustomNameModel({this.name, this.id, this.isSelected = false});

  CustomNameModel.fromJson(Map<String, dynamic> json) {
    name = json[AppConstants.name];
    id = json[AppConstants.id];
    isSelected = json[AppConstants.isSelected];
  }

  Map<String, dynamic> toJson() => {
    AppConstants.name: name,
    AppConstants.id: id,
    AppConstants.isSelected: isSelected
  };
}
