import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../components/submit_button.dart';
import '../../../models/enums.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import 'date_picker_vm.dart';

class DatePickerBs extends StatefulWidget {
  final DateTime initialDateTime;

  const DatePickerBs({super.key, required this.initialDateTime});

  @override
  _DatePickerBsState createState() => _DatePickerBsState();
}

class _DatePickerBsState extends State<DatePickerBs> {
  final vm = DatePickerVm();
  Key datePickerKey = UniqueKey();
  late DateTime selectedDateTime;
  late DateTime minimumDateTime;
  late DateTime maximumDateTime;
  static const int maxScheduleDays = 15;

  @override
  void initState() {
    super.initState();
    _updateDateTime();
  }

  void _updateDateTime() {
    final now = DateTime.now().add(const Duration(minutes: 30));

    minimumDateTime = DateTime(
      now.year,
      now.month,
      now.day,
      now.hour,
      now.minute,
      0,
    );

    final maxDay = DateTime.now().add(const Duration(days: maxScheduleDays));
    maximumDateTime = DateTime(
      maxDay.year,
      maxDay.month,
      maxDay.day,
      23,
      59,
      0,
    );


    DateTime clamped = widget.initialDateTime.isBefore(minimumDateTime)
        ? minimumDateTime
        : widget.initialDateTime.isAfter(maximumDateTime)
        ? maximumDateTime
        : DateTime(
      widget.initialDateTime.year,
      widget.initialDateTime.month,
      widget.initialDateTime.day,
      widget.initialDateTime.hour,
      widget.initialDateTime.minute,
      0,
    );

    selectedDateTime = clamped;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  vm.translation.txt_pickUp_time,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.black,
                    fontSize: 18,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    _updateDateTime();
                    setState(() {
                      datePickerKey = UniqueKey();
                      final map = {
                        AppConstants.ride_date_time: selectedDateTime,
                        RideType: RideType.RIDE_NOW,
                      };
                      Navigator.pop(context, map);
                    });
                  },
                  child: Text(
                    vm.translation.txt_reset_now,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              ],
            ),
            const SizedBox(height: Dimensions.padding_5),
            Container(
              padding: const EdgeInsets.all(10.0),
              decoration: BoxDecoration(
                border: Border.all(
                    color: CustomColors.primaryColor, width: 1.0),
                borderRadius: BorderRadius.circular(10.0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    vm.translation.txt_schedule_ride,
                    style:
                    Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    vm.translation.txt_schedule_ride_time_greater_text,
                    maxLines: 2,
                    style:
                    Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.info_outline,
                        size: 14,
                        color: CustomColors.primaryColor,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          "You can schedule a ride up to $maxScheduleDays days in advance.",
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                            fontSize: 12,
                            color: CustomColors.primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: Dimensions.padding_5),
            SizedBox(
              height: 200,
              child: CupertinoDatePicker(
                key: datePickerKey,
                mode: CupertinoDatePickerMode.dateAndTime,
                initialDateTime: selectedDateTime,
                minimumDate: minimumDateTime,
                maximumDate: maximumDateTime,
                minuteInterval: 1,
                use24hFormat: false,
                onDateTimeChanged: (DateTime val) {
                  setState(() {
                    selectedDateTime = DateTime(
                      val.year,
                      val.month,
                      val.day,
                      val.hour,
                      val.minute,
                      0,
                    );
                  });
                  String formattedDateTime = DateFormat('dd/MM/yyyy hh:mm a')
                      .format(selectedDateTime);
                  vm.rideDateController.text = formattedDateTime;
                },
              ),
            ),
            SubmitButton(
              buttonText: vm.translation.txt_Submit,
              onclick: () {
                if (selectedDateTime.isAfter(maximumDateTime)) {
                  selectedDateTime = maximumDateTime;
                }
                if (selectedDateTime.isBefore(minimumDateTime)) {
                  selectedDateTime = minimumDateTime;
                }
                final map = {
                  AppConstants.ride_date_time: selectedDateTime,
                  RideType: RideType.RIDE_LATER,
                };
                Navigator.pop(context, map);
              },
            ),
          ],
        ),
      ),
    );
  }
}