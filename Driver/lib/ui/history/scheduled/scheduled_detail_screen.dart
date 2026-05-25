import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/ui/history/scheduled/scheduled_detail_vm.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../main.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/theme_data.dart';

class ScheduledDetailScreen extends StatefulWidget {
  const ScheduledDetailScreen({
    super.key,
  });

  @override
  State<ScheduledDetailScreen> createState() => _ScheduledDetailScreen();
}

class _ScheduledDetailScreen extends State<ScheduledDetailScreen> {
  final vm = ScheduledDetailVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        body: Padding(
          padding: const EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderView(title: vm.translation.txtScheduled),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: CustomColors.clr_AAAAAA,
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${vm.translation.txtBookingId} : RT_012345',
                              style: themeData.textTheme.labelLarge?.copyWith(
                                  fontSize: 14, fontWeight: FontWeight.w400)),
                          Text(vm.translation.txtScheduled,
                              style: themeData.textTheme.labelLarge?.copyWith(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                  color: CustomColors.clr_268800)),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('TN 39 KL 3214',
                              style: themeData.textTheme.labelLarge?.copyWith(
                                  fontSize: 14, fontWeight: FontWeight.w400)),
                          Image.network(
                            'https://cdn-icons-png.flaticon.com/512/9983/9983204.png',
                            fit: BoxFit.cover,
                            width: 30,
                            height: 30,
                            loadingBuilder: (BuildContext context, Widget child,
                                ImageChunkEvent? loadingProgress) {
                              if (loadingProgress == null) {
                                return child;
                              } else {
                                return Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes !=
                                            null
                                        ? loadingProgress
                                                .cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                  ),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Sep 06, 2024 10:11 PM',
                              style: themeData.textTheme.labelLarge?.copyWith(
                                  fontSize: 12, fontWeight: FontWeight.w400)),
                          Text(
                            'SUV',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.black,
                                      fontSize: 12,
                                    ),
                          ),
                        ],
                      ),
                      const SizedBox(height: Dimensions.padding_10),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: CustomColors.clr_AAAAAA,
                            width: 1,
                          ),
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(10),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  SizedBox(
                                    width: 15,
                                    height: 15,
                                    child: Image.asset(
                                      CustomImages.pickUpIndicator,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  const SizedBox(width: Dimensions.padding_10),
                                  Expanded(
                                    child: Text(
                                        '17/2, Coimbatore, Tamil Nadu, India',
                                        style: themeData.textTheme.labelLarge
                                            ?.copyWith(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w400)),
                                  ),
                                ],
                              ),
                              const Divider(
                                height: 20,
                                color: CustomColors.clr_AAAAAA,
                                thickness: 0.5,
                              ),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  SizedBox(
                                    width: 15,
                                    height: 15,
                                    child: Image.asset(
                                      CustomImages.dropIndicator,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  const SizedBox(width: Dimensions.padding_10),
                                  Expanded(
                                    child: Text(
                                        '17/2, Coimbatore, Tamil Nadu, India',
                                        style: themeData.textTheme.labelLarge
                                            ?.copyWith(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w400)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: Dimensions.padding_10),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: CustomColors.clr_AAAAAA,
                            width: 1,
                          ),
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(10),
                          child: Column(
                            children: [
                              Text(
                                  vm.translation.txt_customer_details_share,
                                  style: themeData.textTheme.labelLarge
                                      ?.copyWith(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500)),
                              const SizedBox(
                                height: 10,
                              ),
                              Row(
                                children: [
                                  InkWell(
                                    onTap: () {},
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 15, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: vm.isAssigned
                                            ? CustomColors.clr_278D00
                                            : CustomColors.clr_FF9800,
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                      child: Center(
                                        child: Text(
                                            vm.isAssigned
                                                ? vm.translation.txt_assigned
                                                : vm.translation
                                                    .txt_not_assigned,
                                            style: themeData
                                                .textTheme.labelMedium
                                                ?.copyWith(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w600,
                                                    color: vm.isAssigned
                                                        ? Colors.white
                                                        : CustomColors
                                                            .clr_FFD290)),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(
                                    width: 30,
                                  ),
                                  Expanded(
                                    child: Text(
                                        vm.translation.txt_Call_to_Customer,
                                        style: themeData.textTheme.labelLarge
                                            ?.copyWith(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                                color:
                                                    CustomColors.clr_AAAAAA)),
                                  ),
                                  const SizedBox(
                                    width: 10,
                                  ),
                                  SvgPicture.asset(CustomImages.callGrayIcon)
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: Dimensions.padding_10,
                      ),
                      Text(
                          vm.isAssigned ? vm.translation.txtCancelRide : vm.translation.txt_Scheduled_Trip,
                          style: themeData.textTheme.labelLarge?.copyWith(fontSize: 16,fontWeight: FontWeight.w400)
                      ),
                      Text(
                          vm.isAssigned ?  vm.translation.txt_Are_you_want_to_cancel_this_ride :'${vm.translation.txt_A_trip_has_been_assigned_to_you}',
                          style: themeData.textTheme.labelLarge?.copyWith(fontSize: 14,fontWeight: FontWeight.w400)
                      ),
                      SizedBox(height: Dimensions.padding_15),
                      vm.isAssigned ?
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          InkWell(
                            onTap: () async {},
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 55, vertical: 8),
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(25),
                                  border:
                                  Border.all(color: CustomColors.clr_303030)),
                              child: Center(
                                child: Text(
                                    vm.translation.txtYes,
                                    style: themeData.textTheme.labelLarge?.copyWith(fontSize: 15,fontWeight: FontWeight.w700)
                                ),
                              ),
                            ),
                          ),
                        ],
                      ) :
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: () async {},
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 22, vertical: 10),
                                decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(25),
                                    border:
                                    Border.all(color: CustomColors.clr_303030)),
                                child: Center(
                                  child: Text(
                                      vm.translation.txt_Reject,
                                      style: themeData.textTheme.labelLarge?.copyWith(fontSize: 15,fontWeight: FontWeight.w700)
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: Dimensions.padding_20),
                          Expanded(
                            child: InkWell(
                              onTap: () {
                                setState(() {
                                  vm.changeButtonView();
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 22, vertical: 11),
                                decoration: BoxDecoration(
                                  color: CustomColors.primaryColor,
                                  borderRadius: BorderRadius.circular(25),
                                ),
                                child: Center(
                                  child: Text(
                                      vm.translation.txt_Accept,
                                      style: themeData.textTheme.labelLarge?.copyWith(fontSize: 15,fontWeight: FontWeight.w700)
                                  ),
                                ),
                              ),
                            ),
                          ),

                        ],
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        scaffoldKey: scaffoldKey,
      ),
    );
  }
}
