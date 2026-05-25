import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../utils/custom_colors.dart';

class PhoneNumberField extends StatelessWidget {
  final TextEditingController pNController;
  final Function(String)? onChanged;
  final Function()? onTap;
  final String title;
  final bool readOnly;
  final TextInputType keyboardType;
  final Icon? suffixIcon;

  const PhoneNumberField({
    super.key,
    this.onChanged,
    this.onTap,
    required this.pNController,
    required this.title,
    this.readOnly = false,
    this.keyboardType = TextInputType.number,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      maxLength: 16,
      readOnly: readOnly,
      keyboardType: keyboardType,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly
      ],
      maxLines: 1,
      style: Theme.of(context).textTheme.bodySmall?.copyWith(
        color: CustomColors.clr_000000, fontSize: 20,),
      decoration: InputDecoration(
        isDense: true,
        contentPadding: const EdgeInsets.only(bottom: 3),
        counterText: '',
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: CustomColors.clr_AAAAAA),
        ),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: CustomColors.clr_AAAAAA),
        ),
        labelText: title,
        labelStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: CustomColors.clr_AAAAAA,
          fontSize: 18,
        ),
        suffixIcon: suffixIcon != null
            ? Padding(
          padding: const EdgeInsets.all(0.0),
          child: suffixIcon,
        )
            : null,
      ),
      cursorColor: CustomColors.clr_AAAAAA,
      onChanged: onChanged,
      onTap: onTap,
      controller: pNController,
    );
  }
}
