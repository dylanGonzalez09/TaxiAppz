import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/ui/wallet/transaction_list/transaction_list_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_images.dart';

import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../network/response_models/custom_name_model.dart';
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
  final ScrollController scrollController = ScrollController();
  bool isLoading = false; // To track loading state of last item

  List<CustomNameModel> sortOrderList = [
    CustomNameModel(name: "Earned", id: "1"),
    CustomNameModel(name: "Debited", id: "2"),
    CustomNameModel(name: "spent", id: "3"),
    CustomNameModel(name: AppConstants.all, id: "4"),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getWalletTransactionList(1, widget.args);
      scrollController.addListener(_loadMoreData);
    });
  }

  void _loadMoreData() {
    if (scrollController.position.pixels ==
        scrollController.position.maxScrollExtent) {
      if (vm.walletTransactionModel!.page! <
              vm.walletTransactionModel!.totalPages! &&
          vm.walletTransactionModel?.totalResults !=
              vm.transactionList.length) {
        setState(() {
          isLoading = true;
          vm.currentPage++;
        });

        vm.getWalletTransactionList(vm.currentPage, widget.args).then((_) {
          setState(() {
            isLoading = false;
          });
        }).catchError((e) {
          setState(() {
            isLoading = false;
          });
        });
      }
    }
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
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
                      title: vm.translation.txtTransactionHistory,
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
                                  title: vm.translation.txtSortOrder,
                                  customModel: sortOrderList,
                                );
                              },
                            );

                            if (result != null && result is CustomNameModel) {
                              vm.selectedSort = result;
                              vm.initializeData(isClearData: true);
                            }
                          },
                          child: const Center(
                            child: Row(
                              children: [
                                Icon(
                                  Icons.sort,
                                  color: Colors.black,
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
                    Expanded(
                      child: vm.transactionList.isNotEmpty
                          ? ListView.builder(
                              controller: scrollController,
                              itemCount: vm.transactionList.length +
                                  (isLoading ? 1 : 0), // Add 1 if loading
                              itemBuilder: (BuildContext context, int index) {
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
                                        borderRadius: BorderRadius.circular(10),
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
                                                                    .createdAt
                                                                    ?.isNotEmpty ==
                                                                true
                                                            ? vm
                                                                    .transactionList[
                                                                        index]
                                                                    .createdAt ??
                                                                ''
                                                            : "",
                                                        style: Theme.of(context)
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
                                                  height: Dimensions.padding_5,
                                                ),
                                                Text(
                                                  "${vm.translation.txt_purpose}: ${vm.transactionList[index].purpose ?? ''}",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        color: Colors.black,
                                                        fontSize: 15,
                                                      ),
                                                ),
                                                const SizedBox(
                                                  height: Dimensions.padding_15,
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
                            )
                          : Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SvgPicture.asset(
                                    CustomImages.notificationNotFound,
                                  ),
                                  Text(vm.translation.txtNoRecordsFound)
                                ],
                              ),
                            ),
                    )
                  ],
                ),
              );
            }),
          )),
    );
  }
}
