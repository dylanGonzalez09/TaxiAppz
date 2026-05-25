import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../utils/custom_colors.dart';

class AdminContactDialog extends StatelessWidget {
  final String headOfficeNumber;
  final String adminNumber;

  const AdminContactDialog(
      {super.key, required this.headOfficeNumber, required this.adminNumber});



  Future<void> makePhoneCall(String phoneNumber) async {
    final Uri uri = Uri.parse("tel:$phoneNumber");
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      debugPrint("Could not launch $phoneNumber");
    }
  }



  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(Dimensions.padding_20),
      child: Padding(
        padding: const EdgeInsets.all(Dimensions.padding_20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Text(headOfficeNumber,
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(color: Colors.black)),
                const Spacer(),
                InkWell(
                  onTap: () async {
                    Navigator.of(context).pop();
                    await makePhoneCall(headOfficeNumber);
                  },
                  child: SvgPicture.asset(CustomImages.call),
                ),
              ],
            ),
            const Divider(
              thickness: 1,
              color: CustomColors.clr_E7E7E7,
              height: Dimensions.padding_20,
            ),
            Row(
              children: [
                Text(adminNumber,
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(color: Colors.black)),
                const Spacer(),
                InkWell(
                  onTap: () async {
                    Navigator.of(context).pop();
                    await makePhoneCall(adminNumber);
                  },
                  child: SvgPicture.asset(CustomImages.call),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
