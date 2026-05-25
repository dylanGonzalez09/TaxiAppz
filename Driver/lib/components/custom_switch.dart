import 'package:flutter/material.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';

import '../utils/custom_colors.dart';

class CustomSwitch extends StatelessWidget {
  final bool isOnline;
  final Function(bool status) onClicked;
  final TranslationModel translationModel;

  const CustomSwitch(
      {super.key,
      required this.isOnline,
      required this.onClicked,
      required this.translationModel});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 110,
      height: 40,
      padding: const EdgeInsets.only(left: 4, right: 4),
      decoration: BoxDecoration(
          color: isOnline ? CustomColors.clr_35CF08 : CustomColors.clr_FF0000,
          borderRadius: BorderRadius.circular(20)),
      child: InkWell(
          splashFactory: NoSplash.splashFactory,
          onTap: () {
            onClicked(isOnline);
          },
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 150),
            transitionBuilder: (child, animation) {
              return ScaleTransition(
                scale: animation,
                child: child,
              );
            },
            child: isOnline
                ? Row(
                    key: const ValueKey("online"),
                    children: [
                      Expanded(
                          child: Center(
                              child: Text(
                        translationModel.txtOnline,
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(color: Colors.white, fontSize: 14),
                      ))),
                      SizedBox(
                        width: 32,
                        height: 32,
                        child: CustomPaint(
                          foregroundPainter: CircleWithHolePainter(
                              CustomColors.buttonTxtColor),
                          painter:
                              CircleWithHolePainter(CustomColors.primaryColor),
                        ),
                      )
                    ],
                  )
                : Row(
                    key: const ValueKey("offline"),
                    children: [
                      SizedBox(
                        width: 32,
                        height: 32,
                        child: CustomPaint(
                          foregroundPainter: CircleWithHolePainter(
                              CustomColors.buttonTxtColor),
                          painter:
                              CircleWithHolePainter(CustomColors.clr_FF0000),
                        ),
                      ),
                      Expanded(
                          child: Center(
                              child: Text(
                        translationModel.txtOffline,
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(color: Colors.white, fontSize: 14),
                      ))),
                    ],
                  ),
          )),
    );
  }
}

class CircleWithHolePainter extends CustomPainter {
  final hollowColor;

  CircleWithHolePainter(this.hollowColor);

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = Colors.black // Color of the circle
      ..style = PaintingStyle.fill;

    final double radius = size.width / 2;
    final double holeRadius = radius / 2; // Radius of the hole

    // Draw the outer circle
    canvas.drawCircle(Offset(size.width / 2, size.height / 2), radius, paint);

    // Use a different Paint to draw the hole
    paint.color = hollowColor; // Hole color
    canvas.drawCircle(
        Offset(size.width / 2, size.height / 2), holeRadius, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
