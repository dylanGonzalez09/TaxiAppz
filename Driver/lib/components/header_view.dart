import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

import '../main.dart';

class HeaderView extends StatelessWidget {
  final String title;
  final Function()? onBackPressed;
  final bool showBackButton;
  final bool isMenu;
  final Widget? endWidget;

  const HeaderView(
      {super.key,
      required this.title,
      this.onBackPressed,
      this.showBackButton = true,
      this.isMenu = false,
      this.endWidget});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Dimensions.padding_20),
      child: Stack(
        children: [
          showBackButton
              ? InkWell(
                  onTap: onBackPressed ??
                      () {
                        if (navigatorKey.currentState != null) {
                          GoRouter.of(navigatorKey.currentState!.context).pop();
                        }
                      },
                  child: Icon(
                    isMenu ? Icons.menu : Icons.arrow_back_ios_rounded,
                    size: isMenu ? 28 : 20,
                  ),
                )
              : const SizedBox(),
          Center(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(color: CustomColors.clr_303030, fontSize: 20),
            ),
          ),
          Visibility(
              visible: endWidget != null,
              child: Align(
                alignment: Alignment.centerRight,
                child: endWidget,
              ))
        ],
      ),
    );
  }
}