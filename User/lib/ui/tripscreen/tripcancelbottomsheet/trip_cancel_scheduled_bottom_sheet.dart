import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/history/scheduled/scheduled_detail_vm.dart';

import '../../../network/response_models/cancelReason_model.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';

class TripCancelScheduledBottomSheet extends StatefulWidget {
  final ScheduledDetailVm vm;

  TripCancelScheduledBottomSheet({super.key, required this.vm});

  @override
  State<TripCancelScheduledBottomSheet> createState() => _TripCancelScheduledBottomSheetState();
}

class _TripCancelScheduledBottomSheetState extends State<TripCancelScheduledBottomSheet> {
  int? selectedReasonIndex;

  CancelReasonModel? selectedCancelReason;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.vm.getCancelReasonList();
    });
  }

  @override
  Widget build(
      BuildContext context,
      ) => ChangeNotifierProvider<ScheduledDetailVm>.value(
    value: widget.vm,
    child: Consumer<ScheduledDetailVm>(
      builder:
          (context, vm, child) => SizedBox(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: Dimensions.padding_10,
            vertical: Dimensions.padding_20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                vm.translation.txt_cancel_this_ride,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: Dimensions.padding_10),
              Text(
                vm.translation.txt_Cancellation_charge_might_be_applied,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                ),
              ),
              const SizedBox(height: Dimensions.padding_10),
              vm.cancelReasonList == null || vm.cancelReasonList!.isEmpty
                  ? const CircularProgressIndicator(
                color: CustomColors.primaryColor,
              )
                  : Expanded(
                child: ListView.builder(
                  scrollDirection: Axis.vertical,
                  shrinkWrap: true,
                  itemCount: vm.cancelReasonList!.length,
                  itemBuilder: (c, index) {
                    return InkWell(
                      onTap: () {
                        setState(() {
                          selectedReasonIndex = index;
                        });

                        selectedCancelReason =
                        vm.cancelReasonList?[index];
                        debugPrint(
                          "SelectedReason ${selectedCancelReason?.id}",
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(
                            Dimensions.padding_5,
                          ),
                          color:
                          selectedReasonIndex == index
                              ? CustomColors.selectedColor
                              : Colors.white,
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: Dimensions.padding_12,
                          vertical: Dimensions.padding_10,
                        ),
                        margin: const EdgeInsets.symmetric(
                          vertical: Dimensions.padding_5,
                        ),
                        child: Text(
                          vm.cancelReasonList![index].reason.toString(),
                          style: Theme.of(
                            context,
                          ).textTheme.labelSmall?.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: Dimensions.padding_10),
              GestureDetector(
                onTap: () {
                  selectedCancelReason = null;
                  GoRouter.of(context).pop();
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(
                    horizontal: Dimensions.padding_35,
                  ),
                  padding: const EdgeInsets.symmetric(
                    vertical: Dimensions.padding_13,
                  ),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: CustomColors.primaryColor,
                    borderRadius: BorderRadius.circular(
                      Dimensions.padding_30,
                    ),
                  ),
                  child: Text(
                    vm.translation.txt_keep_the_booking,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: CustomColors.buttonTxtColor,
                      fontSize: Dimensions.padding_17,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: Dimensions.padding_10),
              InkWell(
                onTap: () async {
                  if (selectedCancelReason != null) {
                    GoRouter.of(context).pop(selectedCancelReason);
                  } else {
                    vm.showErrorDialog(
                      message:
                      vm
                          .translation
                          .txt_Please_select_any_reason_for_cancellation,
                    );
                  }
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 25),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(25),
                      border: Border.all(color: CustomColors.clr_303030),
                    ),
                    child: Center(
                      child: Text(
                        vm.translation.txt_cancel_ride,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

