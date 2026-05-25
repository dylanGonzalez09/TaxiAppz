import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import '../ui/dialogs/promo_dialog.dart';
import '../utils/custom_colors.dart';

import '../network/response_models/promo_model.dart';
import '../ui/about/aboutUs_screen.dart';
import '../utils/app_constants.dart';

class DottedCurveRectanglePainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gapLength;
  final double dotLength;
  final double borderRadius;
  final double curveRadius;

  DottedCurveRectanglePainter({
    this.color = Colors.black,
    this.strokeWidth = 2.0,
    this.gapLength = 4.0,
    this.dotLength = 4.0,
    this.borderRadius = 15.0,
    this.curveRadius = 15.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    double adjustedBorderRadius = borderRadius.clamp(0, size.longestSide / 2);
    double adjustedCurveRadius = curveRadius.clamp(0, size.width / 2);

    Path path = Path()
      ..moveTo(adjustedBorderRadius, 0)
      ..lineTo(size.width * 0.27, 0)
      ..arcToPoint(
        Offset(size.width * 0.37, 0),
        radius: Radius.circular(adjustedCurveRadius),
        clockwise: false,
      )
      ..lineTo(size.width - adjustedBorderRadius, 0)
      ..arcToPoint(
        Offset(
          size.width,
          adjustedBorderRadius,
        ),
        radius: Radius.circular(adjustedBorderRadius),
        clockwise: true,
      )
      ..lineTo(size.width, size.height - adjustedBorderRadius)
      ..arcToPoint(
        Offset(size.width - adjustedBorderRadius, size.height),
        radius: Radius.circular(adjustedBorderRadius),
        clockwise: true,
      )
      ..lineTo(size.width * 0.37, size.height)
      ..arcToPoint(
        Offset(size.width * 0.27, size.height),
        radius: Radius.circular(adjustedCurveRadius),
        clockwise: false,
      )
      ..lineTo(adjustedBorderRadius, size.height)
      ..arcToPoint(
        Offset(0, size.height - adjustedBorderRadius),
        radius: Radius.circular(adjustedBorderRadius),
        clockwise: true,
      )
      ..lineTo(0, adjustedBorderRadius)
      ..arcToPoint(
        Offset(adjustedBorderRadius, 0),
        radius: Radius.circular(adjustedBorderRadius),
        clockwise: true,
      )
      ..close();

    // Add the dashed effect
    double dashOffset = 0;
    for (ui.PathMetric metric in path.computeMetrics()) {
      while (dashOffset < metric.length) {
        final double nextDashEnd =
            (dashOffset + dotLength).clamp(0, metric.length);
        canvas.drawPath(
          metric.extractPath(dashOffset, nextDashEnd),
          paint,
        );
        dashOffset += dotLength + gapLength;
      }
      dashOffset -= metric.length; // Reset for the next segment
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}

class DottedCurveRectangle extends StatelessWidget {
  final double width;
  final Color color;
  final double strokeWidth;
  final double gapLength;
  final double dotLength;
  final double borderRadius;
  final double curveRadius;
  final PromoModel promo;

  const DottedCurveRectangle({
    super.key,
    this.width = 200,
    this.color = Colors.black,
    this.strokeWidth = 2.0,
    this.gapLength = 4.0,
    this.dotLength = 4.0,
    this.borderRadius = 15.0,
    this.curveRadius = 15.0,
    required this.promo,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        Future.delayed(Duration.zero, () {
          showDialog(
            context: context,
            barrierDismissible: true,
            builder: (BuildContext context) {
              return PromoDialog(
                title: promo.promoCode ?? '',
                title1: vm.translation.txt_applied,
                title2: promo.promoType == 'percentage'
                    ? '${promo.percentage}%'
                    : '\$${promo.amount}',
                title3: 'Savings from this promo',
                onTap: () {
                  print("ontapppppppppppppp");
                  var map = {AppConstants.promoCode: promo};
                  Navigator.of(context).pop(map);
                  Navigator.of(context).pop(map);
                },
              );
            },
          );
        });
      },
      child: CustomPaint(
        size: Size(width, 0),
        painter: DottedCurveRectanglePainter(
          color: color,
          strokeWidth: strokeWidth,
          gapLength: gapLength,
          dotLength: dotLength,
          borderRadius: borderRadius,
          curveRadius: curveRadius,
        ),
        child: Padding(
          padding:
              const EdgeInsets.only(left: 20, right: 0, top: 25, bottom: 25),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    promo.promoCodeType ?? 'Individual Promo',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black,
                      fontFamily: AppConstants.latoFont,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        promo.promoCode ?? '',
                        style: const TextStyle(
                          fontSize: 15,
                          color: CustomColors.primaryColor,
                          fontFamily: AppConstants.latoFont,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        promo.promoType == 'percentage'
                            ? '( ${vm.translation.txt_upto} ${promo.percentage}% )'
                            : '( ${vm.translation.txt_upto} \$${promo.amount} )',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.black,
                          fontFamily: AppConstants.latoFont,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      promo.description ?? '',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.black,
                        fontFamily: AppConstants.latoFont,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              Positioned(
                top: 32,
                right: 10,
                child: SizedBox(
                  width: 85,
                  height: 30,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: CustomColors.svgImageColorDarkBlue,
                    ),
                    child: Center(
                      child: Text(
                        vm.translation.txt_apply,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white,
                          fontFamily: AppConstants.latoFont,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
