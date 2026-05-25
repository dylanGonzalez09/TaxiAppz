import 'package:flutter/material.dart';

class CustomSliderThumbShape extends SliderComponentShape {
  final double thumbRadius;

  CustomSliderThumbShape({required this.thumbRadius});

  @override
  Size getPreferredSize(bool isEnabled, bool isDiscrete) {
    return Size.fromRadius(thumbRadius);
  }

  @override
  void paint(
    PaintingContext context,
    Offset center, {
    required Animation<double> activationAnimation,
    required Animation<double> enableAnimation,
    required bool isDiscrete,
    required TextPainter labelPainter,
    required RenderBox parentBox,
    required SliderThemeData sliderTheme,
    required TextDirection textDirection,
    required double value,
    required double textScaleFactor,
    required Size sizeWithOverflow,
  }) {
    final Canvas canvas = context.canvas;

    // Draw a blurred shadow below the thumb
    final Paint shadowPaint =
        Paint()
          ..color = Colors.black.withValues(
            alpha: 0.3,
          ) // Shadow color and opacity
          ..maskFilter = MaskFilter.blur(
            BlurStyle.normal,
            thumbRadius / 2,
          ) // Apply blur
          ..style = PaintingStyle.fill;

    final double shadowOffsetY = thumbRadius * 0.4;
    final Offset shadowCenter = center + Offset(0, shadowOffsetY);

    canvas.drawCircle(shadowCenter, thumbRadius * 0.8, shadowPaint);

    // Draw the main thumb circle
    final Paint thumbPaint =
        Paint()
          ..color = sliderTheme.thumbColor ?? Colors.yellow
          ..style = PaintingStyle.fill;

    canvas.drawCircle(center, thumbRadius, thumbPaint);

    // Optional: Add an inner decoration circle
    final Paint innerCirclePaint =
        Paint()
          ..color = Colors.white
          ..style = PaintingStyle.fill;

    canvas.drawCircle(center, thumbRadius / 1.6, innerCirclePaint);
  }
}
