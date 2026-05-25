import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../network/response_models/custom_name_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_router.dart';
import '../../about/aboutUs_screen.dart';

class PaymentMethodBs extends StatefulWidget {
  final List<CustomNameModel>? paymentMethod;

  const PaymentMethodBs({super.key, this.paymentMethod});

  @override
  _PaymentMethodBs createState() => _PaymentMethodBs();
}

class _PaymentMethodBs extends State<PaymentMethodBs> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                vm.translation.txt_payment_methods,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.black,
                  fontSize: 16,
                ),
              ),
              const SizedBox(
                height: 20,
              ),
              ListView.builder(
                shrinkWrap: true,
                itemCount: widget.paymentMethod?.length,
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () {
                      widget.paymentMethod
                          ?.forEach((i) => i.isSelected = false);
                      setState(() {
                        widget.paymentMethod?[index].isSelected = true;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 8.0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Icon(
                            widget.paymentMethod?[index].name?.toUpperCase() ==
                                AppConstants.cash.toUpperCase()
                                ? Icons.payments_outlined
                                : widget.paymentMethod?[index].name
                                ?.toUpperCase() ==
                                AppConstants.card.toUpperCase()
                                ? Icons.credit_card_outlined
                                : widget.paymentMethod?[index].name
                                ?.toUpperCase() ==
                                AppConstants.wallet.toUpperCase()
                                ? Icons.wallet
                                : Icons.credit_card,
                            color: CustomColors.svgImageColorDarkBlue,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              widget.paymentMethod?[index].name ?? "",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                color: Colors.black,
                                fontSize: 16,
                              ),
                            ),
                          ),
                          Visibility(
                            visible:
                            widget.paymentMethod?[index].isSelected == true,
                            child: const Icon(
                              Icons.check_rounded,
                              color: CustomColors.primaryColor,
                              size: 22,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(
                height: 20,
              ),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () async {
                        // GoRouter.of(context)
                        //     .pushNamed(CustomRouter.savedCardListScreen);
                        if (widget.paymentMethod?.isNotEmpty == true) {
                          GoRouter.of(context).pop(List.from(
                              widget.paymentMethod!.map((m) => m.toJson())));
                        } else {
                          GoRouter.of(context).pop();
                        }
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(left: 26, right: 26),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: CustomColors.primaryColor,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          child: Center(
                            child: Text(
                              vm.translation.txt_Confirm,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(
                                color: CustomColors.buttonTxtColor,
                                fontSize: 18,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
