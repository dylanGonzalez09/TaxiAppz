import '../network/response_models/trip_model.dart';

class CustomHistoryModel{
  String date;
  List<Trip> trip = [];
  CustomHistoryModel(this.date,this.trip);
}