import 'package:flutter/material.dart';

class TitleView extends StatelessWidget {
  final Widget widget;
  final Function()? onNotificationClick;
  final GlobalKey<ScaffoldState> scaffoldKey;
  final bool showNotificationIcon;

  const TitleView(
      {super.key,
      required this.widget,
      required this.scaffoldKey,
      this.onNotificationClick,
      this.showNotificationIcon = true});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 10,
      margin: EdgeInsets.zero,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(10),
              bottomRight: Radius.circular(10))),
      child: SizedBox(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              InkWell(
                onTap: () {
                  scaffoldKey.currentState?.openDrawer();
                },
                child: const Icon(
                  Icons.menu_rounded,
                  size: 28,
                ),
              ),
              widget,
              showNotificationIcon
                  ? InkWell(
                      onTap: onNotificationClick,
                      child: const Icon(
                        Icons.notifications,
                        size: 28,
                      ),
                    )
                  : const SizedBox(
                      width: 28,
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
