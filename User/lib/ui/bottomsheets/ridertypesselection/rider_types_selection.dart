import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_contact_picker/model/contact.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:user/ui/bottomsheets/ridertypesselection/rider_types_selection_vm.dart';
import 'package:flutter_native_contact_picker/flutter_native_contact_picker.dart';

import '../../../components/custom_alert_dialog.dart';
import '../../../components/custom_text_field.dart';
import '../../../components/rider_selection_button.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';


class RiderTypesSelection extends StatefulWidget {
  final Function(String, String)? onDataEntered;
  final String initialName;
  final String initialPhoneNumber;
  final bool initialSelection; // Add this parameter

  const RiderTypesSelection({
    super.key,
    this.onDataEntered,
    this.initialName = '',
    this.initialPhoneNumber = '',
    this.initialSelection = true, // Default to "Myself"
  });

  @override
  State<StatefulWidget> createState() => RiderTypesSelectionState();
}

class RiderTypesSelectionState extends State<RiderTypesSelection> {
  final vm = RiderTypesSelectionVm();
  final FlutterNativeContactPicker _contactPicker = FlutterNativeContactPicker();

  @override
  void initState() {
    super.initState();

    if (widget.initialName.isNotEmpty) {
      vm.userName.text = widget.initialName;
    }
    if (widget.initialPhoneNumber.isNotEmpty) {
      vm.phoneNumber.text = widget.initialPhoneNumber;
    }

    vm.setInitialSelection(widget.initialSelection); // Set initial selection

    vm.userName.addListener(_updateUserNameFocus);
    vm.phoneNumber.addListener(_updatePhoneNumberFocus);
  }

  @override
  void dispose() {
    vm.userName.removeListener(_updateUserNameFocus);
    vm.phoneNumber.removeListener(_updatePhoneNumberFocus);
    super.dispose();
  }

  void _updateUserNameFocus() {
    Future.microtask(() {
      setState(() {
        vm.isUserNameFocus = vm.userName.text.length > 1;
      });
    });
  }

  void _updatePhoneNumberFocus() {
    Future.microtask(() {
      setState(() {
        vm.isPhoneNumberFocus = vm.phoneNumber.text.length > 1;
      });
    });
  }

