import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class CustomImage extends StatelessWidget {
  final String imagePath;
  final double? customWidth;
  final double? customHeight;
  final double? customTopPadding;

  const CustomImage({
    super.key,
    required this.imagePath,
    this.customWidth,
    this.customHeight,
    this.customTopPadding,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {

        double width = customWidth ?? double.infinity;
        double height = customHeight ?? 361;
        double topPadding = customTopPadding ?? 102;
        double sidePadding = 1;


        if (constraints.maxWidth >= 1200) {
          width = customWidth ?? double.infinity;
          height = customHeight!*2;
          topPadding = customTopPadding ?? 150;
        } else if (constraints.maxWidth >= 600 && constraints.maxWidth < 1200) {
          width = customWidth ?? double.infinity;
          height = customHeight!+2;
          topPadding = customTopPadding ?? 120;
        } else {
          print("objectCustomImage mobile");
          // Mobile view (width < 600px)
          width = customWidth ?? double.infinity;
          height = customHeight != null?customHeight! : 300;
          topPadding = customTopPadding ?? 102;
        }

        return Padding(
          padding: EdgeInsets.only(top: topPadding, left: sidePadding, right: sidePadding),
          child: SizedBox(
            width: width,
            height: height,
            child: SvgPicture.asset(
              imagePath,
              fit: BoxFit.fill,
            ),
          ),
        );
      },
    );
  }
}
