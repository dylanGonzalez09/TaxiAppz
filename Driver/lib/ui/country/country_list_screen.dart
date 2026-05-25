import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/country/coutry_list_vm.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class CountryListScreen extends StatefulWidget {
  const CountryListScreen({super.key});

  @override
  State<CountryListScreen> createState() => _CountryListScreenState();
}

class _CountryListScreenState extends State<CountryListScreen> {
  final vm = getIt<CountryListVm>();

  @override
  void initState() {
    vm.setUpCountry();
    vm.addSearchListener();
    super.initState();
  }

  @override
  void dispose() {
    vm.searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(Dimensions.padding_20),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(Dimensions.padding_10),
                  border: Border.all(color: CustomColors.clr_E2E2E2)),
              padding: const EdgeInsets.symmetric(
                  vertical: Dimensions.padding_5,
                  horizontal: Dimensions.padding_5),
              child: Row(
                children: [
                  const Icon(Icons.search_rounded),
                  const SizedBox(width: Dimensions.padding_15),
                  Expanded(
                      child: TextField(
                        controller: vm.searchController,
                    style: Theme.of(context).textTheme.bodySmall,
                    decoration: InputDecoration(
                        isDense: true,
                        hintText: vm.translation.txt_Search_for_country,
                        hintStyle: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(
                                fontSize: 16, color: CustomColors.clr_AAAAAA),
                        border: InputBorder.none),
                  ))
                ],
              ),
            ),
            const SizedBox(height: Dimensions.padding_10),
            Expanded(
                child: ChangeNotifierProvider<CountryListVm>(
              create: (context) => vm,
              child: Consumer<CountryListVm>(builder: (_, vm, child) {
                if (vm.countryList.isNotEmpty) {
                  return ListView.builder(
                      itemCount: vm.countryList.length,
                      itemBuilder: (context, index) {
                        return InkWell(
                          onTap: (){
                            GoRouter.of(context).pop(vm.countryList[index]);
                          },
                          child: Padding(
                            padding:
                                const EdgeInsets.only(top: Dimensions.padding_15),
                            child: Text(
                              "${vm.countryList[index].name ?? ""} (${vm.countryList[index].dialCode})",
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        );
                      });
                } else {
                  return Center(
                      child: Text(
                    vm.translation.txt_Country_not_found,
                    style: Theme.of(context)
                        .textTheme
                        .bodyLarge
                        ?.copyWith(fontSize: 16),
                  ));
                }
              }),
            ))
          ],
        ),
      ),
    ));
  }
}
