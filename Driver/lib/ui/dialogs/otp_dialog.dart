import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/components/trip_otp/otp_field_widget.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';

import '../../components/custom_otp_field.dart';

class OtpDialog extends StatefulWidget {
  final TranslationModel translation;
  const OtpDialog({super.key, required this.translation});

  @override
  State<OtpDialog> createState() => _OtpDialogState();
}

class _OtpDialogState extends State<OtpDialog> {
  var otp = "";

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: SizedBox(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.translation.txt_TaxiAppz_Driver,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontSize: 20),
              ),
              const SizedBox(height: 15),
              Text(
                widget.translation.txt_Enter_OTP_for_ride,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 25),
              OtpPinField(
                  onSubmit: (value) {},
                  onChange: (value) {
                    otp = value;
                  }),
              // CustomOtpField(
              //   length: 4, // Customize number of digits
              //   onOtpChanged: (otp) {
              //     print('Current OTP: $otp');
              //     this.otp = otp;
              //   },
              //   textStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
              //       fontSize: 24,
              //       color: Colors.black,
              //       fontWeight: FontWeight.w500),
              //   fieldSize: 40, // Custom size
              //   filledColor: CustomColors.clr_E2E2E2, // Custom filled color
              //   borderColor: CustomColors.clr_E2E2E2,
              //   borderWidth: 1.5,
              //   gapValue: 10,
              // ),
              const SizedBox(height: 45),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        GoRouter.of(context).pop();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 22, vertical: 8),
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(25),
                            border:
                                Border.all(color: CustomColors.clr_303030)),
                        child: Center(
                          child: Text(
                            widget.translation.txt_cancel,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        GoRouter.of(context).pop(otp);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: CustomColors.primaryColor,
                          borderRadius: BorderRadius.circular(25),
                        ),
                        child: Center(
                          child: Text(
                            widget.translation.txt_Start_Trip,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      )
    );
  }
}