  Future<void> _pickContact() async {
    try {
      final Contact? contact = await _contactPicker.selectContact();
      if (contact != null) {
        setState(() {
          vm.userName.text = contact.fullName ?? '';
          vm.phoneNumber.text = contact.phoneNumbers?.isNotEmpty == true
              ? contact.phoneNumbers!.first
              : '';
        });
      }
    } catch (e) {
      CustomAlertDialog.showErrorMessage(
          context, () {}, "Failed to pick contact: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
          vertical: Dimensions.padding_25, horizontal: Dimensions.padding_20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            onTap: () {
              setState(() {
                vm.toggleMyself();
              });
            },
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Row(
                  children: [
                    SvgPicture.asset(vm.isMyself
                        ? CustomImages.iconCheckedBox
                        : CustomImages.iconUnCheckedBox),
                    const SizedBox(
                      width: Dimensions.padding_10,
                    ),
                    Text(
                      vm.translation.txt_myself,
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(fontSize: Dimensions.padding_15),
                    ),
                    const SizedBox(
                      width: Dimensions.padding_30,
                    ),
                    Row(
                      children: [
                        SvgPicture.asset(!vm.isMyself
                            ? CustomImages.iconCheckedBox
                            : CustomImages.iconUnCheckedBox),
                        const SizedBox(
                          width: Dimensions.padding_10,
                        ),
                        Text(
                          vm.translation.txt_others,
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(fontSize: Dimensions.padding_15),
                        )
                      ],
                    )
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(
            height: Dimensions.padding_20,
          ),
          if (vm.shouldShowFields) ...[
            Visibility(
                visible: vm.isUserNameFocus,
                child: Text(
                  vm.translation.txt_name,
                  style: Theme.of(context).textTheme.labelSmall!.copyWith(
                      color: CustomColors.textPlaceholderClr,
                      fontSize: Dimensions.padding_12),
                  textAlign: TextAlign.start,
                )),
            Container(
              decoration: const BoxDecoration(color: Colors.transparent),
              child: CustomTextField(
                label:  vm.translation.txt_name,
                controller: vm.userName,
                maxLines: 1,
                maxLength: 150,
                clear: false,
                hideBorder: true,
                imageUrl: CustomImages.locationDot,
                contentPadding: const EdgeInsets.only(
                    left: 0, right: 0, top: 5, bottom: 10),
                inputType: TextInputType.name,
                style: Theme.of(context)
                    .textTheme
                    .labelSmall
                    ?.copyWith(fontSize: Dimensions.padding_15),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(
                      RegExp(r'[a-zA-Z\s]'))
                ],
              ),
            ),
            const Divider(
              thickness: 1,
              color: CustomColors.textPlaceholderClr,
            ),
            const SizedBox(height: Dimensions.padding_20),
            Visibility(
                visible: vm.isPhoneNumberFocus,
                child: Text( vm.translation.txt_phone_number,
                    style: Theme.of(context).textTheme.labelSmall!.copyWith(
                        color: CustomColors.textPlaceholderClr,
                        fontSize: Dimensions.padding_12))),
            const SizedBox(height: 0),
            Container(
              decoration: const BoxDecoration(color: Colors.transparent),
              child: Row(
                children: [
                  // SizedBox(
                  //   width: 50,
                  //   child: CustomTextField(
                  //     label:  "+",
                  //     controller: vm.countryCode,
                  //     maxLines: 1,
                  //     maxLength: 150,
                  //     clear: false,
                  //     hideBorder: true,
                  //     imageUrl: CustomImages.locationDot,
                  //     contentPadding: const EdgeInsets.only(
                  //         left: 0, right: 0, top: 5, bottom: 10),
                  //     inputType: TextInputType.number,
                  //     style: Theme.of(context)
                  //         .textTheme
                  //         .labelSmall
                  //         ?.copyWith(fontSize: Dimensions.padding_15),
                  //   ),
                  // ),
                  Expanded(
                    child: CustomTextField(
                      label:  vm.translation.txt_phone_number,
                      controller: vm.phoneNumber,
                      maxLines: 1,
                      maxLength: 150,
                      clear: false,
                      hideBorder: true,
                      imageUrl: CustomImages.locationDot,
                      contentPadding: const EdgeInsets.only(
                          left: 0, right: 0, top: 5, bottom: 10),
                      inputType: TextInputType.number,
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(fontSize: Dimensions.padding_15),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(".*")),
                        // Allow all characters
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.co_present_rounded),
                    onPressed: _pickContact,
                  ),
                ],
              ),
            ),
            const Divider(
              thickness: 1,
              color: CustomColors.textPlaceholderClr,
            ),
            const SizedBox(height: Dimensions.padding_30),
          ],
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Expanded(
                child: RiderSelectionProceedButton(
                  isOutlinedBorderButton: true,
                  showArrowIcon: false,
                  btnTxt:  vm.translation.txt_cancel,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
              ),
              Expanded(
                child: RiderSelectionProceedButton(
                    showArrowIcon: false,
                    btnTxt:  vm.translation.txt_save,
                    onPressed: () {
                      if (!vm.isMyself && vm.userName.text.isEmpty) {
                        CustomAlertDialog.showErrorMessage(
                            context, () {},  vm.translation.txt_user_name_is_empty);
                      } else if (!vm.isMyself &&
                          vm.phoneNumber.text.isEmpty) {
                        CustomAlertDialog.showErrorMessage(
                            context, () {},  vm.translation.txt_phone_number_is_empty);
                      } else {
                        if (widget.onDataEntered != null) {
                          widget.onDataEntered!(
                              vm.isMyself ?  vm.translation.txt_myself : vm.userName.text,
                              vm.phoneNumber.text);
                        }
                        Navigator.of(context).pop();
                      }
                    }),
              ),
            ],
          )
        ],
      ),
    );
  }
}

