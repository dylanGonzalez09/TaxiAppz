import 'dart:ui';

import 'package:flutter/material.dart';

class SubscriptionModel {
  String? unit;
  String? name;
  String? validityPeriod;
  String? description;
  bool? status;
  int? amount;
  String? id, imageUrl;
  Color? color;
  MaterialColor? materialColor;

  SubscriptionModel(
      {this.unit,
      this.name,
      this.validityPeriod,
      this.description,
      this.status,
      this.amount,
      this.id,
      this.color,
      this.materialColor,
      this.imageUrl});

  SubscriptionModel.fromJson(Map<String, dynamic> json) {
    unit = json['unit'];
    name = json['name'];
    validityPeriod = json['validityPeriod'];
    description = json['description'];
    status = json['status'];
    amount = json['amount'];
    id = json['id'];
    if (json['color'] != null) {
      color = json['color'];
    }
    if (json['materialColor'] != null) {
      materialColor = json['materialColor'];
    }
    if (json['imageUrl'] != null) {
      imageUrl = json['imageUrl'];
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['unit'] = unit;
    data['name'] = name;
    data['validityPeriod'] = validityPeriod;
    data['description'] = description;
    data['status'] = status;
    data['amount'] = amount;
    data['id'] = id;
    if (color != null) {
      data['color'] = color;
    }
    if (materialColor != null) {
      data['materialColor'] = materialColor;
    }
    if (imageUrl != null) {
      data['imageUrl'] = imageUrl;
    }
    return data;
  }
}
