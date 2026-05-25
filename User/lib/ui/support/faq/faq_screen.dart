import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import 'faq_vm.dart';

class FaqScreen extends StatefulWidget {
  final Map<String, dynamic> data;
  const FaqScreen({super.key, required this.data});

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  final vm = FaqVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  late List<bool> isExpanded;

  @override
  void initState() {
    super.initState();
    isExpanded = [];
    vm.setArgs(widget.data);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getFaqList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
          scaffoldKey: scaffoldKey,
          body: ChangeNotifierProvider<FaqVm>(
            create: (context) => vm,
            child: Consumer<FaqVm>(builder: (_, vm, child) {
              if (vm.faqList == null || vm.faqList!.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }
              if (isExpanded.isEmpty) {
                isExpanded = List.filled(vm.faqList!.length, false);
              }
              return Padding(
                  padding: const EdgeInsets.only(
                    left: Dimensions.padding_20,
                    right: Dimensions.padding_20,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      HeaderView(
                        title: vm.translation.txtfaq,
                      ),
                      Expanded(
                        child: ListView.builder(
                          itemCount: vm.faqList?.length ?? 0,
                          itemBuilder: (BuildContext context, int index) {
                            return Padding(
                              padding: const EdgeInsets.only(
                                  bottom: Dimensions.padding_5),
                              child: InkWell(
                                onTap: () {
                                  setState(() {
                                    isExpanded[index] = !isExpanded[index];
                                  });
                                },
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: Dimensions.padding_10,
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              "${vm.faqList?[index].question}",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodySmall
                                                  ?.copyWith(
                                                    color: Colors.black,
                                                    fontSize: 15,
                                                  ),
                                            ),
                                          ),
                                          Icon(
                                            isExpanded[index]
                                                ? Icons.keyboard_arrow_up_sharp
                                                : Icons.keyboard_arrow_down_sharp,
                                            color: CustomColors.clr_AAAAAA,
                                            size: 25,
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (isExpanded[index])
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          "${vm.faqList?[index].answer}",
                                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                color: Colors.black,
                                                fontSize: 14,
                                              ),
                                          softWrap: true,
                                          overflow: TextOverflow.visible,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          },
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
