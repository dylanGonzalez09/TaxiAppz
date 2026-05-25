import 'package:flutter/material.dart';

import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/theme_data.dart';
import '../about/aboutUs_screen.dart';

class PromoDialog extends StatefulWidget {
  final String title;
  final String title1;
  final String title2;
  final String title3;
  final Function()? onTap;
  const PromoDialog({
    super.key,
    required this.title,
    required this.title1,
    required this.title2,
    required this.title3,
    this.onTap,
  });

  @override
  State<PromoDialog> createState() => _PromoDialogState();
}

class _PromoDialogState extends State<PromoDialog> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pop();
      },
      child: Dialog(
        backgroundColor: Colors.transparent,
        child: GestureDetector(
          onTap: () {},
          child: Padding(
            padding: const EdgeInsets.only(left: 10, right: 10),
            child: Center(
              child: Material(
                color: Colors.transparent,
                child: Container(
                  width: double.infinity,
                  margin: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.white,
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        widget.title,
                        style: themeData.textTheme.bodySmall?.copyWith(
                          color: CustomColors.primaryColor,
                          fontSize: 16,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        widget.title1,
                        style: themeData.textTheme.bodySmall?.copyWith(
                          color: CustomColors.shadeBlack,
                          fontSize: 20,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 5),
                      Text(
                        widget.title2,
                        style: themeData.textTheme.bodySmall?.copyWith(
                          color: CustomColors.shadeBlack,
                          fontSize: 20,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        widget.title3,
                        style: themeData.textTheme.bodySmall?.copyWith(
                          color: CustomColors.shadeBlack,
                          fontSize: 15,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 15),
                      InkWell(
                        onTap: widget.onTap,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 6),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            color: CustomColors.primaryColor,
                          ),
                          child: Text(
                            "${vm.translation.Txt_Continue} !",
                            style: const TextStyle(
                              fontSize: 15,
                              color: Colors.white,
                              fontFamily: AppConstants.latoFont,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
