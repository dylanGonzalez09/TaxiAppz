import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../about/aboutUs_screen.dart';

class IntroButtonSwitcher extends StatelessWidget {
  final RxInt selectedIndex;
  final int totalPages;
  final VoidCallback onSkipPressed;
  final VoidCallback onContinuePressed;

  const IntroButtonSwitcher({
    super.key,
    required this.selectedIndex,
    required this.totalPages,
    required this.onSkipPressed,
    required this.onContinuePressed,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      bool isLastPage = selectedIndex.value == totalPages - 1;

      return Align(
        alignment: Alignment.topRight,
        child: isLastPage
            ? ElevatedButton(
          onPressed: onContinuePressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            padding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          ),
          child: Text(
            vm.translation.Txt_Continue,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontSize: 16,
              color: Colors.white,
            ),
          ),
        )
            : InkWell(
          onTap: onSkipPressed,
          child: Text(
            vm.translation.txt_Skip,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontSize: 16,
            ),
          ),
        ),
      );
    });
  }
}
