import 'package:flutter/material.dart';

import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';

class DocumentTxtField extends StatefulWidget {
  final TextEditingController controller;
  final Function(String)? onChanged;
  final Function()? onTap;
  final String hint;
  final bool readOnly;
  final TextInputType keyboardType;
  final Icon? suffixIcon;
  final String errorTxt;
  final TextStyle? textStyle;

  const DocumentTxtField(
      {super.key,
      required this.controller,
      this.onChanged,
      this.onTap,
      required this.hint,
      this.readOnly = false,
      this.keyboardType = TextInputType.text,
      this.suffixIcon,
      this.errorTxt = "",
      this.textStyle});

  @override
  State<DocumentTxtField> createState() => _DocumentTxtFieldState();
}

class _DocumentTxtFieldState extends State<DocumentTxtField> {
  bool showHint = false;
  @override
  void initState() {
    if(widget.controller.text.isNotEmpty){
      showHint = true;
    }
    widget.controller.addListener((){
      if(widget.controller.text.isNotEmpty){
        if(mounted){
          setState(() {
            showHint = true;
          });
        }
      }else{
        if(mounted){
          setState(() {
            showHint = false;
          });
        }
      }
    });
    super.initState();
  }
  @override
  void dispose() {
    widget.controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
    if(showHint)    Text(widget.hint,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.clr_AAAAAA,
                  fontSize: 15,
                )),
        TextFormField(
          maxLength: 30,
          readOnly: widget.readOnly,
          keyboardType: widget.keyboardType,
          style: widget.textStyle ?? Theme.of(context).textTheme.bodySmall,
          decoration: InputDecoration(
            counterText: '',
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                  color: widget.errorTxt.isNotEmpty
                      ? CustomColors.clr_FF0000
                      : CustomColors.clr_AAAAAA),
            ),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                  color: widget.errorTxt.isNotEmpty
                      ? CustomColors.clr_FF0000
                      : CustomColors.clr_AAAAAA),
            ),
            hintStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.clr_AAAAAA,
                  fontSize: 15,
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
        ),
        if (widget.errorTxt.isNotEmpty) const SizedBox(height: Dimensions.padding_5),
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
