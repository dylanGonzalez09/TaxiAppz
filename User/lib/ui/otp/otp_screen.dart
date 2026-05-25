import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import '../../components/custom_otp_field.dart';
import '../../components/otp_field_widget.dart';
import '../../components/proceed_button.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import 'otp_vm.dart';

class OtpScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const OtpScreen({super.key, required this.args});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final vm = OtpVm();

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
        child: Consumer<OtpVm>(
          builder: (context, vm, child) {
            return SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(Dimensions.padding_20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: vm.heightConverter(70, context)),
                    Align(
                      alignment: Alignment.center,
                      child: SvgPicture.asset(
                        CustomImages.logo,
                        height: 60,
                        width: 60,
                        // height: vm.heightConverter(70, context),
                        // width: vm.widthConverter(178, context),
                      ),
                    ),
                    SizedBox(
                      height: vm.heightConverter(
                        vm.heightConverter(40, context),
                        context,
                      ),
                    ),
                    Text(
                      "${vm.translation.txt_Check_your_sms_message} ${vm.country?.dialCode} ${vm.phoneNumber}",
                      maxLines: 2,
                      style: Theme.of(
                        context,
                      ).textTheme.labelSmall?.copyWith(fontSize: 16),
                    ),
                    const SizedBox(height: Dimensions.padding_20),
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
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 14,
                          color: CustomColors.clr_FF0000,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    vm.otpError.isNotEmpty
                        ? const SizedBox(height: 10)
                        : const SizedBox(height: 20),
                    Obx(
                      () => RichText(
                        text: TextSpan(
                          text: vm.otpTimeDesc.value,
                          style: Theme.of(
                            context,
                          ).textTheme.bodySmall?.copyWith(fontSize: 12),
                          children: [
                            TextSpan(
                              text: vm.otpTimer.value,
                              recognizer:
                                  TapGestureRecognizer()
                                    ..onTap = () {
                                      if (vm.requestResend) {
                                        vm.startTimer();
                                        vm.resendOtp();
                                      }
                                    },
                              style: Theme.of(
                                context,
                              ).textTheme.bodyLarge?.copyWith(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      vm
                          .translation
                          .txtOtpWillBeReceivedPleaseWaitForFewSeconds,
                      style: Theme.of(
                        context,
                      ).textTheme.bodySmall?.copyWith(fontSize: 12),
                    ),
                    const SizedBox(height: 20),
                    Align(
                      alignment: Alignment.center,
                      child: Obx(
                        () => ProceedButton(
                          btnTxt: vm.translation.txtNext,
                          isLoading: vm.isLoading.value,
                          isAvailable: vm.isAvailable,
                          onPressed: () {
                            if (vm.isAvailable) {
                              vm.verifyOTP();
                            }
                          },
                          minimumSize: Size(
                            MediaQuery.sizeOf(context).width * 0.75,
                            54,
                          ),
                          maxSize: Size(
                            MediaQuery.sizeOf(context).width * 0.75,
                            54,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
