import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/dimensions.dart';
import '../utils/custom_colors.dart';

class DemoKeyTextField extends StatelessWidget {
  final bool readOnly;
  final bool typing;
  final bool isLable;
  final bool clear;

  // final FocusNode focusNode;
  final TextInputType inputType;
  final List<TextInputFormatter>? inputFormatters;
  final int maxLines;
  final int maxLength;
  final TextStyle? style;
  final EdgeInsetsGeometry? contentPadding;
  final String label;
  final String errorText;
  final Function(String)? onChanged;
  final TextEditingController controller;
  final Function()? onTap;
  final bool hideBorder;

  const DemoKeyTextField({
    super.key,
    this.readOnly = false,
    this.typing = false,
    this.isLable = false,
    this.clear = false,
    // required this.focusNode,
    this.inputType = TextInputType.text,
    this.inputFormatters,
    this.maxLines = 1,
    this.maxLength = 16,
    this.style,
    this.contentPadding,
    required this.errorText,
    required this.label,
    this.onChanged,
    required this.controller,
    this.onTap,
    this.hideBorder = false,
  });

  @override
  Widget build(BuildContext context) => Column(
        children: [
          SizedBox(
            child: TextField(
              autofocus: true,
              enabled: true,
              // to trigger disabledBorder
              decoration: InputDecoration(
                hoverColor: CustomColors.primaryColor,
                filled: true,
                fillColor: Colors.white,
                focusColor: CustomColors.primaryColor,
                focusedBorder: const OutlineInputBorder(
                  borderRadius:
                      BorderRadius.all(Radius.circular(Dimensions.padding_10)),
                  borderSide:
                      BorderSide(width: 1, color: CustomColors.primaryColor),
                ),
                disabledBorder: const OutlineInputBorder(
                  borderRadius:
                      BorderRadius.all(Radius.circular(Dimensions.padding_10)),
                  borderSide:
                      BorderSide(width: 1, color: CustomColors.primaryColor),
                ),
                enabledBorder: const OutlineInputBorder(
                  borderRadius:
                      BorderRadius.all(Radius.circular(Dimensions.padding_10)),
                  borderSide:
                      BorderSide(width: 1, color: CustomColors.primaryColor),
                ),
                border: const OutlineInputBorder(
                  borderRadius:
                      BorderRadius.all(Radius.circular(Dimensions.padding_10)),
                  borderSide:
                      BorderSide(width: 1, color: CustomColors.primaryColor),
                ),
                errorBorder: errorText.isNotEmpty == true
                    ? const OutlineInputBorder(
                        borderRadius: BorderRadius.all(
                            Radius.circular(Dimensions.padding_10)),
                        borderSide: BorderSide(
                            width: 1, color: CustomColors.clr_FF0000),
                      )
                    : null,
                focusedErrorBorder: const OutlineInputBorder(
                  borderRadius:
                      BorderRadius.all(Radius.circular(Dimensions.padding_10)),
                  borderSide:
                      BorderSide(width: 1, color: CustomColors.primaryColor),
                ),
                hintText: label,
                hintStyle: const TextStyle(
                    fontSize: Dimensions.padding_16,
                    color: CustomColors.textPlaceholderClr),
                labelStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.clr_AAAAAA,
                      fontSize: 15,
                    ),
                errorText: errorText.isNotEmpty ? errorText : null,
              ),
              controller: controller,
              onChanged: onChanged,
              obscureText: false,
            ),
          ),
        ],
      );
}
