import 'package:flutter/material.dart';

import '../../utils/dimensions.dart';
import '../../utils/theme_data.dart';


class DescriptionDialog extends StatelessWidget {
  final String title;
  final String title1;

  const DescriptionDialog({
    super.key,
    required this.title,
    required this.title1,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.all(17),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20), color: Colors.white),
        padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: themeData.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: Dimensions.padding_10,
            ),
            Text(
              title1,
              style: themeData.textTheme.bodySmall,
              textAlign: TextAlign.center,
              overflow: TextOverflow.clip,
            ),
          ],
        ),
      ),
    );
  }
}
