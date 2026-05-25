import 'package:flutter/material.dart';

import '../utils/custom_colors.dart';

class CursorPainter extends CustomPainter {
  CursorPainter({this.cursorColor, this.cursorWidth});

  final Color? cursorColor;
  final double? cursorWidth;

  @override
  void paint(Canvas canvas, Size size) {
    const p1 = Offset(0, 0);
    final p2 = Offset(0, size.height);
    final paint = Paint()
      ..color = cursorColor ?? CustomColors.clr_000000
      ..strokeWidth = cursorWidth ?? 2;
    canvas.drawLine(p1, p2, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}