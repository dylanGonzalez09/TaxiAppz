import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/demo_key_text_field.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/components/proceed_button.dart';
import 'package:taxiappzpro/ui/demokey/demo_key_vm.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import '../../di/di_config.dart';

class DemoKey extends StatefulWidget {
  final Map<String, dynamic> args;

  const DemoKey({super.key, required this.args});

  @override
  State createState() => DemoKeyState();
}

class DemoKeyState extends State<DemoKey> {
  final vm = getIt<DemoKeyVm>();

  @override
  void initState() {
    vm.setData(widget.args);
    WidgetsBinding.instance.addPostFrameCallback((_) {});
    super.initState();
  }

  @override
  Widget build(BuildContext context) => SafeArea(
        child: Scaffold(
          body: ChangeNotifierProvider.value(
            value: vm,
            child: Consumer<DemoKeyVm>(
              builder: (b, vm, child) => Padding(
                padding: const EdgeInsets.only(
                  left: Dimensions.padding_20,
                  right: Dimensions.padding_20,
                  bottom: Dimensions.padding_20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: Dimensions.padding_20,
                  children: [
                    HeaderView(title: vm.translation.txtDemoKey),
                    Column(
                      spacing: Dimensions.padding_5,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          vm.translation.txtEnterTheDemoKeyDescription,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        Text(
                          "${vm.country?.dialCode ?? ""} ${vm.phoneNumber}",
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                    DemoKeyTextField(
                      onChanged: vm.onOtpChange,
                      controller: vm.controller,
                      errorText: vm.demoKeyError,
                      label: vm.translation.txtEnterDemoKey,
                    ),
                    const Spacer(),
                    Center(
                      child: Obx(
                        () => ProceedButton(
                          isAvailable: vm.isAvailable,
                          btnTxt: vm.translation.txtNext,
                          onPressed: () => vm.verifyDemoKey(),
                          isLoading: vm.isLoading.value,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
