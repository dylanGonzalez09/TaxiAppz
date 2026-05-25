import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import 'complaint_vm.dart';

class ComplaintScreen extends StatefulWidget {
  final Map<String, dynamic> data;

  const ComplaintScreen({super.key, required this.data});

  @override
  State<ComplaintScreen> createState() => _ComplaintScreenState();
}

class _ComplaintScreenState extends State<ComplaintScreen> {
  final vm = ComplaintVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    vm.setArgs(widget.data);
    vm.isDispute = widget.data.containsKey(AppConstants.type) &&
        widget.data[AppConstants.type] == AppConstants.dispute;
    if (vm.isDispute) {
      vm.requestId = widget.data.containsKey(AppConstants.requestId)
          ? widget.data[AppConstants.requestId] ?? ""
          : "";
    }
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getComplaintList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider<ComplaintVm>(
          create: (context) => vm,
          child: Consumer<ComplaintVm>(
            builder: (_, vm, child) {
              return Padding(
                padding: const EdgeInsets.only(
                  left: Dimensions.padding_20,
                  right: Dimensions.padding_20,
                ),
                child: Column(
                  children: [
                    HeaderView(
                      title: vm.isDispute
                          ? vm.translation.txtDispute
                          : vm.translation.txtComplaint,
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: vm.complaintList?.length ?? 0,
                              itemBuilder: (BuildContext context, int index) {
                                final complaint = vm.complaintList?[index];
                                return InkWell(
                                  onTap: () {
                                    setState(() {
                                      vm.selectedComplaint = complaint;
                                    });
                                  },
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: vm.selectedComplaint == complaint
                                          ? CustomColors.selectedColor
                                          : Colors.white,
                                      border: Border.all(
                                        color: vm.selectedComplaint == complaint
                                            ? CustomColors.primaryColor
                                            : Colors.white,
                                      ),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    padding: const EdgeInsets.all(
                                        Dimensions.padding_10),
                                    child: Row(
                                      mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            complaint?.title ?? "",
                                            maxLines: 2,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 15,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: Dimensions.padding_20),
                            Card(
                              color: CustomColors.clr_E2E2E2,
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: TextFormField(
                                  controller: vm.complaintController,
                                  onChanged: (val) {
                                    final result = vm.complaintValidator(val);
                                    setState(() {
                                      vm.errorTxt = result ?? "";
                                    });
                                  },
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                    color: Colors.black,
                                    fontSize: 15,
                                  ),
                                  maxLines: 6,
                                  decoration:
                                      const InputDecoration.collapsed(
                                          hintText:
                                              "Enter complaints briefly"),
                                ),
                              ),
                            ),
                            if (vm.errorTxt.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(
                                    top: 4.0, left: 8.0),
                                child: Text(
                                  vm.errorTxt,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                    fontSize: 14,
                                    color: CustomColors.clr_FF0000,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            const SizedBox(height: 50),
                          ],
                        ),
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        if (!mounted) return;
                        if (vm.selectedComplaint == null &&
                            vm.complaintController.text.trim().isEmpty) {
                          vm.showErrorDialog(
                            message:
                            "Please select a complaint or enter a description",
                          );
                          return;
                        }

                        final text = vm.complaintController.text.trim();
                        if (text.isNotEmpty) {
                          final validationResult =
                          vm.complaintValidator(text);
                          if (validationResult != null) {
                            setState(() {
                              vm.errorTxt = validationResult;
                            });
                            return;
                          }
                        }

                        setState(() {
                          vm.errorTxt = "";
                        });
                        vm.userSubmitComplaint();
                      },
                      child: Container(
                        width: MediaQuery.of(context).size.width * 0.75,
                        alignment: Alignment.center,
                        padding: const EdgeInsets.symmetric(
                          vertical: Dimensions.padding_12,
                          horizontal: Dimensions.padding_5,
                        ),
                        decoration: BoxDecoration(
                          color: CustomColors.primaryColor,
                          borderRadius: BorderRadius.circular(26),
                        ),
                        child: Text(
                          vm.translation.txt_Submit,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(color: Colors.white),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    const SizedBox(height: Dimensions.padding_20),
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