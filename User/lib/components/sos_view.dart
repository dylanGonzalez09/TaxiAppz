import 'package:flutter/material.dart';

import '../ui/about/aboutUs_screen.dart';
import '../utils/custom_colors.dart';

class SosView extends StatelessWidget {
  const SosView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 8),
      decoration: BoxDecoration(boxShadow: [
        BoxShadow(
            spreadRadius: 0.4,
            blurRadius: 2,
            color: CustomColors.clr_414141.withValues(alpha: 0.8))
      ], borderRadius: BorderRadius.circular(27), color: Colors.white),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.vibration_rounded,
            color: CustomColors.clr_FF0000,
          ),
          const SizedBox(width: 10),
          Text(
            vm.translation.txt_sos,
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: CustomColors.clr_FF0000),
          ),
        ],
      ),
    );
  }
}
