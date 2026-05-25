import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';
import 'app_status_vm.dart';

class AppStatus extends StatefulWidget {
  const AppStatus({super.key});

  @override
  State<AppStatus> createState() => _AppStatusState();
}

class _AppStatusState extends State<AppStatus> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = AppStatusVm();

  @override
  void initState() {
    super.initState();
    // Initialize the statuses when the screen is created
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.initializeStatuses();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reinitialize the statuses when the screen dependencies change
    vm.initializeStatuses();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        key: scaffoldKey,
        body: Padding(
          padding: const EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
          ),
          child: ChangeNotifierProvider<AppStatusVm>(
            create: (context) => vm,
            child: Consumer<AppStatusVm>(
              builder: (_, vm, child) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    HeaderView(
                      title: vm.translation.txt_app_status,
                    ),
                    const SizedBox(height: Dimensions.padding_10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                           '${vm.translation.txt_Last_Updated_At} :',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Icon(
                          Icons.close_rounded,
                          color: CustomColors.clr_FF0000,
                          size: 25,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          '15/02/2024 12:57 AM',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.clr_AAAAAA,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Dimensions.padding_20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          vm.translation.txt_Network_status,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Icon(
                          vm.isNetworkConnected ? Icons.check_rounded : Icons.close_rounded,
                          color: vm.isNetworkConnected
                              ? CustomColors.clr_35D000
                              : CustomColors.clr_FF0000,
                          size: 25,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          vm.isNetworkConnected
                              ? vm.translation.txt_You_are_connected_to_the_internet
                              : vm.translation.txt_You_have_slow_internet_connection,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.clr_AAAAAA,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Dimensions.padding_20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          '${vm.translation.txt_Network}/${vm.translation.txt_Gps} : ',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Icon(
                          vm.isGpsEnabled ? Icons.check_rounded : Icons.close_rounded,
                          color: vm.isGpsEnabled
                              ? CustomColors.clr_35D000
                              : CustomColors.clr_FF0000,
                          size: 25,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          vm.isGpsEnabled
                              ? vm.translation.txt_GPS_is_enabled
                              : vm.translation.txt_GPS_is_disabled,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.clr_AAAAAA,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Dimensions.padding_20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          vm.translation.txt_Battery_Optimization,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Icon(
                          vm.isBatteryOptimizationEnabled
                              ? Icons.check_rounded
                              : Icons.close_rounded,
                          color: vm.isBatteryOptimizationEnabled
                              ? CustomColors.clr_35D000
                              : CustomColors.clr_FF0000,
                          size: 25,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          vm.isBatteryOptimizationEnabled
                              ? vm.translation.txt_Battery_Optimization_is_enabled
                              : vm.translation.txt_Please_disable_Battery_Optimization,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.clr_AAAAAA,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Dimensions.padding_20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          vm.translation.txt_oops,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: CustomColors.clr_FF0000,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(width: Dimensions.padding_10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 22, vertical: 4),
                          decoration: BoxDecoration(
                            color: CustomColors.clr_FF0000,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          child: Center(
                            child: Text(
                              vm.translation.txt_Disable,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                color: Colors.white,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}