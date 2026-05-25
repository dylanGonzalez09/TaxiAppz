import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

import '../utils/custom_images.dart';

class TextWithIcon extends StatelessWidget {
  final String text;
  final bool isRequired;

  const TextWithIcon({super.key, required this.text, required this.isRequired});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final textStyle = Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.black,
              fontSize: 18,
            );

        return RichText(
          text: TextSpan(
            style: textStyle,
            children: [
              TextSpan(text: text),
              if(isRequired)
                const WidgetSpan(child: SizedBox(width: Dimensions.padding_2,)),
              if (isRequired)
                WidgetSpan(
                    alignment: PlaceholderAlignment.top,
                    child: SvgPicture.asset(CustomImages.required)),
            ],
          ),
        );
      },
    );
  }
}
