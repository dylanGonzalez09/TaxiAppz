import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:user/utils/custom_router.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';

class MapTitleView extends StatelessWidget {
  final Widget? widget;
  final GlobalKey<ScaffoldState> scaffoldKey;
  final void Function(String name, {dynamic args})? onNotificationClick;
  const MapTitleView({super.key, required this.scaffoldKey, this.onNotificationClick,  this.widget});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      width: double.infinity,
      decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(12),
              bottomRight: Radius.circular(12)),
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 4,
              spreadRadius: 0,
              offset: const Offset(0, 2),
            ),
          ]
      ),
      child: Padding(
        padding: const EdgeInsets.only(left: 5, right: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () {
                scaffoldKey.currentState!.openDrawer();
              },
              child: const SizedBox(
                height: 50,
                width: 50,
                child: Icon(
                  Icons.menu_rounded,
                  size: 28,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(right: 25),
              child: SvgPicture.asset(
                CustomImages.logo,
                width: 85,
                height: 30,
              ),
            ),
            InkWell(
              onTap: (){
                if(onNotificationClick!= null) {
                  onNotificationClick!(CustomRouter.notificationScreen);
                }
              }
              ,
              child: SvgPicture.asset(
                CustomImages.menuNotification,
                width: 20,
                height: 20,
                colorFilter: const ColorFilter.mode(
                    CustomColors.clr_000000, BlendMode.srcIn),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
