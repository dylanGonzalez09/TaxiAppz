import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';

class CustomTextField extends StatefulWidget {
  final TextEditingController controller;
  final Function(String)? onChanged;
  final Function()? onTap;
  final String hint;
  final bool readOnly;
  final TextInputType keyboardType;
  final Widget? suffixIcon;
  final Widget?
      prefixIcon; // prefix rendered outside TextFormField to avoid async pop-in
  final String errorTxt;
  final TextStyle? textStyle;
  final bool showHint;
  final bool autoFocus;
  final int? maxCount;
  final bool caps;
  final List<TextInputFormatter>? inputFormatters;

  const CustomTextField({
    super.key,
    required this.controller,
    this.onChanged,
    this.onTap,
    required this.hint,
    this.readOnly = false,
    this.keyboardType = TextInputType.text,
    this.suffixIcon,
    this.prefixIcon,
    this.errorTxt = "",
    this.textStyle,
    this.showHint = true,
    this.autoFocus = false,
    this.maxCount,
    this.caps = false,
    this.inputFormatters,
  });

  @override
  State<CustomTextField> createState() => _CommonTextFieldState();
}

class _CommonTextFieldState extends State<CustomTextField> {
  bool showHint = false;

  @override
  void initState() {
    if (widget.controller.text.isNotEmpty) {
      showHint = true;
    }
    widget.controller.addListener(() {
      if (widget.controller.text.isNotEmpty) {
        if (mounted) setState(() => showHint = true);
      } else {
        if (mounted) setState(() => showHint = false);
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final underlineColor = widget.errorTxt.isNotEmpty
        ? CustomColors.clr_FF0000
        : CustomColors.clr_AAAAAA;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showHint && widget.showHint)
          Text(
            widget.hint,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.clr_AAAAAA,
                  fontSize: 12,
                ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (widget.prefixIcon != null)
              Container(
                width: 20,
                height: 40,
                margin: const EdgeInsets.only(right: 8),
                alignment: Alignment.center,
                child: widget.prefixIcon,
              ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    inputFormatters: widget.inputFormatters,
                    maxLength: widget.maxCount,
                    readOnly: widget.readOnly,
                    keyboardType: widget.keyboardType,
                    autofocus: widget.autoFocus,
                    textCapitalization: widget.caps
                        ? TextCapitalization.words // ALL CAPS
                        : TextCapitalization.none,
                    style: widget.textStyle ??
                        Theme.of(context).textTheme.bodySmall,
                    decoration: InputDecoration(
                      // remove the native underline borders
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      counterText: '',
                      hintStyle:
                          Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: CustomColors.clr_AAAAAA,
                                fontSize: 15,
                              ),

                      hintText: widget.hint,
                      // keep suffixIcon behaviour inside the field
                      suffixIcon: widget.suffixIcon != null
                          ? Padding(
                              padding: const EdgeInsets.only(left: 8.0),
                              child: widget.suffixIcon,
                            )
                          : null,
                      // reduce default paddings so the external prefix aligns nicely
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    cursorColor: CustomColors.clr_AAAAAA,
                    onChanged: widget.onChanged,
                    onTap: widget.onTap,
                    controller: widget.controller,
                  ),

                  // Underline — mimic previous UnderlineInputBorder appearance
                  Container(
                    height: 1,
                    color: underlineColor,
                  ),

                  // Error text (below underline)
                  if (widget.errorTxt.isNotEmpty) ...[
                    const SizedBox(height: Dimensions.padding_5),
                    Text(
                      widget.errorTxt,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 14,
                            color: CustomColors.clr_FF0000,
                          ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
        // If there was no prefix but there was an error, ensure spacing remains correct
        if (widget.prefixIcon == null && widget.errorTxt.isNotEmpty)
          const SizedBox(height: Dimensions.padding_5),
      ],
    );
  }
}
