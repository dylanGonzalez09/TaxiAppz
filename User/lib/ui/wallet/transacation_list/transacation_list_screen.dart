import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/wallet/transacation_list/transacation_list_vm.dart';

import '../../../components/custom_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../network/response_models/custom_name_model.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import '../../dialogs/select_dialog.dart';

class TransactionListScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const TransactionListScreen({super.key, required this.args});

  @override
  State<TransactionListScreen> createState() => _TransactionListScreenState();
}

class _TransactionListScreenState extends State<TransactionListScreen> {
  final vm = TransactionListVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  List<CustomNameModel> sortOrderList = [
    CustomNameModel(name: "Earned", id: "1"),
    CustomNameModel(name: "Debited", id: "2"),
    CustomNameModel(name: "spent", id: "3"),
    CustomNameModel(name: AppConstants.all, id: "4"),
  ];

  @override
  void initState() {
    vm.walletId = widget.args[AppConstants.walletId];
    vm.scrollController.addListener(vm.loadMoreData);
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getWalletTransactionList();
    });
  }

  @override
  void dispose() {
    vm.scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScaffold(
          scaffoldKey: scaffoldKey,
          body: ChangeNotifierProvider<TransactionListVm>(
            create: (context) => vm,
            child: Consumer<TransactionListVm>(builder: (_, vm, child) {
              return Padding(
                padding: const EdgeInsets.only(
                  left: Dimensions.padding_20,
                  right: Dimensions.padding_20,
                  bottom: Dimensions.padding_20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    HeaderView(
                      title:
                      vm.translation.txt_transaction_history.toUpperCase(),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        InkWell(
                          onTap: () async {
                            final result = await showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return SelectDialog(
                                  title: vm.translation.txt_sort_order,
                                  customModel: sortOrderList,
                                );
                              },
                            );
                            if (result != null) {}
                          },
                          child: const Center(
                            child: Row(
                              children: [
                                Icon(
                                  Icons.sort,
                                  color: CustomColors.svgImageColorDarkBlue,
                                  size: 25,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: Dimensions.padding_10,
                    ),
                    vm.isPageLoading
                        ? Center(
                      child: Container(
                          decoration: BoxDecoration(
                              color: CustomColors.clr_E2E2E2,
                              borderRadius: BorderRadius.circular(100)),
                          height: 35,
                          width: 35,
                          child: const Padding(
                            padding: EdgeInsets.all(8.0),
                            child: CircularProgressIndicator(
                              color: CustomColors.clr_AAAAAA,
                            ),
                          )),
                    )
                        : vm.transactionList.isNotEmpty
                        ? Expanded(
                      child: ListView.builder(
                        controller: vm.scrollController,
                        itemCount: vm.isPaginationLoading
                            ? vm.transactionList.length + 1
                            : vm.transactionList.length,
                        itemBuilder:
                            (BuildContext context, int index) {
                          if (index == vm.transactionList.length) {
                            return Center(
                              child: Container(
                                  decoration: BoxDecoration(
                                      color: CustomColors.clr_E2E2E2,
                                      borderRadius:
                                      BorderRadius.circular(100)),
                                  height: 35,
                                  width: 35,
                                  child: const Padding(
                                    padding: EdgeInsets.all(8.0),
                                    child: CircularProgressIndicator(
                                      color: CustomColors.clr_AAAAAA,
                                    ),
                                  )),
                            );
                          }
                          return InkWell(
                            onTap: () {},
                            child: Padding(
                              padding: const EdgeInsets.only(
                                left: 3,
                                right: 3,
                                top: 5,
                                bottom: 5,
                              ),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius:
                                  BorderRadius.circular(10),
                                  boxShadow: const [
                                    BoxShadow(
                                      spreadRadius: 0.2,
                                      blurRadius: 2,
                                      color: CustomColors.clr_AAAAAA,
                                    ),
                                  ],
                                ),
                                padding: const EdgeInsets.all(
                                  10,
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment:
                                            MainAxisAlignment.end,
                                            children: [
                                              Text(
                                                  vm
                                                      .transactionList[
                                                  index]
                                                      .createdAt ??
                                                      '',
                                                  style: Theme.of(
                                                      context)
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                    color: CustomColors
                                                        .clr_AAAAAA,
                                                    fontSize: 10,
                                                  ))
                                            ],
                                          ),
                                          const SizedBox(
                                            height:
                                            Dimensions.padding_5,
                                          ),
                                          Text(
                                            "${vm.translation.txt_purpose} : ${vm.transactionList[index].purpose ?? ''}",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 15,
                                            ),
                                          ),
                                          const SizedBox(
                                            height:
                                            Dimensions.padding_15,
                                          ),
                                          Text(
                                            "${vm.translation.txt_amount} : ${vm.transactionList[index].currencySymbol ?? ''} ${vm.transactionList[index].amount ?? '0'}",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                              color: Colors.black,
                                              fontSize: 15,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    )
                        : Padding(
                      padding: const EdgeInsets.only(top: 80),
                      child: SizedBox(
                        height:
                        MediaQuery.of(context).size.height / 2,
                        child: Center(
                            child: Text(vm.isLoading.value == false
                                ? vm.translation.txt_no_data_found
                                : '')),
                      ),
                    ),
                  ],
                ),
              );
            }),
          )),
    );
  }
}