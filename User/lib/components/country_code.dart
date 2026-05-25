import 'package:flutter/material.dart';

import '../utils/custom_colors.dart';

class CountryCodeTextField extends StatelessWidget {
  final TextEditingController controller;
  final Function() onTap;
  final String hint;
  const CountryCodeTextField(
      {super.key,
      required this.onTap,
      required this.controller,
      required this.hint});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 50,
      child: TextField(
        maxLength: 4,
        onTap: onTap,
        controller: controller,
        keyboardType: TextInputType.phone,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.black,
              fontSize: 20,
            ),
        decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(vertical: 4.5),
            counterText: '',
            focusedBorder: const UnderlineInputBorder(
              borderSide: BorderSide(color: CustomColors.clr_AAAAAA),
            ),
            enabledBorder: const UnderlineInputBorder(
              borderSide: BorderSide(color: CustomColors.clr_AAAAAA),
            ),
            labelStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.clr_AAAAAA,
                  fontSize: 15,
                )),
        cursorColor: CustomColors.clr_AAAAAA,
        readOnly: true,
      ),
    );
  }
}
