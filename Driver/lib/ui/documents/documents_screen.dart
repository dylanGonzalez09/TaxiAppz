import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/components/proceed_button.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/ui/documents/documents_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../../network/response_models/documents_model.dart';
import '../../utils/custom_router_config.dart';

class DocumentsScreen extends StatefulWidget {
  final Map<String, dynamic>? args;

  const DocumentsScreen({super.key, this.args});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = getIt<DocumentsVm>();

  @override
  void initState() {
    super.initState();

    final vehicleId = widget.args?['vehicleId'] as String?;

    print(" DocumentsScreen initState - vehicleId: $vehicleId");
    print(" Args received: ${widget.args}");


    Future.delayed(Duration.zero, () {
      vm.currentVehicleId = vehicleId;
      vm.getDocumentList(show: true, vehicleId: vehicleId);
    });
  }

  @override
  void dispose() {
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      body: Padding(
        padding: EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
            bottom: vm.isSubmitBtnEnabled ? Dimensions.padding_10 : 0),
        child: Column(
          children: [
            HeaderView(
              title: vm.translation.txt_Documents,
              endWidget: Utils.isDemoKey &&
                  vm.preference.containsKey(PreferenceHelper.demoKey) &&
                  vm.preference.getString(PreferenceHelper.demoKey)?.isNotEmpty ==
                      true
                  ? GestureDetector(
                onTap: () {
                  vm.getDemoUpdateStatus();
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      vm.translation.txt_Skip,
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                    const Icon(
                      Icons.chevron_right_sharp,
                      color: Colors.black,
                    )
                  ],
                ),
              )
                  : null,
            ),
            Expanded(
              child: ChangeNotifierProvider<DocumentsVm>(
                create: (context) => vm,
                child: Consumer<DocumentsVm>(builder: (_, vm, child) {
                  return RefreshIndicator(
                    color: CustomColors.primaryColor,
                    onRefresh: () async {
                      await vm.getDocumentList(isRefresh: true);
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: Dimensions.padding_15, horizontal: 0),
                          child: Text(
                            vm.translation.txt_Please_fill_required_steps,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            itemCount: vm.documents.length,
                            itemBuilder: (cContext, index) {
                              final item = vm.documents[index];

                              // Header row
                              if (item is DocumentHeader) {
                                return Padding(
                                  padding: const EdgeInsets.only(
                                      top: Dimensions.padding_15,
                                      bottom: Dimensions.padding_5),
                                  child: Text(
                                    item.title,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                  ),
                                );
                              }


                              final document = item as DocumentsModel;

                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                    vertical: Dimensions.padding_15, horizontal: 0),
                                child: InkWell(
                                  onTap: () async {
                                    final map = {
                                      AppConstants.document: document,
                                      "vehicleId": vm.currentVehicleId,
                                    };
                                    final response = await vm.moveAndWait(
                                        CustomRouterConfig.uploadDocumentScreen,
                                        args: map);
                                    if (response is bool && response) {
                                      vm.getDocumentList();
                                    } else {
                                      vm.getDocumentList(show: false);
                                    }
                                  },
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(document.name ?? "",
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(fontSize: 15)),
                                      const SizedBox(width: Dimensions.padding_5),
                                      if (document.isRequired)
                                        SvgPicture.asset(CustomImages.required),
                                      const Spacer(),
                                      if (document.isExpired ||
                                          document.approveStatus ==
                                              DriverBlockedReason.DENIED)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: Dimensions.padding_10,
                                              vertical: Dimensions.padding_5),
                                          decoration: BoxDecoration(
                                              color: CustomColors.clr_FFDCDC,
                                              borderRadius: BorderRadius.circular(
                                                  Dimensions.padding_5)),
                                          child: Row(
                                            children: [
                                              if (document.isExpired ||
                                                  document.approveStatus ==
                                                      DriverBlockedReason.DENIED)
                                                Text(
                                                    document.isExpired
                                                        ? vm.translation.txt_Expired
                                                        : vm.documentStatus(
                                                        DriverBlockedReason.DENIED),
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .labelSmall
                                                        ?.copyWith(
                                                        fontSize: 12,
                                                        color: CustomColors
                                                            .clr_B70000)),
                                              if (document.isExpired)
                                                const SizedBox(
                                                    width: Dimensions.padding_10),
                                              if (document.uploadStatus == false)
                                                const Icon(
                                                  Icons.add_rounded,
                                                  size: 20,
                                                  color: CustomColors.clr_FE0000,
                                                )
                                            ],
                                          ),
                                        ),
                                      if ((!document.isExpired &&
                                          document.uploadStatus == false) ||
                                          document.approveStatus ==
                                              DriverBlockedReason.DENIED ||
                                          document.approveStatus ==
                                              DriverBlockedReason.DOCUMENT_NOT_UPLOADED)
                                        const Icon(
                                          Icons.add_rounded,
                                          size: 20,
                                          color: CustomColors.clr_FE0000,
                                        ),
                                      if (!document.isExpired &&
                                          document.uploadStatus == true)
                                        const Icon(
                                            color: CustomColors.clr_35D000,
                                            size: 20,
                                            Icons.done_rounded)
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        Visibility(
                          visible: vm.isSubmitBtnEnabled,
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: Dimensions.padding_10),
                            child: Center(
                              child: ProceedButton(
                                  showArrowIcon: false,
                                  isLoading: vm.isLoading.value,
                                  btnTxt: vm.translation.txt_Submit,
                                  onPressed: () => Utils.isDemoKey &&
                                      vm.preference.containsKey(
                                          PreferenceHelper.demoKey) &&
                                      vm.preference
                                          .getString(PreferenceHelper.demoKey)
                                          ?.isNotEmpty ==
                                          true
                                      ? vm.getDemoUpdateStatus()
                                      : vm.pop()),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      ),
      scaffoldKey: scaffoldKey,
    );
  }
}
