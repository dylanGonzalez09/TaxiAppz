import 'dart:async';
import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';

import 'trip_otp/cursor_painter.dart';
import 'trip_otp/otp_field_widget.dart';
import 'trip_otp/otp_keyboard_field.dart';

class OtpPinFieldState extends State<OtpPinField> with TickerProviderStateMixin {
  late FocusNode _focusNode;
  late List<String> pinsInputed;
  late AnimationController _cursorController;
  late Animation<double> _cursorAnimation;
  final TextEditingController controller = TextEditingController();
  bool ending = false;
  bool hasFocus = false;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode();
    pinsInputed = [];

    for (var i = 0; i < widget.maxLength; i++) {
      pinsInputed.add('');
    }

    _focusNode.addListener(_focusListener);
    _cursorController = AnimationController(
        duration: const Duration(milliseconds: 1000), vsync: this);
    _cursorAnimation = Tween<double>(
      begin: 1,
      end: 0,
    ).animate(CurvedAnimation(
      parent: _cursorController,
      curve: Curves.easeIn,
    ));
    _cursorController.repeat();
  }

  @override
  void dispose() {
    _focusNode.removeListener(_focusListener);
    _focusNode.dispose();
    controller.dispose();
    _cursorController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.showCustomKeyboard ?? false
        ? _viewWithCustomKeyBoard()
        : _viewWithOutCustomKeyBoard();
  }

  Widget _viewWithCustomKeyBoard() {
    return SizedBox(
      height: MediaQuery.of(context).size.height - 115,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          widget.upperChild ?? Container(height: 150),
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onLongPress: pasteCode,
            onTap: onFieldFocus,
            child: SizedBox(
              height: widget.fieldHeight,
              child: Stack(children: [
                Row(
                    mainAxisAlignment:
                        widget.mainAxisAlignment ?? MainAxisAlignment.center,
                    children: _buildBody(context)),
                AbsorbPointer(
                  child: Opacity(
                    opacity: 0.0,
                    child: TextField(
                      controller: controller,
                      maxLength: widget.maxLength,
                      autofillHints: const [AutofillHints.oneTimeCode],
                      readOnly: widget.showCustomKeyboard ?? true,
                      autofocus: !kIsWeb ? widget.autoFocus : false,
                      enableInteractiveSelection: false,
                      inputFormatters:
                          widget.keyboardType == TextInputType.number
                              ? <TextInputFormatter>[
                                  FilteringTextInputFormatter.digitsOnly
                                ]
                              : null,
                      focusNode: _focusNode,
                      keyboardType: widget.keyboardType,
                      onSubmitted: (text) {
                        debugPrint(text);
                      },
                      onChanged: (text) {
                        if (ending && text.length == widget.maxLength) {
                          return;
                        }
                        _bindTextIntoWidget(text);
                        setState(() {});
                        widget.onChange(text);
                        ending = text.length == widget.maxLength;
                        if (ending) {
                          widget.onSubmit(text);
                          FocusScope.of(context).unfocus();
                        }
                      },
                    ),
                  ),
                )
              ]),
            ),
          ),
          Expanded(child: widget.middleChild ?? const SizedBox.shrink()),
          Align(
              alignment: Alignment.bottomCenter,
              child: widget.customKeyboard ??
                  OtpKeyboard(
                    callbackValue: (myText) {
                      if (ending &&
                          controller.text.trim().length == widget.maxLength) {
                        return;
                      }
                      controller.text = controller.text + myText;
                      _bindTextIntoWidget(controller.text.trim());
                      setState(() {});
                      widget.onChange(controller.text.trim());
                      ending =
                          controller.text.trim().length == widget.maxLength;
                      if (ending) {
                        FocusScope.of(context).unfocus();
                      }
                    },
                    callbackDeleteValue: () {
                      if (controller.text.isEmpty) {
                        return;
                      }
                      _focusNode.requestFocus();
                      controller.text = controller.text
                          .substring(0, controller.text.length - 1);
                      _bindTextIntoWidget(controller.text.trim());
                      setState(() {});
                      widget.onChange(controller.text.trim());
                    },
                    callbackSubmitValue: () {
                      if (controller.text.length != widget.maxLength) {
                        return;
                      }
                      widget.onSubmit(controller.text);
                    },
                  ))
        ],
      ),
    );
  }

  Widget _viewWithOutCustomKeyBoard() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onLongPress: pasteCode,
      onTap: onFieldFocus,
      child: SizedBox(
        height: widget.fieldHeight,
        child: Stack(children: [
          Row(
              mainAxisAlignment:
                  widget.mainAxisAlignment ?? MainAxisAlignment.center,
              children: _buildBody(context)),
          AbsorbPointer(
            absorbing: true,
            child: Opacity(
              opacity: 0.0,
              child: TextField(
                controller: controller,
                maxLength: widget.maxLength,
                autofillHints: const [AutofillHints.oneTimeCode],
                readOnly: !(widget.showDefaultKeyboard ?? true),
                autofocus: !kIsWeb ? widget.autoFocus : false,
                enableInteractiveSelection: false,
                inputFormatters: widget.keyboardType == TextInputType.number
                    ? <TextInputFormatter>[
                        FilteringTextInputFormatter.digitsOnly
                      ]
                    : null,
                focusNode: _focusNode,
                textInputAction: widget.textInputAction,
                keyboardType: widget.keyboardType,
                onSubmitted: (text) {
                  debugPrint(text);
                },
                onChanged: (text) {
                  if (ending && text.length == widget.maxLength) {
                    return;
                  }
                  _bindTextIntoWidget(text);
                  setState(() {});
                  widget.onChange(text);
                  ending = text.length == widget.maxLength;
                  if (ending) {
                    widget.onSubmit(text);
                    FocusScope.of(context).unfocus();
                  }
                },
              ),
            ),
          )
        ]),
      ),
    );
  }

  void onFieldFocus() {
    if (kIsWeb) {
      _focusNode.requestFocus();
      return;
    }
    if (View.of(context).viewInsets.bottom <= 0.0 &&
        controller.text.trim().length != widget.maxLength) {
      FocusScope.of(context).unfocus();
      _focusNode = FocusNode();
      _focusNode.addListener(_focusListener);
    }
    _focusNode.requestFocus();
    setState(() {});
  }

  List<Widget> _buildBody(BuildContext context) {
    var tmp = <Widget>[];
    for (var i = 0; i < widget.maxLength; i++) {
      tmp.add(_buildFieldInput(context, i));
      if (i < widget.maxLength - 1) {
        tmp.add(const SizedBox(
          width: 10,
        ));
      }
    }
    return tmp;
  }

  Widget cursorWidget({Color? cursorColor, double? cursorWidth, int? index}) {
    return Container(
      padding: pinsInputed[index ?? 0].isNotEmpty
          ? const EdgeInsets.only(left: 15)
          : EdgeInsets.zero,
      child: FadeTransition(
        opacity: _cursorAnimation,
        child: CustomPaint(
          size: const Size(0, 25),
          painter: CursorPainter(
            cursorColor: cursorColor,
            cursorWidth: cursorWidth,
          ),
        ),
      ),
    );
  }

  Widget _buildFieldInput(BuildContext context, int i) {;

    Widget showCursorWidget() => widget.showCursor!
        ? _shouldHighlight(i)
            ? cursorWidget(
                cursorColor: widget.cursorColor,
                cursorWidth: widget.cursorWidth,
                index: i)
            : const SizedBox.shrink()
        : const SizedBox.shrink();
    return Container(
        height: widget.fieldHeight,
        width: widget.fieldWidth,
        alignment: Alignment.center,
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(5),
            border: Border.all(
                color: widget.isError
                    ? CustomColors.clr_FF0000
                    : CustomColors.clr_E2E2E2,
                width: 1.5)),
        child: Stack(
          children: [
            Center(
              child: showCursorWidget(),
            ),
            Center(
              child: Text(
                _getPinDisplay(i),
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(fontSize: 24),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ));
  }

  String _getPinDisplay(int position) {
    var display = '';
    var value = pinsInputed[position];
    display = value;
    return value.isNotEmpty ? display : value;
  }

  void _bindTextIntoWidget(String text) {
    for (var i = text.length; i < pinsInputed.length; i++) {
      pinsInputed[i] = '';
    }
    if (text.isNotEmpty) {
      for (var i = 0; i < text.length; i++) {
        pinsInputed[i] = text[i];
      }
    }
  }

  void _focusListener() {
    if (mounted == true) {
      setState(() {
        hasFocus = _focusNode.hasFocus;
      });
    }
  }

  bool _shouldHighlight(int i) {
    return hasFocus &&
        (i == controller.text.trim().length ||
            (i == controller.text.trim().length - 1 &&
                controller.text.trim().length == widget.maxLength));
  }

  clearOtp() {
    controller.text = '';
    setState(() {
      _focusNode = FocusNode();
      pinsInputed = [];
      for (var i = 0; i < widget.maxLength; i++) {
        pinsInputed.add('');
      }
      _focusNode.addListener(_focusListener);
      ending = false;
      hasFocus = widget.highlightBorder;
    });
  }

  void _pasteCopyCode(ClipboardData? data) {
    try {
      int.parse(data?.text ?? '');
    } catch (e) {
      return log(
          name: 'OTP Pin Field',
          'Copied content error ',
          error: 'The content that is copied should be a number.');
    }

    if ((data?.text ?? '').length < widget.maxLength) {
      return log(
          name: 'OTP Pin Field',
          'Copied content error',
          error: "The copied content doesn't seem to be the correct OTP.");
    }

    if (controller.text != data?.text && (data?.text ?? '').isNotEmpty) {
      if ((data?.text ?? '').length < widget.maxLength) {
        return log(
            name: 'OTP Pin Field',
            'Copied content error',
            error: "The copied content doesn't seem to be the correct OTP.");
      }

      controller.value = TextEditingValue(
          text: (data?.text ?? '').substring(0, widget.maxLength));

      if ((data?.text ?? '').substring(0, widget.maxLength).isNotEmpty ==
          true) {
        for (var i = 0; i < widget.maxLength; i++) {
          pinsInputed[i] = (data?.text ?? '')[i];
        }
      }
      controller.text = (data?.text ?? '').substring(0, widget.maxLength);
      setState(() {});

      widget.onChange(controller.text.trim());
      ending = controller.text.trim().length == widget.maxLength;
      if (ending) {
        widget.onSubmit(controller.text.trim());
        FocusScope.of(context).unfocus();
        hideKeyboard();
      }
    }
  }

  void pasteCode() async {
    var data = await Clipboard.getData(Clipboard.kTextPlain);
    if (data?.text?.isNotEmpty ?? false) {
      if (widget.beforeTextPaste != null) {
        if (widget.beforeTextPaste?.call(data!.text) ?? false) {
          _pasteCopyCode(data);
        } else {
          log(
              name: 'OTP Pin Field',
              'beforeTextPaste error ',
              error:
                  'return true in beforeTextPaste order to execute copy paste ');
        }
      } else {
        _pasteCopyCode(data);
      }
    }
  }
}
