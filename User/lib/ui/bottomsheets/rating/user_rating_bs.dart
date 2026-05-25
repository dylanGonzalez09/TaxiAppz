import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../components/proceed_button.dart';
import '../../../network/response_models/trip_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import 'user_rating_vm.dart';

class UserRatingBs extends StatefulWidget {
  final Trip? tripModel;

  const UserRatingBs({super.key, this.tripModel});

  @override
  _DriverRatingBs createState() => _DriverRatingBs();
}

class _DriverRatingBs extends State<UserRatingBs> {
  int maxStars = 5;
  final vm = UserRatingVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  final Color activeColor = CustomColors.primaryColor;
  final Color defaultColor = CustomColors.clr_E2E2E2;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getUserFeedbackList().then((_) {
        setState(() {
          maxStars = vm.userFeedbackList?.length ?? 5;
          vm.feedbackStatusList =
              List<bool>.filled(vm.userFeedbackList?.length ?? 0, true);
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
                      "${AppConstants.imageBaseUrl}${widget.tripModel?.driver?.profilePic ?? widget.tripModel?.driverDetails?.profilePic}",
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
                            CustomImages.dummyProfile,
                            fit: BoxFit.contain,
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    vm.tripModel?.driver?.firstName ??
                        vm.tripModel?.driverDetails?.firstName ??
                        "",
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
            Expanded(
              child: vm.userFeedbackList?.isNotEmpty == true
                  ? ListView.builder(
                      itemCount: vm.userFeedbackList?.length ?? 0,
                      itemBuilder: (context, index) {
                        final feedback = vm.userFeedbackList![index];
                        return Column(
                          children: [
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10.0),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      feedback.question ?? "",
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
            GestureDetector(
              onTap: () {
                vm.submitUserFeedback();
                Navigator.of(context).pop();
              },
              child: Container(
                margin: const EdgeInsets.symmetric(
                    horizontal: Dimensions.padding_5),
                padding:
                    const EdgeInsets.symmetric(vertical: Dimensions.padding_12),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                    color: CustomColors.primaryColor,
                    borderRadius: BorderRadius.circular(Dimensions.padding_30)),
                child: Text(
                  vm.translation.txt_Submit,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: CustomColors.buttonTxtColor,
                        overflow: TextOverflow.ellipsis,
                      ),
                ),
              ),
            ),
            const SizedBox(height: Dimensions.padding_20),
          ],
        ),
      ),
    );
  }
}
