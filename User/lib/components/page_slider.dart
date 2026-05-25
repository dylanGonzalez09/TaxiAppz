import 'package:flutter/material.dart';

import '../../../../utils/custom_colors.dart';

class PageSlider extends StatelessWidget {
  final int currentPage;
  final int length;
  final int mainCount;
  final bool? isChangeColor;

  const PageSlider({
    super.key,
    required this.currentPage,
    required this.length,
    this.mainCount = 4,
    this.isChangeColor = false,
  });

  @override
  Widget build(BuildContext context) {
    if (length <= 1) return const SizedBox.shrink();

    final safeCurrent = currentPage.clamp(0, length - 1);

    // IMPORTANT: Prevent negative clamp value
    final maxStart = (length - mainCount) < 0 ? 0 : (length - mainCount);

    int start = (safeCurrent - 1).clamp(0, maxStart);
    int end = (start + mainCount).clamp(0, length);

    List<Widget> dots = [];

    // Left small dots
    if (start > 0) {
      final count = start > 2 ? 2 : start;
      for (int i = count - 1; i >= 0; i--) {
        dots.add(_smallDot(5 - (i * 2)));
      }
    }

    // Main dots
    for (int i = start; i < end; i++) {
      final isActive = i == safeCurrent;

      dots.add(
        AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: isActive
                ? isChangeColor == true ? CustomColors.primaryColor : CustomColors.primaryColor
                : CustomColors.clr_AAAAAA,
            shape: BoxShape.circle,
          ),
        ),
      );
    }

    // Right small dots
    if (end < length) {
      final remaining = length - end;
      final count = remaining > 2 ? 2 : remaining;

      for (int i = 0; i < count; i++) {
        dots.add(_smallDot(5 - (i * 2))); // 5 then 3
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: dots,
      ),
    );
  }


  Widget _smallDot(double size) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 3),
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: CustomColors.clr_AAAAAA.withValues(alpha: 0.5),
        shape: BoxShape.circle,
      ),
    );
  }
}
