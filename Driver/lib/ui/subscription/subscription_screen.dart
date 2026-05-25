import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/ui/subscription/subscription_vm.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import 'mountainview/mountain_view.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State createState() => SubscriptionScreenState();
}

class SubscriptionScreenState extends State<SubscriptionScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = SubscriptionVm();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => vm.getSubscriptionPackageList());
  }

  @override
  Widget build(BuildContext context) => DrawerScaffold(
      body: ChangeNotifierProvider(
        create: (context) => vm,
        child: Consumer<SubscriptionVm>(
          builder: (c, vm, child) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
            child: Column(
              children: [
                HeaderView(
                  title: vm.translation.txtChooseYourPlan,
                  onBackPressed: () {
                    scaffoldKey.currentState?.openDrawer();
                  },
                  isMenu: true,
                ),
                Expanded(
                  child: vm.isSubscriptionListEmpty == 0
                      ? Center(
                          child: CircularProgressIndicator(
                            strokeWidth: Dimensions.padding_3,
                          ),
                        )
                      : vm.isSubscriptionListEmpty == 1
                          ? Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SvgPicture.asset(
                                  CustomImages.notificationNotFound,
                                ),
                                Center(
                                  child: Text(vm.translation.txtNoSubscriptionPlanFound),
                                ),
                              ],
                            )
                          : ListView.builder(
                              itemCount: vm.subscriptionModelList?.length,
                              itemBuilder: (c, p) {
                                return Container(
                                  clipBehavior: Clip.hardEdge,
                                  decoration: BoxDecoration(
                                      boxShadow: const [BoxShadow(
                                          spreadRadius: 0.2,
                                          blurRadius: 2,
                                          color: CustomColors.clr_AAAAAA
                                      )],
                                      gradient: LinearGradient(
                                          colors: vm.subscriptionModelList![p].materialColor != null
                                              ? [
                                                  vm.subscriptionModelList![p].materialColor!,
                                                  vm.subscriptionModelList![p].materialColor!.shade400,
                                                  vm.subscriptionModelList![p].materialColor!.shade300,
                                                  vm.subscriptionModelList![p].materialColor!.shade200,
                                                  vm.subscriptionModelList![p].materialColor!.shade200
                                                ]
                                              : [CustomColors.subscrtionColorOne],
                                          begin: Alignment.topLeft,
                                          end: Alignment.topRight),
                                      borderRadius: BorderRadius.circular(Dimensions.padding_30)),
                                  margin: const EdgeInsets.symmetric(
                                      horizontal: Dimensions.padding_10,
                                      vertical: Dimensions.padding_10
                                  ),
                                  child: Stack(
                                    children: [
                                      // Positioned.fill(
                                      //   child: CustomPaint(
                                      //     size: Size(
                                      //         double.infinity, double.infinity),
                                      //     painter: MountainLakePainter(
                                      //         color: vm
                                      //                 .subscriptionModelList?[p]
                                      //                 .materialColor ??
                                      //             vm.createMaterialColor(
                                      //                 CustomColors
                                      //                     .subscrtionColorOne),
                                      //         mountainType: true),
                                      //   ),
                                      // ),
                                      Positioned.fill(
                                        child: CustomPaint(
                                          size: Size(double.infinity, double.infinity),
                                          painter: MountainLakePainter(
                                              color: vm.subscriptionModelList?[p].materialColor ?? vm.createMaterialColor(CustomColors.subscrtionColorOne)
                                          ),
                                        ),
                                      ),
                                      Align(
                                        alignment: Alignment.center,
                                        child: Padding(
                                          padding: const EdgeInsets.only(
                                              left: Dimensions.padding_20,
                                              top: Dimensions.padding_17,
                                              right: Dimensions.padding_20,
                                              bottom: Dimensions.padding_20
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.end,
                                            children: [
                                              Row(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      spacing: Dimensions.padding_2,
                                                      children: [
                                                        Text(
                                                          vm.subscriptionModelList?[p].name ?? "",
                                                          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                                              fontSize: Dimensions.padding_18,
                                                              color: Colors.white
                                                          ),
                                                        ),
                                                        Text(
                                                          "${vm.translation.txtValidFor} ${vm.subscriptionModelList?[p].validityPeriod} ${vm.subscriptionModelList?[p].unit}",
                                                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                                              fontSize: Dimensions.padding_14,
                                                              color: Colors.white
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  Text(
                                                    "${AppConstants.appCurrencySymbol} ${vm.subscriptionModelList?[p].amount}",
                                                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                                        fontSize: Dimensions.padding_35,
                                                        color: Colors.white
                                                    ),
                                                  )
                                                ],
                                              ),
                                              const SizedBox(
                                                height: Dimensions.padding_20,
                                              ),
                                              Row(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                spacing: Dimensions.padding_5,
                                                children: [
                                                  SvgPicture.asset(
                                                    CustomImages.icSubscriptionChecked,
                                                    width: Dimensions.padding_12,
                                                    height: Dimensions.padding_12,
                                                  ),
                                                  Expanded(
                                                    child: Text(
                                                      vm.subscriptionModelList?[p].description ?? "",
                                                      style: Theme.of(context).textTheme.labelMedium?.copyWith(fontSize: Dimensions.padding_13, color: Colors.white),
                                                    ),
                                                  )
                                                ],
                                              ),
                                              const SizedBox(
                                                height: Dimensions.padding_20,
                                              ),
                                              GestureDetector(
                                                onTap: () {
                                                  if (vm.subscriptionModelList?.isNotEmpty == true) {
                                                    vm.addSubscription(vm.subscriptionModelList![p]);
                                                  }
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: Dimensions.padding_10,
                                                      vertical: Dimensions.padding_5
                                                  ),
                                                  decoration: BoxDecoration(
                                                      borderRadius: BorderRadius.circular(
                                                          Dimensions.padding_30
                                                      ),
                                                      color: Colors.white
                                                  ),
                                                  child: Row(
                                                    spacing: Dimensions.padding_5,
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Text(
                                                        vm.translation.txtChoosePlan,
                                                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                                            color: Colors.black,
                                                            fontSize: Dimensions.padding_13
                                                        ),
                                                      ),
                                                      Icon(
                                                        Icons.arrow_forward_ios_rounded,
                                                        size: Dimensions.padding_15,
                                                      )
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                ),
              ],
            ),
          ),
        ),
      ),
      scaffoldKey: scaffoldKey);

  @override
  void dispose() {
    vm.isDisposed = true;
    super.dispose();
  }
}
