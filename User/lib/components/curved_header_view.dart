import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../ui/ride_confirm/ride_confirm_vm.dart';

import '../ui/rental/rental_vm.dart';
import '../utils/custom_colors.dart';
import '../utils/custom_images.dart';
import '../utils/dimensions.dart';

class CurvedHeaderView extends StatelessWidget {
  final String title;
  final GlobalKey<ScaffoldState>? scaffoldKey;
  final Function()? onBackPressed;
  final RentalVm? rentalVm;
  final RideConfirmVm? rideConfirmVm;

  const CurvedHeaderView(
      {super.key,
      required this.title,
      this.scaffoldKey,
      this.onBackPressed,
      this.rentalVm,
      this.rideConfirmVm});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: Dimensions.padding_15),
      decoration: const BoxDecoration(
          borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(15),
              bottomRight: Radius.circular(15)),
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.grey,
              blurRadius: 30,
              offset: Offset(1, 1),
            ),
          ]),
      child: Padding(
        padding: const EdgeInsets.only(left: 15, right: 20),
        child: Stack(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: InkWell(
                onTap: () {
                  if (scaffoldKey != null) {
                    scaffoldKey!.currentState!.openDrawer();
                  } else {
                    if (onBackPressed != null) {
                      onBackPressed!();
                    } else {
                      if (Navigator.canPop(context)) {
                        Navigator.of(context).pop();
                      }
                    }
                  }
                },
                child: SizedBox(
                  height: 28,
                  width: 32,
                  child: Center(
                    child: SvgPicture.asset(
                      scaffoldKey == null
                          ? CustomImages.backArrowIcon
                          : CustomImages.menuIcon,
                      width: 25,
                      height: scaffoldKey == null ? 18 : 15,
                      colorFilter: const ColorFilter.mode(
                          CustomColors.clr_000000, BlendMode.srcIn),
                    ),
                  ),
                ),
              ),
            ),
            Align(
                alignment: Alignment.center,
                child: Text(title,
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(color: CustomColors.clr_303030))),
            Visibility(
              visible: rentalVm != null || rideConfirmVm != null,
              child: Align(
                alignment: Alignment.centerRight,
                child: InkWell(
                  onTap: () {
                    if (rentalVm != null) {
                      rentalVm?.showRiderTypes((name, phoneNumber) {
                        rentalVm?.updateRiderName(name);
                        rentalVm?.updatePhoneNumber(phoneNumber);
                      },
                          rentalVm?.riderName == "Myself"
                              ? ""
                              : rentalVm?.riderName ?? "",
                          rentalVm?.phoneNumber == "phoneNumber"
                              ? ""
                              : rentalVm?.phoneNumber ?? "",
                          rentalVm?.riderName == "Myself");
                    } else if (rideConfirmVm != null) {
                      rideConfirmVm?.showRiderTypes((name, phoneNumber) {
                        rideConfirmVm?.updateRiderName(name);
                        rideConfirmVm?.updatePhoneNumber(phoneNumber);
                      },
                          rideConfirmVm?.riderName == "Myself"
                              ? ""
                              : rideConfirmVm?.riderName ?? "",
                          rideConfirmVm?.riderPhoneNumber == "phoneNumber"
                              ? ""
                              : rideConfirmVm?.riderPhoneNumber ?? "",
                          rideConfirmVm?.riderName == "Myself");
                    }
                  },
                  child: Container(
                    width: 73,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      color: CustomColors.shadeBlack,
                    ),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Text(
                            rentalVm != null
                                ? rentalVm?.riderName ?? ""
                                : rideConfirmVm != null
                                    ? rideConfirmVm?.riderName ?? ""
                                    : "",
                            style: const TextStyle(
                                color: Colors.white, fontSize: 12),
                          ),
                        ),
                        (rentalVm != null
                                ? rentalVm?.riderName == "Myself"
                                : rideConfirmVm?.riderName == "Myself")
                            ? const SizedBox(width: 5)
                            : const SizedBox(
                                width: 0,
                              ),
                        SvgPicture.asset(
                          CustomImages.dropDown,
                          width: 6,
                          height: 12,
                          colorFilter: const ColorFilter.mode(
                              Colors.white, BlendMode.srcIn),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
