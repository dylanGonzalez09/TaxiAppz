import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:user/ui/support/support_vm.dart';

import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final vm = SupportVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () {
      vm.getReqInProgress();
      vm.setHeadOfficeNumber();
    });

  }

  void _showCallDialog(String? adminPhoneNumber, String? headOfficeNumber) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          title: Text(
            vm.translation.txt_Choose_a_number_to_call,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: CustomColors.clr_303030,
                fontSize: 20,
                fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (adminPhoneNumber != null && adminPhoneNumber.isNotEmpty)
                ListTile(
                  leading: const Icon(Icons.phone_android,
                      color: CustomColors.clr_303030),
                  title: Text(
                    vm.translation.txt_Admin_Phone_Number,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  subtitle: Text(
                    adminPhoneNumber,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.black54,
                      fontSize: 12,
                    ),
                  ),
                  onTap: () {
                    Navigator.of(context).pop();
                    vm.makePhoneCall(adminPhoneNumber);
                  },
                ),
              if (headOfficeNumber != null && headOfficeNumber.isNotEmpty)
                ListTile(
                  leading: const Icon(Icons.phone,
                      color: CustomColors.clr_303030),
                  title: Text(
                    vm.translation.txt_Head_Office_Number,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  subtitle: Text(
                    headOfficeNumber,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.black54,
                      fontSize: 12,
                    ),
                  ),
                  onTap: () {
                    Navigator.of(context).pop();
                    vm.makePhoneCall(headOfficeNumber);
                  },
                ),

            ],
          ),
          actions: [
            TextButton(
              child: Text(
                vm.translation.txt_cancel,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.black,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      body: Padding(
        padding: const EdgeInsets.only(
          left: Dimensions.padding_20,
          right: Dimensions.padding_20,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HeaderView(
              title: vm.translation.txt_support.toUpperCase(),
            ),
            const SizedBox(height: Dimensions.padding_10),
            InkWell(
              onTap: () async {
                final map = {
                  "request": vm.requestInProModel
                };
                GoRouter.of(context).pushNamed(CustomRouter.complaintScreen,extra: map);
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SvgPicture.asset(
                    CustomImages.complaint,
                    fit: BoxFit.cover,
                    height: 17,
                    width: 20,
                  ),
                  const SizedBox(width: Dimensions.padding_10),
                  Expanded(
                    child: Text(
                      vm.translation.txt_Complaint,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                          ),
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: CustomColors.clr_AAAAAA,
                    size: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(height: Dimensions.padding_20),
            InkWell(
              onTap: () async {
                GoRouter.of(context).pushNamed(CustomRouter.sosScreen);
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SvgPicture.asset(
                    CustomImages.sosCar,
                    fit: BoxFit.cover,
                    height: 20,
                    width: 17,
                  ),
                  const SizedBox(width: Dimensions.padding_10),
                  Expanded(
                    child: Text(
                      vm.translation.txt_sos,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                          ),
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: CustomColors.clr_AAAAAA,
                    size: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(height: Dimensions.padding_20),
            InkWell(
              onTap: () async {
                final map = {
                  "request":vm.requestInProModel
                };
                GoRouter.of(context).pushNamed(CustomRouter.faqScreen,extra: map);
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SvgPicture.asset(
                    CustomImages.faqIcon,
                    fit: BoxFit.cover,
                    height: 20,
                    width: 17,
                  ),
                  const SizedBox(width: Dimensions.padding_10),
                  Expanded(
                    child: Text(
                      vm.translation.txtfaq,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.black,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: CustomColors.clr_AAAAAA,
                    size: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(height: Dimensions.padding_20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vm.translation.txt_admin,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                          ),
                    ),
                    Text(
                      vm.translation.txt_Need_any_support,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                          ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () {
                    final adminPhoneNumber = vm.getAdminPhoneNumber();
                    final headOfficeNumber = vm.getHeadOfficeNumber();
                    _showCallDialog(adminPhoneNumber, headOfficeNumber);
                  },
                  child: SizedBox(
                    child: SvgPicture.asset(
                      CustomImages.call,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      scaffoldKey: scaffoldKey,
    );
  }
}
