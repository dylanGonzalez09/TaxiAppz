import 'package:flutter/material.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';

import '../utils/custom_colors.dart';

class SosView extends StatelessWidget {
  final TranslationModel translation;
  const SosView({super.key, required this.translation});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 8),
      decoration: BoxDecoration(boxShadow: const [
        BoxShadow(
            spreadRadius: 0.2, blurRadius: 2, color: CustomColors.clr_AAAAAA)
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
            translation.txt_sos,
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
