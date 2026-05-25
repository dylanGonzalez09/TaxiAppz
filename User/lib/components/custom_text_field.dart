import 'package:flutter/material.dart';
import 'package:flutter/services.dart';


import '../utils/custom_colors.dart';

import '../utils/dimensions.dart';


class CustomTextField extends StatelessWidget {
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
  final String imageUrl;
  final Function(String)? onChanged;
  final TextEditingController controller;
  final Function()? onTap;
  final bool hideBorder;

  const CustomTextField({
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
    required this.imageUrl,
    required this.label,
    this.onChanged,
    required this.controller,
    this.onTap,
    this.hideBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        isLable && typing?const Text('Enter Drop location',style: TextStyle(fontSize: 12,color: Colors.grey),):const SizedBox(),
        SizedBox(
          height: 34,
          child: TextFormField(
            cursorHeight: 20,
            // Consider setting autofocus to false if not needed
            autofocus: false,
            maxLength: maxLength,

            //focusNode: focusNode,
            readOnly: readOnly,
            keyboardType: inputType,
            inputFormatters: inputFormatters ?? [FilteringTextInputFormatter.digitsOnly],
            maxLines: maxLines,
            style: style ?? Theme.of(context).textTheme.bodySmall?.copyWith(
              color: CustomColors.clr_000000,
              fontSize: 15,
              overflow: TextOverflow.ellipsis,
            ),
            decoration: InputDecoration(
              isDense: false,
              contentPadding: contentPadding ?? const EdgeInsets.only(top: 0,bottom: 0),
              counterText: '',
              border: hideBorder ? InputBorder.none : null,
              focusedBorder:  UnderlineInputBorder(
                borderSide: BorderSide(color:  hideBorder ? Colors.transparent:  CustomColors.clr_AAAAAA),
              ),
              enabledBorder:  UnderlineInputBorder(
                borderSide: BorderSide(color:  hideBorder ? Colors.transparent:  CustomColors.clr_AAAAAA),
              ),
              hintText: label,
              suffixIcon: clear?
              typing? IconButton(
                onPressed: controller.clear,
                icon: const Icon(Icons.clear,size: 12,),
              ): null: null,
              hintStyle: const TextStyle(fontSize: Dimensions.padding_16, color: CustomColors.textPlaceholderClr),
              labelStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: CustomColors.clr_AAAAAA,
                fontSize: 15,
              ),
            ),
            cursorColor: CustomColors.clr_AAAAAA,
            onChanged: onChanged,
            onTap: onTap,
            controller: controller,
            onFieldSubmitted: (value) {
              // You might want to avoid clearing the controller here
              // Uncomment if you want to clear the field on submit
              // controller.clear();
            },
          ),
        ),
      ],
    );
  }
}
