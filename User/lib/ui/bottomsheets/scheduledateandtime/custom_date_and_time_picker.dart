import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../utils/dimensions.dart';
import 'custom_date_and_time_picker_vm.dart';
import 'on_date_change_listener.dart';

class CustomDateAndTimePicker extends StatefulWidget {
  DateTime? initDate;
  OnDateChangeListener onDateChangeListener;
  bool is24HourFormatter = false;

  CustomDateAndTimePicker(
      {super.key,
      required this.onDateChangeListener,
      this.initDate,
      this.is24HourFormatter = false});

  @override
  State<StatefulWidget> createState() => CustomDateAndTimePickerState();
}

class CustomDateAndTimePickerState extends State<CustomDateAndTimePicker> {
  final vm = CustomDateAndTimePickerVm();

  @override
  void initState() {
    vm.is24HourFormat = widget.is24HourFormatter;
    vm.currentDateAndTime = DateTime.now();
    vm.addDate();
    vm.addHour();
    vm.addMinute();
    vm.dateScrollController.addListener(onDateScrollStateChanged);
    vm.hourScrollController.addListener(onHourScrollStateChanged);
    vm.minutesScrollController.addListener(onMinuteScrollStateChanged);
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.initSetup();
      widget.onDateChangeListener.onDateChanged(vm.selectedDate +
          vm.selectedHour +
          vm.selectedMinute +
          (vm.isAmSelected ? vm.am : vm.pm));
    });
  }

  @override
  void dispose() {
    vm.dateTimer?.cancel();
    vm.dateScrollController.removeListener(onDateScrollStateChanged);
    vm.dateScrollController.dispose();
    vm.hourTimer?.cancel();
    vm.hourScrollController.removeListener(onHourScrollStateChanged);
    vm.hourScrollController.dispose();
    vm.minuteTimer?.cancel();
    vm.minutesScrollController.removeListener(onMinuteScrollStateChanged);
    vm.minutesScrollController.dispose();
    super.dispose();
  }

  void onDateScrollStateChanged() async {
    vm.dateTimer?.cancel();
    print("------onDateScrollStateChanged---------");
    double scrollPosition = vm.dateScrollController.offset;
    double itemHeight = 60.0;
    int index = (scrollPosition / itemHeight).round();

    print(
        "onDateScroll------------------------scrollPosition ${scrollPosition}");
    if (index != vm.dateHighlightedIndex &&
        index >= 0 &&
        index < vm.dateAndTimeList.length) {
      vm.dateHighlightedIndex = index + 2;
      vm.selectedDate =
          "${vm.dateAndTimeList[vm.dateHighlightedIndex].dateTime}";
      widget.onDateChangeListener.onDateChanged(vm.selectedDate +
          vm.selectedHour +
          vm.selectedMinute +
          (vm.isAmSelected ? vm.am : vm.pm));
      setState(() {});
    }

    if (vm.dateScrollController.position.pixels ==
        vm.dateScrollController.position.maxScrollExtent) {
      vm.addDate();
      setState(() {});
    }

    print(
        "ondateScrollListener---------------------1-------------------- \n vm.isValueRound(scrollPosition) \t ${vm.isValueRound(scrollPosition)}\n- > vm.minutesScrollController.position.isScrollingNotifier.value \t ${vm.minutesScrollController.position.isScrollingNotifier.value} \n---> ${scrollPosition}");
    vm.dateTimer = await Timer(const Duration(seconds: 1), () async {
      if (vm.isValidHeight(scrollPosition) != true &&
          !vm.dateScrollController.position.isScrollingNotifier.value) {
        print(
            "ondateScrollListener---------------------2---------------------${scrollPosition}");
        await vm.dateScrollController.animateTo(
            vm.previousDateOffset! < scrollPosition
                ? vm.setNextOfItsHeight(scrollPosition.roundToDouble())
                : vm.setPreviousOfItsHeight(scrollPosition.roundToDouble()),
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut);
        print(
            "ondateScrollListener---------------------3---------------------${vm.setNextOfItsHeight(scrollPosition)}");
      }
      vm.previousDateOffset = scrollPosition;
      vm.dateTimer?.cancel();
    });
  }

  void onHourScrollStateChanged() async {
    vm.hourTimer?.cancel();
    print("------onHourScrollStateChanged---------");
    double scrollPosition = vm.hourScrollController.offset;
    double itemHeight = 60.0;
    int index = (scrollPosition / itemHeight).round();
    print(
        "onHourScrollStateChanged------------------------scrollPosition ${scrollPosition}");

    if (index != vm.hourHighlightedIndex &&
        index >= 0 &&
        index < vm.hourList.length) {
      vm.hourHighlightedIndex = index + 2;
      vm.selectedHour = vm.hourList[vm.hourHighlightedIndex].uiHour;
      widget.onDateChangeListener.onDateChanged(vm.selectedDate +
          vm.selectedHour +
          vm.selectedMinute +
          (vm.isAmSelected ? vm.am : vm.pm));
      setState(() {});
    }
    if (vm.hourScrollController.position.pixels ==
        vm.hourScrollController.position.maxScrollExtent) {
      vm.addHour();
      setState(() {});
    }
    if (vm.hourScrollController.position.pixels ==
        vm.hourScrollController.position.minScrollExtent) {
      vm.addHour(isReverse: true);
      setState(() {});
    }

    print(
        "onHourScrollListener---------------------1-------------------- \n vm.isValueRound(scrollPosition) \t ${vm.isValueRound(scrollPosition)}\n- > vm.minutesScrollController.position.isScrollingNotifier.value \t ${vm.minutesScrollController.position.isScrollingNotifier.value} \n---> ${scrollPosition}");
    vm.hourTimer = await Timer(const Duration(seconds: 1), () async {
      if (vm.isValidHeight(scrollPosition) != true &&
          !vm.hourScrollController.position.isScrollingNotifier.value) {
        print(
            "onHourScrollListener---------------------2---------------------${scrollPosition}");
        await vm.hourScrollController.animateTo(
            vm.previousHourOffset! < scrollPosition
                ? vm.setNextOfItsHeight(scrollPosition.roundToDouble())
                : vm.setPreviousOfItsHeight(scrollPosition.roundToDouble()),
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut);
        print(
            "onHourScrollListener---------------------3---------------------${vm.setNextOfItsHeight(scrollPosition)}");
      }
      vm.previousHourOffset = scrollPosition;
      vm.hourTimer?.cancel();
    });
  }

  void onMinuteScrollStateChanged() async {
    vm.minuteTimer?.cancel();
    print(
        "------onMinuteScrollStateChanged---------${vm.minutesScrollController.offset}");
    double scrollPosition = vm.minutesScrollController.offset;
    double itemHeight = 60.0;
    int index = (scrollPosition / itemHeight).round();
    print(
        "onMinuteScrollStateChanged------------------------scrollPosition $scrollPosition");
    if (index != vm.minuteHighlightedIndex &&
        index >= 0 &&
        index < vm.minuteList.length) {
      vm.minuteHighlightedIndex = index + 2;
      vm.selectedMinute = vm.minuteList[vm.minuteHighlightedIndex].uiHour;
      widget.onDateChangeListener.onDateChanged(vm.selectedDate +
          vm.selectedHour +
          vm.selectedMinute +
          (vm.isAmSelected ? vm.am : vm.pm));

      setState(() {});
    }
    if (vm.minutesScrollController.position.pixels ==
        vm.minutesScrollController.position.maxScrollExtent) {
      vm.addMinute();
      setState(() {});
    }

    print(
        "onMInuteScrollListener---------------------1-------------------- \n vm.isValueRound(scrollPosition) \t ${vm.isValueRound(scrollPosition)}\n- > vm.minutesScrollController.position.isScrollingNotifier.value \t ${vm.minutesScrollController.position.isScrollingNotifier.value} \n---> $scrollPosition -----------------\n scrollPosition > vm.previousMinuteOffset! ------------>\t ${scrollPosition > vm.previousMinuteOffset!} \n scrollPosition --> ${scrollPosition} \n  vm.previousMinuteOffset! ---> ${vm.previousMinuteOffset!}");
    vm.minuteTimer = Timer(const Duration(seconds: 1), () async {
      if (vm.isValidHeight(scrollPosition) != true &&
          !vm.minutesScrollController.position.isScrollingNotifier.value) {
        print(
            "onMInuteScrollListener---------------------2---------------------${scrollPosition}");
        await vm.minutesScrollController.animateTo(
            vm.previousMinuteOffset! < scrollPosition
                ? vm.setNextOfItsHeight(scrollPosition.roundToDouble())
                : vm.setPreviousOfItsHeight(scrollPosition.roundToDouble()),
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut);
        if (kDebugMode) {
          print(
              "onMInuteScrollListener---------------------3---------------------${vm.setNextOfItsHeight(scrollPosition)}");
        }
      }
      vm.previousMinuteOffset = scrollPosition;
      vm.minuteTimer?.cancel();
    });
  }

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Expanded(
            flex: 3,
            child: ListView.builder(
                physics: const BouncingScrollPhysics(),
                controller: vm.dateScrollController,
                shrinkWrap: true,
                itemCount: vm.dateAndTimeList.length,
                itemBuilder: (c, p) {
                  return Container(
                    alignment: Alignment.center,
                    height: Dimensions.padding_60,
                    child: Text(
                      vm.dateAndTimeList[p].uiDate,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontSize: p == vm.dateHighlightedIndex
                              ? Dimensions.padding_16
                              : Dimensions.padding_15,
                          fontWeight: p == vm.dateHighlightedIndex
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: p == vm.dateHighlightedIndex
                              ? Colors.black
                              : Colors.grey),
                    ),
                  );
                }),
          ),
          Expanded(
            flex: 1,
            child: ListView.builder(
                shrinkWrap: true,
                physics: const BouncingScrollPhysics(),
                controller: vm.hourScrollController,
                itemCount: vm.hourList.length,
                itemBuilder: (c, p) {
                  //  final p = position % vm.hourList.length;
                  return Container(
                    alignment: Alignment.center,
                    height: Dimensions.padding_60,
                    child: Text(
                      vm.hourList[p].uiHour,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontSize: p == vm.hourHighlightedIndex
                              ? Dimensions.padding_16
                              : Dimensions.padding_15,
                          fontWeight: p == vm.hourHighlightedIndex
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: p == vm.hourHighlightedIndex
                              ? Colors.black
                              : Colors.grey),
                    ),
                  );
                }),
          ),
          Expanded(
            flex: 1,
            child: ListView.builder(
                shrinkWrap: true,
                physics: const BouncingScrollPhysics(),
                controller: vm.minutesScrollController,
                itemCount: vm.minuteList.length,
                itemBuilder: (c, p) {
                  // final p = position % vm.minuteList.length;
                  return Container(
                    alignment: Alignment.center,
                    height: Dimensions.padding_60,
                    child: Text(
                      vm.minuteList[p].uiHour,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontSize: p == vm.minuteHighlightedIndex
                              ? Dimensions.padding_16
                              : Dimensions.padding_15,
                          fontWeight: p == vm.minuteHighlightedIndex
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: p == vm.minuteHighlightedIndex
                              ? Colors.black
                              : Colors.grey),
                    ),
                  );
                }),
          ),
          Visibility(
            visible: !vm.is24HourFormat,
            child: Expanded(
              flex: 1,
              child: Column(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  InkWell(
                    onTap: () {
                      setState(() {
                        vm.isAmSelected = true;
                        widget.onDateChangeListener.onDateChanged(
                            vm.selectedDate +
                                vm.selectedHour +
                                vm.selectedMinute +
                                (vm.isAmSelected ? vm.am : vm.pm));
                      });
                    },
                    child: Text(
                      vm.translation.txt_am,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontSize: vm.isAmSelected
                              ? Dimensions.padding_16
                              : Dimensions.padding_15,
                          fontWeight: vm.isAmSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: vm.isAmSelected ? Colors.black : Colors.grey),
                    ),
                  ),
                  const SizedBox(
                    height: 30.0,
                  ),
                  InkWell(
                    onTap: () {
                      setState(() {
                        vm.isAmSelected = false;
                        widget.onDateChangeListener.onDateChanged(
                            vm.selectedDate +
                                vm.selectedHour +
                                vm.selectedMinute +
                                (vm.isAmSelected ? vm.am : vm.pm));
                      });
                    },
                    child: Text(
                      vm.translation.txt_pm,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontSize: !vm.isAmSelected
                              ? Dimensions.padding_16
                              : Dimensions.padding_15,
                          fontWeight: !vm.isAmSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: !vm.isAmSelected ? Colors.black : Colors.grey),
                    ),
                  )
                ],
              ),
            ),
          ),
        ],
      );
}
