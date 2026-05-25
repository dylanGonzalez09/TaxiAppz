import 'package:flutter/material.dart';

class MountainLakePainter extends CustomPainter {
  MaterialColor color;
  bool mountainType = false;

  MountainLakePainter({required this.color, this.mountainType = false});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = LinearGradient(
        colors: [
          color.shade200,
          color.shade400,
          color.shade300,
          color.shade200,
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;

    final path = Path();

    // Start from bottom-left
    path.moveTo(0, size.height);

    // First mountain wave
    path.quadraticBezierTo(
      size.width * 0.16,
      mountainType ? (size.height * 0.55) * 2 : size.height * 0.55,
      size.width * 0.33,
      mountainType ? (size.height * 0.75) * 2 : size.height * 0.75,
    );

    // Second mountain wave
    path.quadraticBezierTo(
      size.width * 0.5,
      mountainType ? (size.height * 1.0) * 2 : size.height * 1.0,
      size.width * 0.66,
      mountainType ? (size.height * 0.7) * 2 : size.height * 0.7,
    );

    // Third mountain wave
    path.quadraticBezierTo(
      size.width * 0.84,
      mountainType ? (size.height * 0.5) * 1.5 : size.height * 0.5,
      size.width,
      mountainType ? (size.height * 0.7) * 1.5 : size.height * 0.7,
    );

    // Down to bottom-right
    path.lineTo(size.width, size.height);

    // Close the path
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
