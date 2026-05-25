import '../../utils/utils.dart';

class DashboardHistoryModel {
  Summaries? summaries;
  List<TripHistory>? tripHistory;
  int? page;
  int? limit;
  int? totalPages;
  int? totalResults;

  DashboardHistoryModel({
    this.summaries,
    this.tripHistory,
    this.page,
    this.limit,
    this.totalPages,
    this.totalResults,
  });

  DashboardHistoryModel.fromJson(Map<String, dynamic> json) {
    summaries = json['summaries'] != null
        ? Summaries.fromJson(json['summaries'])
        : null;
    if (json['tripHistory'] != null) {
      tripHistory = <TripHistory>[];
      json['tripHistory'].forEach((v) {
        tripHistory!.add(TripHistory.fromJson(v));
      });
    }
    page = json['page'];
    limit = json['limit'];
    totalPages = json['totalPages'];
    totalResults = json['totalResults'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (summaries != null) data['summaries'] = summaries!.toJson();
    if (tripHistory != null) {
      data['tripHistory'] = tripHistory!.map((v) => v.toJson()).toList();
    }
    data['page'] = page;
    data['limit'] = limit;
    data['totalPages'] = totalPages;
    data['totalResults'] = totalResults;
    return data;
  }
}

class Summaries {
  CurrentMonth? currentMonth;
  CurrentMonth? previousMonth;

  Summaries({this.currentMonth, this.previousMonth});

  Summaries.fromJson(Map<String, dynamic> json) {
    currentMonth = json['currentMonth'] != null
        ? CurrentMonth.fromJson(json['currentMonth'])
        : null;
    previousMonth = json['previousMonth'] != null
        ? CurrentMonth.fromJson(json['previousMonth'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (currentMonth != null) data['currentMonth'] = currentMonth!.toJson();
    if (previousMonth != null) data['previousMonth'] = previousMonth!.toJson();
    return data;
  }
}

class CurrentMonth {
  int? tripCount;
  double? income;
  String? currency;

  CurrentMonth({this.tripCount, this.income, this.currency});

  CurrentMonth.fromJson(Map<String, dynamic> json) {
    tripCount = json['tripCount'];
    income = Utils.convertToDouble(json['income']);
    currency = json['currency'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['tripCount'] = tripCount;
    data['income'] = income;
    data['currency'] = currency;
    return data;
  }
}

class TripHistory {
  int? tripCount;
  double? earnings;
  String? date;

  TripHistory({this.tripCount, this.earnings, this.date});

  TripHistory.fromJson(Map<String, dynamic> json) {
    tripCount = json['tripCount'];
    earnings = Utils.convertToDouble(json['earnings']); // ✅ FIX
    date = json['date'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['tripCount'] = tripCount;
    data['earnings'] = earnings;
    data['date'] = date;
    return data;
  }
}

