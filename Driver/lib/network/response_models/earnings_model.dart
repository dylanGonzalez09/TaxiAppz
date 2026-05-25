import 'package:taxiappzpro/utils/utils.dart';

class EarningsModel {
  Dashboard? dashboard;

  EarningsModel({this.dashboard});

  EarningsModel.fromJson(Map<String, dynamic> json) {
    dashboard = json['dashboard'] != null
        ? Dashboard.fromJson(json['dashboard'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (dashboard != null) {
      data['dashboard'] = dashboard!.toJson();
    }
    return data;
  }
}

class Dashboard {
  List<EarningsByDay>? earningsByDay;
  Summaries? summaries;

  Dashboard({this.earningsByDay, this.summaries});

  Dashboard.fromJson(Map<String, dynamic> json) {
    if (json['earningsByDay'] != null) {
      earningsByDay = <EarningsByDay>[];
      json['earningsByDay'].forEach((v) {
        earningsByDay!.add(EarningsByDay.fromJson(v));
      });
    }
    summaries = json['summaries'] != null
        ? Summaries.fromJson(json['summaries'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (earningsByDay != null) {
      data['earningsByDay'] = earningsByDay!.map((v) => v.toJson()).toList();
    }
    if (summaries != null) {
      data['summaries'] = summaries!.toJson();
    }
    return data;
  }
}

class EarningsByDay {
  String? day;
  int? trips;
  double? earnings;
  bool? completed;

  EarningsByDay({this.day, this.trips, this.earnings, this.completed});

  EarningsByDay.fromJson(Map<String, dynamic> json) {
    day = json['day'];
    trips = json['trips'];
    earnings = Utils.convertToDouble(json['earnings']);
    completed = json['completed'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['day'] = day;
    data['trips'] = trips;
    data['earnings'] = earnings;
    data['completed'] = completed;
    return data;
  }
}

class Summaries {
  Today? today;
  Today? yesterday;
  Today? currentWeek;
  Today? currentMonth;

  Summaries({this.today, this.yesterday, this.currentWeek, this.currentMonth});

  Summaries.fromJson(Map<String, dynamic> json) {
    today = json['today'] != null ? Today.fromJson(json['today']) : null;
    yesterday =
        json['yesterday'] != null ? Today.fromJson(json['yesterday']) : null;
    currentWeek = json['currentWeek'] != null
        ? Today.fromJson(json['currentWeek'])
        : null;
    currentMonth = json['currentMonth'] != null
        ? Today.fromJson(json['currentMonth'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (today != null) {
      data['today'] = today!.toJson();
    }
    if (yesterday != null) {
      data['yesterday'] = yesterday!.toJson();
    }
    if (currentWeek != null) {
      data['currentWeek'] = currentWeek!.toJson();
    }
    if (currentMonth != null) {
      data['currentMonth'] = currentMonth!.toJson();
    }
    return data;
  }
}

class Today {
  int? tripCount;
  int? income;
  String? currency;

  Today({this.tripCount, this.income, this.currency});

  Today.fromJson(Map<String, dynamic> json) {
    tripCount = json['tripCount'];
    income = (json['income'] as num?)?.toInt();
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
