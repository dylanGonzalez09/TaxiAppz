import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/bottomsheets/wallet_recharge_bs/wallet_recharge_vm.dart';


import '../../../utils/custom_colors.dart';

class WalletRechargeBs extends StatefulWidget {
  final String currency;
  const WalletRechargeBs({super.key, required this.currency});

  @override
  _WalletRechargeBs createState() => _WalletRechargeBs();
}

class _WalletRechargeBs extends State<WalletRechargeBs> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => WalletRechargeVm(),
      child: Consumer<WalletRechargeVm>(
        builder: (context, vm, child) {
          return PopScope(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Center(
                      child: Text(
                        vm.translation.txt_recharge_wallet,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontSize: 20,
                            ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Text(
                          widget.currency,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: CustomColors.clr_303030,
                                    fontSize: 28,
                                  ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            controller: vm.rechargeAmountController,
                            maxLength: 8,
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.black,
                                      fontSize: 18,
                                    ),
                            keyboardType: TextInputType.number,
                            cursorColor: Colors.black,
                            decoration: InputDecoration(
                              hintText: vm.translation.txt_enter_amount,
                              hintStyle: const TextStyle(
                                color: Colors.grey,
                                fontSize: 20,
                              ),
                              border: InputBorder.none,
                              counterText: '',
                            ),
                            inputFormatters: [
                              FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                              FilteringTextInputFormatter.deny(RegExp(r'\.\d*\.')),
                            ],
                            onChanged: (value) {
                              vm.setCustomAmount(value);
                            },
                          ),
                        ),
                      ],
                    ),
                    const Divider(
                      height: 1,
                      color: CustomColors.clr_AAAAAA,
                      thickness: 1,
                      indent: 0,
                      endIndent: 0,
                    ),
                    Container(
                      color: Colors.white,
                      child: SizedBox(
                        height: 80,
                        child: GridView.builder(
                          scrollDirection: Axis.horizontal,
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 1,
                            mainAxisSpacing: 0,
                          ),
                          itemCount: vm.amount.length,
                          itemBuilder: (context, index) {
                            return GestureDetector(
                              onTap: () {
                                vm.selectAmount(index);
                              },
                              child: Align(
                                alignment: Alignment.center,
                                child: Container(
                                  width: 65,
                                  height: 35,
                                  decoration: BoxDecoration(
                                    color: vm.selectedIndex == index
                                        ? CustomColors.selectedColor
                                        : Colors.white,
                                    border: Border.all(color: vm.selectedIndex == index
                                        ? CustomColors.primaryColor : Colors.transparent,strokeAlign: 1),
                                    borderRadius: BorderRadius.circular(7),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "${widget.currency} ${vm.amount[index]}",
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(
                            left: 34,
                          ),
                          child: InkWell(
                            onTap: () async {
                              //  GoRouter.of(context).pushNamed(CustomRouter.savedCardListScreen);
                              Navigator.of(context).pop(vm.getSelectedAmount());
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 89, vertical: 8),
                              decoration: BoxDecoration(
                                color: CustomColors.primaryColor,
                                borderRadius: BorderRadius.circular(25),
                              ),
                              child: Center(
                                child: Text(
                                  vm.translation.txt_add_case,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(
                                        color: Colors.white,
                                        fontSize: 18,
                                      ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
