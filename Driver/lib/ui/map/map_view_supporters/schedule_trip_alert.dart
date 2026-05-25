import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/ui/map/map_vm.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/theme_data.dart';

class ScheduleTripAlert extends StatelessWidget {
  final MapVm vm;
  const  ScheduleTripAlert({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return
      //vm.isOnline?const SizedBox():
    Positioned(
      top: 90, // Adjust these values to position as needed
      left: 0,
      right: 0,
      child:
      vm.isAlert == true ?
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: AnimatedOpacity(
          opacity: vm.isOnline?1.0:0.0,
          duration: const Duration(milliseconds: 300),
          child: Visibility(
            visible: vm.isOnline,
            maintainAnimation: true,
            maintainSize: false,
            maintainState: true,
            child: Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.white,
                boxShadow: const [
                  BoxShadow(
                      spreadRadius: 0.8,
                      blurRadius: 3,
                      color: CustomColors.clr_AAAAAA)
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(15),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    IntrinsicHeight(
                      child: Row(
                        mainAxisAlignment:
                        MainAxisAlignment.start,
                        crossAxisAlignment:
                        CrossAxisAlignment.start,
                        children: [
                          SvgPicture.asset(CustomImages.alertIcon),
                          const SizedBox(width: 6),
                          Text(
                              vm.translation.txt_Scheduled_Trip,
                              style: themeData.textTheme.labelSmall?.copyWith(fontSize: 16,fontWeight: FontWeight.w600)
                          ),
                          const Spacer(),
                          Text(
                              "${vm.translation.txt_created} 5${vm.translation.txt_minute} ${vm.translation.txt_ago}",
                              style: themeData.textTheme.labelSmall?.copyWith(fontSize: 12,fontWeight: FontWeight.w600)
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                        "${vm.translation.txt_trip_id} : Taxi_000066",
                        style: themeData.textTheme.labelSmall?.copyWith(fontSize: 14,fontWeight: FontWeight.w400)
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        InkWell(
                          onTap: () async {
                            GoRouter.of(context).pop(true);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 7,horizontal: 50),
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(27),
                                border:
                                Border.all(color: CustomColors.clr_303030)),
                            child: Center(
                              child: Text(
                                vm.translation.txt_Reject,
                                style:  themeData.textTheme.labelSmall?.copyWith(fontSize: 12,fontWeight: FontWeight.w500)
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 18,),
                        Expanded(
                          child: InkWell(
                            onTap: () {
                              GoRouter.of(context).pop();
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 27, vertical: 8),
                              decoration: BoxDecoration(
                                color: CustomColors.primaryColor,
                                borderRadius: BorderRadius.circular(27),
                              ),
                              child: Center(
                                child: Text(
                                  vm.translation.txt_View_Details,
                                  style:  themeData.textTheme.labelSmall?.copyWith(fontSize: 12,fontWeight: FontWeight.w500)
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
          ),
        ),
      ): const SizedBox(),
    );
  }
}
