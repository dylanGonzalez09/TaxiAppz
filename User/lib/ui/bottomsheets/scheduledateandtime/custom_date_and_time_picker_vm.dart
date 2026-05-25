import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import '../../../modeldata/date_and_time_data.dart';
import '../../../modeldata/hours_data.dart';
import '../../../utils/base_vm.dart';


class CustomDateAndTimePickerVm extends BaseVm {
  final String am = "AM", pm = "PM";
  List<CustomDateAndTimeDate> dateAndTimeList = [];
  DateTime? startDateAndTime, currentDateAndTime;
  final ScrollController dateScrollController = ScrollController(),
      hourScrollController = ScrollController(),
      minutesScrollController = ScrollController();
  int dateHighlightedIndex = 2,
      hourHighlightedIndex = 2,
      minuteHighlightedIndex = 2;
  String selectedDate = "",
      selectedHour = "",
      selectedMinute = "",
      selectedAmOrPm = "";
  final dateFormatter = DateFormat('EEE d MMM yyyy');
  final hourFormatter = DateFormat('hh');
  final minuteFormatter = DateFormat('mm');
  List<HourData> hourList = [], minuteList = [];
  bool isMinuteScrolled = false,
      isHourScrolled = false,
      isAmSelected = true,
      isMinuteChangedUpdation = false,
      isHourChangedUpdation = false,
      isDateChangedUpdation = false,
      is24HourFormat = false;
  Timer? dateTimer, minuteTimer, hourTimer;
  double? previousDateOffset, previousHourOffset, previousMinuteOffset;

  void addDate() {
    if (dateAndTimeList.isEmpty) {
      startDateAndTime = currentDateAndTime?.add(const Duration(days: -2));
      dateAndTimeList.add(CustomDateAndTimeDate(
          dateTime: startDateAndTime!,
          isSelected: false,
          uiDate: dateFormatter.format(startDateAndTime!)));
    } else {
      startDateAndTime = dateAndTimeList.last.dateTime;
    }
    for (var i = 1; i <= 100; i++) {
      dateAndTimeList.add(CustomDateAndTimeDate(
          dateTime: startDateAndTime!.add(Duration(days: i)),
          isSelected: dateFormatter.format(DateTime.now()) ==
              dateFormatter.format(startDateAndTime!.add(Duration(days: i))),
          uiDate: dateFormatter.format(DateTime.now()) ==
                  dateFormatter.format(startDateAndTime!.add(Duration(days: i)))
              ? " Today "
              : dateFormatter
                  .format(startDateAndTime!.add(Duration(days: i)))));
    }
    if (selectedDate.isEmpty) {
      selectedDate = dateFormatter
          .format(dateAndTimeList.firstWhere((it) => it.isSelected).dateTime);
    }
  }

  void addHour({bool isReverse = false})  {
    if (hourList.isEmpty) {
      hourList.add(HourData(uiHour: " ", isSelected: false, pos: 0));
      hourList.add(HourData(uiHour: " ", isSelected: false, pos: 0));
    }
    final hour = DateTime.now();
    hour.add(const Duration(hours: -2));
    if (is24HourFormat) {
      for (var i = 1; i <= 24; i++) {
        hourList.add(HourData(
            uiHour: i <= 9 ? "0$i" : "$i",
            isSelected: hourFormatter.format(hour.copyWith(hour: i)) ==
                hourFormatter.format(DateTime.now()),
            pos: i - 1));
      }
    } else {
      if (isReverse) {
        for (var i = 12; i >= 1; --i) {
          hourList.insert(
              0,
              HourData(
                  uiHour: i <= 9 ? "0$i" : "$i",
                  isSelected: hourFormatter.format(hour.copyWith(hour: i)) ==
                      hourFormatter.format(DateTime.now()),
                  pos: i - 1));
        }
      } else {
        for (var i = 1; i <= 12; i++) {
          hourList.add(HourData(
              uiHour: i <= 9 ? "0$i" : "$i",
              isSelected: hourFormatter.format(hour.copyWith(hour: i)) ==
                  hourFormatter.format(DateTime.now()),
              pos: i - 1));
        }
      }
    }
    for (var i in hourList) {
      hourHighlightedIndex = i.isSelected ? i.pos - 2 : 2;
    }
  }

  void addMinute({bool isReverse = false}) {
    final hour = DateTime.now();
    hour.add(const Duration(minutes: -2));
    for (var i = 1; i <= 60; i++) {
      minuteList.add(
        HourData(
            uiHour: i <= 9 ? "0$i" : "$i",
            isSelected: minuteFormatter.format(hour.copyWith(minute: i)) ==
                minuteFormatter.format(DateTime.now()),
            pos: i - 1),
      );
    }
    for (var i in minuteList) {
      minuteHighlightedIndex = i.isSelected ? i.pos - 2 : 2;
    }
  }

  Future<void> initSetup() async {
    if (hourList.isNotEmpty) {
      await hourScrollController.animateTo(
          60.0 * (hourList.firstWhere((it) => it.isSelected).pos - 2),
          duration: const Duration(seconds: 1),
          curve: Curves.easeIn);
      selectedHour = hourList.firstWhere((it) => it.isSelected).uiHour;
    }
    if (minuteList.isNotEmpty) {
      await minutesScrollController.animateTo(
          60.0 * (minuteList.firstWhere((it) => it.isSelected).pos - 2),
          duration: const Duration(seconds: 1),
          curve: Curves.easeIn);
      selectedMinute = minuteList.firstWhere((it) => it.isSelected).uiHour;
    }
    isAmSelected = DateTime.now().hour < 12;
    previousDateOffset = dateScrollController.offset;
    previousHourOffset = hourScrollController.offset;
    previousMinuteOffset = minutesScrollController.offset;
  }

  bool isValueRound(double value) {
    return value % 1 == 0;
  }

  bool isValidHeight(double height) {
    return height % 60 == 0;
  }

  double setNextOfItsHeight(double value) {
    return (value / 60).ceil() * 60;
  }

  double setPreviousOfItsHeight(double value) {
    return (value / 60).floor() * 60;
  }
}
