import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/ui/dialogs/admin_contact_dialog.dart';
import 'package:taxiappzpro/ui/driver_blocked/driver_blocked_vm.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class DriverBlockedScreen extends StatefulWidget {

  final Map<String,dynamic> args;

  const DriverBlockedScreen({super.key, required this.args});

  @override
  State<DriverBlockedScreen> createState() => _DriverBlockedScreenState();
}

class _DriverBlockedScreenState extends State<DriverBlockedScreen>
    with RouteAware {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = getIt<DriverBlockedVm>();
  RequestInProModel? requestInProModel;

  @override
  void initState() {

requestInProModel = widget.args["requestInProgress"];
print("ekrfpreg${requestInProModel?.driver?.isCompanyDriver}");
    vm.setArgs(widget.args["blockReason"],requestInProModel ?? RequestInProModel());
    vm.listenForDetailsChanges();
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    routeObserver.subscribe(this, ModalRoute.of(context)!);
  }

  @override
  void didPopNext() {
    vm.getRequestInProgress();
    super.didPopNext();
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    vm.driverDetailsSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    routeObserver.subscribe(this, ModalRoute.of(context)!);
    return PopScope(
      canPop: false,
      child: DrawerScaffold(
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider.value(
          value: vm,
          child: Consumer<DriverBlockedVm>(
            builder: (context, vm, c) => Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        vertical: Dimensions.padding_20),
                    child: InkWell(
                      onTap: () {
                        scaffoldKey.currentState?.openDrawer();
                      },
                      child: const Icon(
                        Icons.menu_rounded,
                        size: 28,
                      ),
                    ),
                  ),
                  Expanded(
                      child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SvgPicture.asset(CustomImages.driverBlockedIcon),
                        const SizedBox(height: Dimensions.padding_20),
                        Text(vm.title,
                            style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: Dimensions.padding_5),
                        Text(
                          vm.description,
                          style: Theme.of(context).textTheme.bodySmall,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  )),
                  if (vm.buttonTxt.isNotEmpty)
                  Align(
                    alignment: Alignment.center,
                    child: InkWell(
                      onTap: vm.handleButtonClick,
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.symmetric(
                            horizontal: Dimensions.padding_30),
                        padding: const EdgeInsets.symmetric(
                            vertical: Dimensions.padding_15),
                        decoration: BoxDecoration(
                            color: CustomColors.primaryColor,
                            borderRadius:
                                BorderRadius.circular(Dimensions.padding_26)),
                        child: Center(
                          child: Text(
                            vm.buttonTxt,
                            style: Theme.of(context)
                                .textTheme
                                .bodyLarge
                                ?.copyWith(
                                    color: CustomColors.buttonTxtColor,
                                    fontSize: 16),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: Dimensions.padding_20)
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
