import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../components/proceed_button.dart';
import '../../../network/response_models/cancelReason_model.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import '../trip_vm.dart';

class TripCancelBottomSheet extends StatefulWidget {
  final TripVm vm;

  const TripCancelBottomSheet({super.key, required this.vm});

  @override
  State<StatefulWidget> createState() => TripCancelBottomSheetState();
}

class TripCancelBottomSheetState extends State<TripCancelBottomSheet> {
  int? selectedReasonIndex;
  CancelReasonModel? selectedCancelReason;

  final TextEditingController _otherReasonController = TextEditingController();
  bool _isOthersSelected = false;

  bool _isOthers(CancelReasonModel? reason) {
    return reason?.reason?.trim().toLowerCase() == 'others' ||
        reason?.reason?.trim().toLowerCase() == 'other';
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.vm.getCancelReasonList();
    });
  }

  @override
  void dispose() {
    _otherReasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => SafeArea(
    child: ChangeNotifierProvider<TripVm>.value(
        value: widget.vm,
        child: Consumer<TripVm>(
          builder: (context, vm, child) => SizedBox(
            width: double.infinity,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: Dimensions.padding_10,
                  vertical: Dimensions.padding_20),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      vm.translation.txtCancelThisRide,
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(
                          fontSize: 18,
                          fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: Dimensions.padding_10),
                    Text(
                      vm.translation.txtCancellationChargeMightBeApplied,
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w400),
                    ),
                    const SizedBox(height: Dimensions.padding_10),

                    vm.cancelReasonList == null ||
                        vm.cancelReasonList!.isEmpty
                        ? const CircularProgressIndicator(
                      color: CustomColors.primaryColor,
                      strokeWidth: 2,
                    )
                        : ListView.builder(
                        scrollDirection: Axis.vertical,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: vm.cancelReasonList!.length,
                        itemBuilder: (c, index) {
                          return InkWell(
                            onTap: () {
                              setState(() {
                                selectedReasonIndex = index;
                                selectedCancelReason =
                                vm.cancelReasonList?[index];
                                _isOthersSelected = _isOthers(
                                    vm.cancelReasonList?[index]);
                                if (!_isOthersSelected) {
                                  _otherReasonController.clear();
                                }
                              });
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(
                                    Dimensions.padding_5),
                                color: selectedReasonIndex == index
                                    ? CustomColors.clr_d7df2380
                                    : Colors.white,
                              ),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: Dimensions.padding_12,
                                  vertical: Dimensions.padding_10),
                              margin: const EdgeInsets.symmetric(
                                  vertical: Dimensions.padding_5),
                              child: Text(
                                vm.cancelReasonList![index].reason
                                    .toString(),
                                style: Theme.of(context)
                                    .textTheme
                                    .labelSmall
                                    ?.copyWith(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400),
                              ),
                            ),
                          );
                        }),

                    if (_isOthersSelected) ...[
                      const SizedBox(height: Dimensions.padding_10),
                      TextField(
                        controller: _otherReasonController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText:  vm.translation.txt_please_describe_your_reason,
                          hintStyle: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.grey),
                          filled: true,
                          fillColor: Colors.white,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide:
                            const BorderSide(color: Colors.grey),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(
                                color: CustomColors.primaryColor),
                          ),
                        ),
                      ),
                    ],

                    const SizedBox(height: Dimensions.padding_10),

                    ProceedButton(
                      showArrowIcon: false,
                      btnTxt: vm.translation.txtKeepTheBooking,
                      onPressed: () {
                        selectedCancelReason = null;
                        GoRouter.of(context).pop();
                      },
                    ),
                    const SizedBox(height: Dimensions.padding_10),

                    InkWell(
                      onTap: () {
                        if (selectedCancelReason == null) {
                          vm.showErrorDialog(
                              message: vm.translation
                                  .txtPleaseSelectAnyReasonForCancellation);
                          return;
                        }
                        if (_isOthersSelected &&
                            _otherReasonController.text.trim().isEmpty) {
                          vm.showErrorDialog(
                              message:
                              vm.translation
                                  .txt_Please_describe_your_reason_for_cancellation);
                          return;
                        }
                        if (_isOthersSelected) {
                          selectedCancelReason!.reason =
                              _otherReasonController.text.trim();
                        }
                        GoRouter.of(context).pop(selectedCancelReason);
                      },
                      child: Padding(
                        padding:
                        const EdgeInsets.symmetric(horizontal: 25),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(25),
                            border: Border.all(
                                color: CustomColors.clr_303030),
                          ),
                          child: Center(
                            child: Text(
                              vm.translation.txtCancelRide,
                              style:
                              Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(
                      height: MediaQuery.of(context).viewInsets.bottom > 0
                          ? MediaQuery.of(context).viewInsets.bottom
                          : Dimensions.padding_10,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
  );
}
