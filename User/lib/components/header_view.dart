import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';


import '../main.dart';
import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';

class HeaderView extends StatelessWidget {
  final String title;
  final Function()? onBackPressed;

  const HeaderView({super.key, required this.title, this.onBackPressed});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:  const EdgeInsets.symmetric(vertical:Dimensions.padding_20 ),
      child: Center(
        child: Row(
          children: [
            InkWell(
              onTap: onBackPressed ??
                      () {
                    if (navigatorKey.currentState != null) {
                      GoRouter.of(navigatorKey.currentState!.context).pop();
                    }
                  },
              child: const Icon(
                Icons.arrow_back_ios_rounded,
                size: 20,
              ),
            ),
            SizedBox(width: 10,),
            Expanded(
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
          ],
        ),
      ),
    );
  }
}
