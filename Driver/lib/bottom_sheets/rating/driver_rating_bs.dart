import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import '../../../components/proceed_button.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../../network/response_models/trips_model.dart';
import 'driver_rating_vm.dart';

class DriverRatingBs extends StatefulWidget {
  final TripModel? tripModel;

  const DriverRatingBs({super.key, this.tripModel});

  @override
  _DriverRatingBs createState() => _DriverRatingBs();
}

class _DriverRatingBs extends State<DriverRatingBs> {
  int maxStars = 5;
  final vm = DriverRatingVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  final Color activeColor = CustomColors.primaryColor;
  final Color defaultColor = CustomColors.clr_E2E2E2;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getDriverFeedbackList().then((_) {
        setState(() {
          maxStars = vm.driverFeedbackList?.length ?? 5;
          vm.feedbackStatusList =
              List<bool>.filled(vm.driverFeedbackList?.length ?? 0, true);
          vm.selectedRating =
              vm.feedbackStatusList.where((status) => status == true).length;
        });
      });
    });
    vm.tripModel = widget.tripModel;
  }

  void updateRating() {
    setState(() {
      vm.selectedRating =
          vm.feedbackStatusList.where((status) => status == true).length;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Padding(
        padding: const EdgeInsets.only(top: 20, left: 30, right: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                    child: Image.network(
                      "${AppConstants.imageBaseUrl}${vm.tripModel?.user?.profilePic}",
                      height: 60,
                      width: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          padding: const EdgeInsets.all(Dimensions.padding_5),
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            borderRadius:
                                BorderRadius.circular(Dimensions.padding_10),
                            border:
                                Border.all(color: CustomColors.primaryColor),
                          ),
                          child: SvgPicture.asset(
                            CustomImages.myProfile,
                            fit: BoxFit.contain,
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    vm.tripModel?.bookingFor?.toUpperCase() == "OTHERS"
                        ? vm.tripModel?.othersName ?? ""
                        : vm.tripModel?.user?.firstName ?? "",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 18,
                          color: CustomColors.clr_000000,
                          overflow: TextOverflow.ellipsis,
                        ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    vm.translation.txtHowIsYourTrip,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 16,
                          color: CustomColors.clr_000000,
                          overflow: TextOverflow.ellipsis,
                        ),
                  ),
                  const SizedBox(height: 10),
                  // Star Rating Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      maxStars,
                      (index) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3.0),
                        child: SvgPicture.asset(
                          vm.selectedRating > index
                              ? CustomImages.star
                              : CustomImages.starDefault,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            // Dynamic Feedback List
            Flexible(
              child: vm.driverFeedbackList?.isNotEmpty == true
                  ? ListView.builder(
                      itemCount: vm.driverFeedbackList?.length ?? 0,
                      itemBuilder: (context, index) {
                        final feedback = vm.driverFeedbackList![index];
                        return Column(
                          children: [
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10.0),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      feedback.question ?? vm.translation.txt_no_comment,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            fontSize: 16,
                                            color: CustomColors.clr_000000,
                                            overflow: TextOverflow.clip,
                                          ),
                                    ),
                                  ),
                                  const SizedBox(
                                    width: Dimensions.padding_5,
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        vm.feedbackStatusList[index] = true;
                                        updateRating();
                                      });
                                    },
                                    child: SvgPicture.asset(
                                      CustomImages.ok,
                                      colorFilter: ColorFilter.mode(
                                          vm.feedbackStatusList[index] == true
                                              ? activeColor
                                              : defaultColor,
                                          BlendMode.srcIn),
                                    ),
                                  ),
                                  const SizedBox(width: 20),
                                  GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        vm.feedbackStatusList[index] = false;
                                        updateRating();
                                      });
                                    },
                                    child: SvgPicture.asset(
                                      CustomImages.notOk,
                                      colorFilter: ColorFilter.mode(
                                          vm.feedbackStatusList[index] == false
                                              ? activeColor
                                              : defaultColor,
                                          BlendMode.srcIn),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    )
                  : const Center(
                      child: CircularProgressIndicator(
                        color: CustomColors.primaryColor,
                        strokeWidth: 2,
                      ),
                    ),
            ),
            const SizedBox(height: Dimensions.padding_20),
            Center(
              child: ProceedButton(
                btnTxt: vm.translation.txt_Submit,
                onPressed: () {
                  vm.submitDriverFeedback();
                  Navigator.of(context).pop();
                },
                showArrowIcon: false,
              ),
            ),
            const SizedBox(height: Dimensions.padding_20),
          ],
        ),
      ),
    );
  }
}
