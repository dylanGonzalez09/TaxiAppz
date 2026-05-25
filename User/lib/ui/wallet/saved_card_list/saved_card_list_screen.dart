import 'package:flutter/material.dart';
import 'package:user/ui/wallet/saved_card_list/save_card_list_vm.dart';
import '../../../components/custom_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';

class SavedCardListScreen extends StatelessWidget {
  SavedCardListScreen({
    super.key,
  });

  final vm = SavedCardListVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  List<String> savedCardList = ["Master Card", "Visa", "Rupay"];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScaffold(
        body: Padding(
          padding: const EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
            bottom: Dimensions.padding_20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderView(
                title: vm.translation.txt_card,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  InkWell(
                    onTap: () async {
                      vm.showAddCard();
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(right: 5),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(5),
                          boxShadow: const [
                            BoxShadow(
                              spreadRadius: 0.1,
                              blurRadius: 1,
                              color: CustomColors.clr_AAAAAA,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Row(
                            children: [
                              const Icon(
                                Icons.add,
                                color: Colors.black,
                                size: 10,
                              ),
                              const SizedBox(
                                width: 2,
                              ),
                              Text(
                                vm.translation.txt_add,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 14,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: Dimensions.padding_10,
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: savedCardList.length,
                  itemBuilder: (BuildContext context, int index) {
                    return InkWell(
                      onTap: () {},
                      child: Padding(
                        padding: const EdgeInsets.only(
                          left: 3,
                          right: 3,
                          top: 5,
                          bottom: 10,
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: const [
                              BoxShadow(
                                spreadRadius: 0.4,
                                blurRadius: 4,
                                color: CustomColors.clr_AAAAAA,
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(
                            10,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      savedCardList[index],
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: Colors.black,
                                            fontSize: 15,
                                          ),
                                    ),
                                    const SizedBox(
                                      height: Dimensions.padding_5,
                                    ),
                                    Text(
                                      'XXXX XXXX XXXX 3545',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: CustomColors.clr_303030,
                                            fontSize: 15,
                                          ),
                                    ),
                                    const SizedBox(
                                      height: Dimensions.padding_5,
                                    ),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            'Senthil kumar',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                  color:
                                                      CustomColors.clr_303030,
                                                  fontSize: 15,
                                                ),
                                          ),
                                        ),
                                        InkWell(
                                          onTap: () async {
                                            vm.showConfirmation();
                                          },
                                          child: const Icon(
                                            Icons.delete,
                                            color: CustomColors.clr_303030,
                                            size: 15,
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
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        scaffoldKey: scaffoldKey,
      ),
    );
  }
}
