import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import this for FilteringTextInputFormatter

import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';

class CommonTextField extends StatefulWidget {
  final TextEditingController controller;
  final Function(String)? onChanged;
  final Function()? onTap;
  final String hint;
  final bool readOnly;
  final TextInputType keyboardType;
  final Icon? suffixIcon;
  final String errorTxt;
  final TextStyle? textStyle;
  final bool showHint;
  final bool autoFocus;
  final int? maxCount;
  final bool caps;
  final List<TextInputFormatter>? inputFormatters;
  final bool showBottomLine;
  final String? Function(String?)? validator;

  const CommonTextField({
    super.key,
    required this.controller,
    this.onChanged,
    this.onTap,
    required this.hint,
    this.readOnly = false,
    this.keyboardType = TextInputType.text,
    this.suffixIcon,
    this.errorTxt = "",
    this.textStyle,
    this.showHint = true,
    this.autoFocus = false,
    this.showBottomLine = true,
    this.maxCount,
    this.inputFormatters,
    this.validator,
    this.caps = false,
  });

  @override
  State<CommonTextField> createState() => _CommonTextFieldState();
}

class _CommonTextFieldState extends State<CommonTextField> {
  bool showHint = false;

  late VoidCallback _listener;

  @override
  void initState() {
    super.initState();
    showHint = widget.controller.text.isNotEmpty;
    _listener = () {
      if (!mounted) return;
      setState(() {
        showHint = widget.controller.text.isNotEmpty;
      });
    };

    widget.controller.addListener(_listener);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_listener);
    super.dispose();
  }

  //
  // @override
  // void initState() {
  //   if (widget.controller.text.isNotEmpty) {
  //     showHint = true;
  //   }
  //   widget.controller.addListener(() {
  //     if (widget.controller.text.isNotEmpty) {
  //       if (mounted) {
  //         setState(() {
  //           showHint = true;
  //         });
  //       }
  //     } else {
  //       if (mounted) {
  //         setState(() {
  //           showHint = false;
  //         });
  //       }
  //     }
  //   });
  //   super.initState();
  // }
  //
  // @override
  // void dispose() {
  //   widget.controller.dispose();
  //   super.dispose();
  // }

  @override
  Widget build(BuildContext context) {
    final border = widget.showBottomLine
        ? UnderlineInputBorder(
            borderSide: BorderSide(
              color: widget.errorTxt.isNotEmpty
                  ? CustomColors.clr_FF0000
                  : CustomColors.clr_AAAAAA,
            ),
          )
        : InputBorder.none;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showHint && widget.showHint)
          Text(widget.hint,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: CustomColors.clr_AAAAAA,
                    fontSize: 15,
                  )),
        TextFormField(
          maxLength: widget.maxCount ?? 30,
          readOnly: widget.readOnly,
          keyboardType: widget.keyboardType,
          style: widget.textStyle ??
              Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 18),
          inputFormatters: widget.inputFormatters,
          textCapitalization: widget.caps
              ? TextCapitalization.words // ALL CAPS
              : TextCapitalization.none,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(vertical: 6),
            counterText: '',
            focusedBorder: border,
            enabledBorder: border,
            hintStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.clr_AAAAAA,
                  fontSize: 18,
                ),
            hintText: widget.hint,
            suffixIcon: widget.suffixIcon != null
                ? Padding(
                    padding: const EdgeInsets.all(0.0),
                    child: widget.suffixIcon,
                  )
                : null,
          ),
          cursorColor: CustomColors.clr_AAAAAA,
          onChanged: widget.onChanged,
          onTap: widget.onTap,
          controller: widget.controller,
          validator: widget.validator,
        ),
        if (widget.errorTxt.isNotEmpty)
          const SizedBox(height: Dimensions.padding_5),
        if (widget.errorTxt.isNotEmpty)
          Text(widget.errorTxt,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontSize: 14, color: CustomColors.clr_FF0000))
      ],
    );
  }
}
