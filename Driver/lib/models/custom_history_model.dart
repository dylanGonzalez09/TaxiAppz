import 'dart:convert';

import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';

class CustomHistoryModel {
  String date;
  List<TripModel> trip = [];
  CustomHistoryModel(this.date, this.trip);

  Map<String, dynamic> toJson() =>
      {AppConstants.date: date, AppConstants.trip: trip};
}
