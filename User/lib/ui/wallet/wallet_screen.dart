import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/wallet/wallet_vm.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  late WalletVm vm;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    vm = WalletVm();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getWalletDetails();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      body: ChangeNotifierProvider<WalletVm>(
        create: (context) => vm,
        child: Consumer<WalletVm>(
          builder: (_, vm, child) {
            return Stack(
              children: [
                Padding(
                    padding: const EdgeInsets.only(
                      left: Dimensions.padding_20,
                      right: Dimensions.padding_20,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         HeaderView(
                          title: vm.translation.txt_wallet.toUpperCase(),
                        ),
                        const SizedBox(
                          height: 12,
                        ),
                        Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.white,
                            boxShadow: const [
                              BoxShadow(
                                spreadRadius: 0.2,
                                blurRadius: 2,
                                color: CustomColors.clr_AAAAAA,
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Stack(
                              children: [
                                Positioned(
                                  top: 0,
                                  left: 0,
                                  child: SvgPicture.asset(
                                    CustomImages.walletBgLeft,
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  bottom: 0,
                                  child: SvgPicture.asset(
                                    CustomImages.walletBgRight,
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: Dimensions.padding_15,
                                      vertical: Dimensions.padding_10),
                                  child: Column(
                                    children: [
                                      Row(
                                        children: [
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                vm.translation.txt_wallet,
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall
                                                    ?.copyWith(
                                                      color: Colors.black,
                                                      fontSize: 18,
                                                    ),
                                              ),
                                              const SizedBox(
                                                  height:
                                                      Dimensions.padding_13),
                                              Text(
                                                vm.translation.txt_available_balance,
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall
                                                    ?.copyWith(
                                                      color: CustomColors
                                                          .clr_AAAAAA,
                                                      fontSize: 13,
                                                    ),
                                              ),
                                            ],
                                          ),
                                          const Spacer(),
                                          const Icon(
                                            Icons.account_balance_wallet,
                                            color: CustomColors.svgImageColorDarkBlue,
                                            size: 25,
                                          ),
                                        ],
                                      ),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            "${vm.walletDetail?.currency ?? "₹"}"
                                            " ${vm.walletDetail?.balance ?? "0"}",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge
                                                ?.copyWith(
                                                  color: Colors.black,
                                                  fontSize: 20,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // const SizedBox(height: Dimensions.padding_30),
                        // Padding(
                        //   padding: const EdgeInsets.only(
                        //     left: 10,
                        //   ),
                        //   child: Row(
                        //     mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        //     children: [
                        //       SvgPicture.asset(
                        //         CustomImages.paymentIcon,
                        //       ),
                        //       const SizedBox(width: Dimensions.padding_10),
                        //       Expanded(
                        //         child: InkWell(
                        //           onTap: () async {
                        //             vm.showPaymentMethod();
                        //           },
                        //           child: Text(
                        //             'Payment/Case',
                        //             style: Theme.of(context)
                        //                 .textTheme
                        //                 .bodySmall
                        //                 ?.copyWith(
                        //                   color: Colors.black,
                        //                   fontSize: 15,
                        //                 ),
                        //           ),
                        //         ),
                        //       ),
                        //       const Icon(
                        //         Icons.arrow_forward_ios_rounded,
                        //         color: CustomColors.clr_AAAAAA,
                        //         size: 20,
                        //       ),
                        //     ],
                        //   ),
                        // ),
                        const SizedBox(height: Dimensions.padding_30),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                vm.translation.txt_actions,
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
                        const SizedBox(height: Dimensions.padding_20),
                        Padding(
                          padding: const EdgeInsets.only(left: 10),
                          child: InkWell(
                            onTap: () async {
                              vm.showRecharge();
                            },
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                SvgPicture.asset(
                                  CustomImages.rupeeIcon,
                                ),
                                const SizedBox(width: Dimensions.padding_10),
                                Expanded(
                                  child: Text(
                                    vm.translation.txt_reacharge,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 15,
                                        ),
                                  ),
                                ),
                                const Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  color: CustomColors.clr_AAAAAA,
                                  size: 20,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: Dimensions.padding_30),
                        Padding(
                          padding: const EdgeInsets.only(left: 10),
                          child: InkWell(
                            onTap: () async {
                              final map = {
                                AppConstants.walletId:
                                    vm.walletDetail?.sId ?? "",
                              };
                              vm.moveToNamed(CustomRouter.transactionListScreen,
                                  args: map);
                            },
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Icon(
                                  Icons.list_alt,
                                  color: CustomColors.svgImageColorDarkBlue,
                                  size: 20,
                                ),
                                const SizedBox(width: Dimensions.padding_10),
                                Expanded(
                                  child: Text(
                                    vm.translation.txt_transaction_history,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: Colors.black,
                                          fontSize: 15,
                                        ),
                                  ),
                                ),
                                const Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  color: CustomColors.clr_AAAAAA,
                                  size: 20,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    )),
              ],
            );
          },
        ),
      ),
      scaffoldKey: scaffoldKey,
    );
  }
}
