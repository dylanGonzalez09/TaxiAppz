import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/proceed_button.dart';
import 'package:taxiappzpro/components/trip_otp/otp_field_widget.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/otp/otp_vm.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import '../../utils/custom_colors.dart';
import '../../utils/theme_data.dart';

class OtpScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const OtpScreen({super.key, required this.args});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final vm = getIt<OtpVm>();

  @override
  void initState() {
    vm.setData(widget.args);
    super.initState();
    vm.startTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ChangeNotifierProvider<OtpVm>(
        create: (context) => vm,
        child: Consumer<OtpVm>(builder: (_, vm, child) {
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: MediaQuery.sizeOf(context).height * 0.12),
                  Align(
                    alignment: Alignment.center,
                    child: SvgPicture.asset(CustomImages.logoLoginOtpSvg,height: 80,width: 120,),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    "${vm.translation.txt_Check_your_sms_message} ${vm.country?.dialCode ?? ""} ${vm.phoneNumber}",
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 20),
                  // OtpPinField(
                  //   onSubmit: (value) {
                  //     vm.otp = value;
                  //   },
                  //   isError: vm.otpError.isNotEmpty,
                  //   onChange: (value) {
                  //     vm.otp = value;
                  //   },
                  //   mainAxisAlignment: MainAxisAlignment.start,
                  // ),
                  OtpPinField(
                    mainAxisAlignment: MainAxisAlignment.start,
                    onSubmit: (value) {},
                    onChange: (value) {
                      print('sdvjdubhufdhbu $value');
                      vm.onOtpChange(value);
                    }),
                  if (vm.otpError.isNotEmpty)
                    const SizedBox(height: Dimensions.padding_5),
                  if (vm.otpError.isNotEmpty)
                    Text(
                      vm.otpError,
                      style: themeData.textTheme.bodySmall?.copyWith(
                          fontSize: 14,
                          color: CustomColors.clr_FF0000,
                          fontWeight: FontWeight.w600),
                    ),
                  const SizedBox(height: 20),
                  Obx(() => RichText(
                          text: TextSpan(
                              text: vm.otpTimeDesc.value,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: 14),
                              children: [
                            TextSpan(
                                text: vm.otpTimer.value,
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    if (vm.requestResend) {
                                      vm.resendOtp();
                                    }
                                  },
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 16))
                          ]))),
                  const SizedBox(height: 10),
                  Text(vm.translation.txt_OTP_desc,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(fontSize: 14)),
                  const SizedBox(height: 20),
                  Align(
                      alignment: Alignment.center,
                      child: Obx(() => ProceedButton(
                            btnTxt: vm.translation.txtNext,
                            isLoading: vm.isLoading.value,
                            isAvailable: vm.isAvailable,
                            onPressed: () {
                              if (vm.isAvailable) {
                                vm.verifyOTP();
                              }
                            },
                            minimumSize: Size(
                                MediaQuery.sizeOf(context).width * 0.75, 54),
                            maxSize: Size(
                                MediaQuery.sizeOf(context).width * 0.75, 54),
                          )))
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
