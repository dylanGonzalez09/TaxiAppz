import 'package:flutter/material.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class CustomTabBar extends StatefulWidget {
  final String titleOne;
  final String titleTwo;
  final String titleThree;
  final Function(int) onTapped;

  const CustomTabBar(
      {super.key,
      required this.titleOne,
      required this.titleTwo,
      required this.titleThree,
      required this.onTapped});

  @override
  State<CustomTabBar> createState() => _CustomTabBarTabBarState();
}

class _CustomTabBarTabBarState extends State<CustomTabBar> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: InkWell(
          onTap: () {
            setState(() {
              selectedIndex = 0;
            });
            widget.onTapped(0);
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color:selectedIndex == 0
                  ? CustomColors.primaryColor
                  : Colors.white,strokeAlign: 3),
              borderRadius: selectedIndex == 0
                  ? BorderRadius.circular(Dimensions.padding_15)
                  : null,
            ),
            padding: const EdgeInsets.symmetric(
                vertical: Dimensions.padding_5,
                horizontal: Dimensions.padding_3),
            child: Center(
                child: Text(
              widget.titleOne,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            )),
          ),
        )),
        const SizedBox(width: Dimensions.padding_5),
        Expanded(
            child: InkWell(
          onTap: () {
            setState(() {
              selectedIndex = 1;
            });
            widget.onTapped(1);
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color:selectedIndex == 1
                  ? CustomColors.primaryColor
                  : Colors.white,strokeAlign: 3),
              borderRadius: selectedIndex == 1
                  ? BorderRadius.circular(Dimensions.padding_15)
                  : null,
            ),
            padding: const EdgeInsets.symmetric(
                vertical: Dimensions.padding_5,
                horizontal: Dimensions.padding_3),
            child: Center(
                child: Text(
              widget.titleTwo,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            )),
          ),
        )),
        const SizedBox(width: Dimensions.padding_5),
        Expanded(
            child: InkWell(
          onTap: () {
            setState(() {
              selectedIndex = 2;
            });
            widget.onTapped(2);
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color:selectedIndex == 2
                  ? CustomColors.primaryColor
                  : Colors.white,strokeAlign: 3),
              borderRadius: selectedIndex == 2
                  ? BorderRadius.circular(Dimensions.padding_15)
                  : null,
            ),
            padding: const EdgeInsets.symmetric(
                vertical: Dimensions.padding_5,
                horizontal: Dimensions.padding_3),
            child: Center(
                child: Text(
              widget.titleThree,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            )),
          ),
        ))
      ],
    );
  }
}
