import 'package:flutter/material.dart';

class CustomOtpField extends StatefulWidget {
  final int length; // Number of OTP digits
  final ValueChanged<String> onOtpChanged; // Callback when OTP changes
  final double fieldSize; // Size of each OTP field
  final TextStyle? textStyle; // Custom text style
  final Color borderColor; // Border color
  final Color filledColor; // Color when field is filled
  final double borderWidth;
  final double gapValue;

  const CustomOtpField({
    super.key,
    this.length = 4,
    required this.onOtpChanged,
    this.fieldSize = 45,
    this.textStyle,
    this.borderColor = Colors.grey,
    this.filledColor = Colors.green,
    this.borderWidth = 2.0,
    this.gapValue = 4,
  });

  @override
  State<CustomOtpField> createState() => _OtpInputFieldState();
}

class _OtpInputFieldState extends State<CustomOtpField> {
  late List<FocusNode> _focusNodes;
  late List<TextEditingController> _controllers;
  late List<Color> _fieldColors;
  bool _isOnTap = false;

  @override
  void initState() {
    super.initState();
    _focusNodes = List.generate(widget.length, (index) => FocusNode());
    _controllers = List.generate(widget.length, (index) => TextEditingController());
    _fieldColors = List.generate(widget.length, (index) => widget.borderColor);
  }

  @override
  void dispose() {
    for (var node in _focusNodes) {
      node.dispose();
    }
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onFieldChanged(int index, String value) {
    if (index == widget.length - 1) {
      _isOnTap = false;
    }

    if (value.isEmpty) {
      if (index > 0 && !_isOnTap) {
        _focusNodes[index - 1].requestFocus();
      }
    } else {
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      }
    }

    setState(() {
      _fieldColors[index] =
      value.isEmpty ? widget.borderColor : widget.filledColor;
      final otp = _controllers.map((controller) => controller.text).join();
      widget.onOtpChanged(otp);
    });
  }

  void _onFieldTapped(int index) {
    setState(() {
      _isOnTap = true;
      _focusNodes[index].requestFocus();
    });
  }

  Widget _buildOtpField(int index) {
    return Row(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          // margin:  EdgeInsets.symmetric(horizontal: widget.gapValue),
          width: widget.fieldSize,
          height: widget.fieldSize,
          decoration: BoxDecoration(
            border: Border.all(
                color: _fieldColors[index], width: widget.borderWidth),
            borderRadius: BorderRadius.circular(5),
          ),
          child: Center(
            child: GestureDetector(
              child: TextField(
                controller: _controllers[index],
                focusNode: _focusNodes[index],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 1,
                style: widget.textStyle ?? Theme
                    .of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(
                    fontSize: 24, color: Colors.black, fontWeight: FontWeight.w600),
                cursorColor: Colors.grey,
                cursorWidth: 2,
                cursorHeight: 24,
                cursorRadius: const Radius.circular(2.0),
                textInputAction: index < widget.length - 1
                    ? TextInputAction.next
                    : TextInputAction.done,
                decoration: const InputDecoration(
                  counterText: '',
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                  filled: false,
                ),
                onChanged: (value) => _onFieldChanged(index, value),
                onTap: () => _onFieldTapped(index),
              ),
            ),
          ),
        ),
        SizedBox(width: widget.gapValue),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: List.generate(widget.length, (index) {
        return _buildOtpField(index);
      }),
    );
  }
}


