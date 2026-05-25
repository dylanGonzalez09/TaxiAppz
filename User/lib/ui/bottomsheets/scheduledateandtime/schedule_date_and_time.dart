import 'package:flutter/material.dart';

import '../../../components/proceed_button.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import 'custom_date_and_time_picker.dart';
import 'on_date_change_listener.dart';

class ScheduleDateAndTime extends StatefulWidget {
  const ScheduleDateAndTime({super.key});

  @override
  State<StatefulWidget> createState() => ScheduleDateAndTimeState();
}

class ScheduleDateAndTimeState extends State<ScheduleDateAndTime>
    implements OnDateChangeListener {
  @override
  Widget build(BuildContext context) => PopScope(
        child: Container(
          padding: const EdgeInsets.all(Dimensions.padding_20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Pick-up time",
                style: Theme.of(context)
                    .textTheme
                    .labelSmall
                    ?.copyWith(fontSize: Dimensions.padding_20),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  "Reset Now",
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Colors.red, fontSize: Dimensions.padding_16),
                ),
              ),
              const SizedBox(
                height: 10,
              ),
              Container(
                padding: const EdgeInsets.all(Dimensions.padding_10),
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(Dimensions.padding_10),
                    border: Border.all(color: CustomColors.clr_D7DF23)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Text(
                      "Schedule Ride",
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(fontSize: Dimensions.padding_16),
                    ),
                    const SizedBox(
                      height: Dimensions.padding_5,
                    ),
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: Text(
                            maxLines: 3,
                            "Schedule your ride greater than 30 min from the current time.",
                            style: Theme.of(context)
                                .textTheme
                                .labelSmall
                                ?.copyWith(fontSize: Dimensions.padding_14),
                          ),
                        ),
                        const Expanded(
                          flex: 1,
                          child: SizedBox(),
                        )
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                height: 200,
                padding:
                    const EdgeInsets.symmetric(vertical: Dimensions.padding_5),
                child: CustomDateAndTimePicker(
                  initDate: DateTime.now(),
                  onDateChangeListener: this,
                  is24HourFormatter: false,
                ),
              ),
              ProceedButton(
                  showArrowIcon: false,
                  btnTxt: "Confirm Booking",
                  onPressed: () {
                    Navigator.of(context).pop();
                  })
            ],
          ),
        ),
      );

  @override
  void onDateChanged(String dateAndTime) {
    debugPrint(
        "-onDateChanged-------------------------------------$dateAndTime-----------------------");
  }
}
