import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../di/di_config.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import 'company_vehicle_list_vm.dart';

class CompanyVehicleListScreen extends StatefulWidget {
  const CompanyVehicleListScreen({super.key});

  @override
  State<CompanyVehicleListScreen> createState() => _CompanyVehicleListScreenState();
}

class _CompanyVehicleListScreenState extends State<CompanyVehicleListScreen>
    with RouteAware{
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = getIt<CompanyVehicleListVm>();
  final ScrollController scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getCompanyVehicleList();
    });
  }

  @override
  void didPopNext() {
    vm.getCompanyVehicleList();
    super.didPopNext();
  }

  @override
  void dispose() {
    vm.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider<CompanyVehicleListVm>.value(
          value: vm,
          child: Consumer<CompanyVehicleListVm>(
            builder: (context, vm, child) {
              final vehicleList = vm.companyVehicleModel?.vehicle ?? [];
              return Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: Dimensions.padding_15,
                    vertical: Dimensions.padding_15
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Align(
                            alignment: Alignment.centerLeft,
                            child: InkWell(
                              onTap: () {
                                scaffoldKey.currentState?.openDrawer();
                              },
                              child: const Padding(
                                padding: EdgeInsets.only(bottom: 2),
                                child: Icon(
                                  Icons.menu_rounded,
                                  size: 28,
                                ),
                              ),
                            ),
                          ),
                          Center(
                            child: Text(
                              vm.translation.txtSelectVehicle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: CustomColors.clr_303030,
                                fontSize: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: Dimensions.padding_15),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: Colors.white,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 0),
                        child: Column(
                          children: [
                            vehicleList.isNotEmpty
                                ? Expanded(
                              child: ListView.builder(
                                controller: scrollController,
                                itemCount: vehicleList.length,
                                itemBuilder: (context, index) {
                                  final vehicle = vehicleList[index];
                                  final vehicleName = vehicle.vehicleId?.vehicleName ?? '';
                                  final modelName = vehicle.vehicleModelId?.modelname ?? '';
                                  final registration = vehicle.registrationNumber ?? '';

                                  return GestureDetector(
                                    onTap: () {
                                      vm.selectVehicle(index);
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
                                      padding: const EdgeInsets.all(12.0),
                                      decoration: BoxDecoration(
                                        color: Colors.grey[100],
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: vm.selectedVehicleIndex == index
                                              ? Colors.green
                                              : Colors.grey.shade300,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                vehicleName,
                                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 16,
                                                ),
                                              ),
                                              Text(
                                                modelName,
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                  color: Colors.grey[700],
                                                ),
                                              ),
                                              Text(
                                                registration,
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                  color: Colors.grey[700],
                                                ),
                                              ),
                                            ],
                                          ),
                                          if (vm.selectedVehicleIndex == index)
                                            const Icon(Icons.check_circle, color: Colors.green),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            )
                                : Flexible(
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SvgPicture.asset(CustomImages.notificationNotFound),
                                    Text(
                                      vm.translation.txt_no_data_found,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 15),
                            InkWell(
                              onTap: () {
                                if (vm.selectedVehicle != null) {
                                  vm.updateVehicleID(vm.selectedVehicle?.sId);
                                }
                              },
                              child: Container(
                                width: MediaQuery.of(context).size.width * 0.75,
                                alignment: Alignment.center,
                                padding: const EdgeInsets.symmetric(
                                  vertical: Dimensions.padding_12,
                                  horizontal: Dimensions.padding_5,
                                ),
                                decoration: BoxDecoration(
                                  color: (vm.selectedVehicle?.isBlank ?? true)
                                      ? CustomColors.clr_AAAAAA
                                      : CustomColors.primaryColor,
                                  borderRadius: BorderRadius.circular(26),
                                ),
                                child: Text(
                                  vm.translation.txt_Submit,
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
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
      ),
    );
  }
}
