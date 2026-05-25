import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import '../utils/custom_colors.dart';
import '../utils/custom_images.dart';

class NormalCustomBar extends StatelessWidget {
  final String title;

  const NormalCustomBar({
    super.key,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      width: double.infinity,
      child: Stack(
        fit: StackFit.loose,
        alignment: Alignment.center,
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: IconButton(
              icon: SvgPicture.asset(
                CustomImages.leftArrow,
                colorFilter: const ColorFilter.mode(
                    CustomColors.shadeBlack, BlendMode.srcIn),
              ),
              onPressed: () {
                GoRouter.of(context).pop();
              },
            ),
          ),
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: CustomColors.shadeBlack,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
