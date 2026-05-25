import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';

class OtpTxtField extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode? focusNode;
  final Function(String)? onDataChange;

  const OtpTxtField(
      {super.key, required this.controller, this.focusNode, this.onDataChange});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(5),
        border: Border.all(width: 1.5, color: CustomColors.clr_E2E2E2),
      ),
      child: Center(
        child: TextField(
          controller: controller,
          maxLines: 1,
          maxLength: 1,

          focusNode: focusNode,
          onChanged: onDataChange,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[0-9]'))
          ],
          style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 25),
          cursorColor: CustomColors.clr_AAAAAA,
          decoration: const InputDecoration(
            isDense: true,
            enabledBorder: null,
            focusedBorder: null,
            contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 0),
            border: InputBorder.none,
            counterText: "",
          ),
        ),
      ),
    );
  }
}
