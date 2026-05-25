import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/support/sos/sos_vm.dart';

import 'package:url_launcher/url_launcher.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});

  @override
  _SosScreenState createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  final vm = SosVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getSOSList();
    });
  }

  Future<void> launchCall({required String phoneNumber}) async {
    try {
      final Uri urlParsed = Uri.parse('tel:$phoneNumber');

      if (await canLaunchUrl(urlParsed)) {
        await launchUrl(urlParsed, mode: LaunchMode.externalApplication);
      } else {
        debugPrint('Cannot launch URL: $urlParsed');
      }
    } catch (e) {
      debugPrint('Error launching call: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        scaffoldKey: scaffoldKey,
        body: ChangeNotifierProvider<SosVm>(
          create: (context) => vm,
          child: Consumer<SosVm>(
            builder: (_, vm, child) {
              return Padding(
                padding: const EdgeInsets.only(
                    left: Dimensions.padding_20, right: Dimensions.padding_20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    HeaderView(
                      title: vm.translation.txt_sos,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                vm.translation.txt_sos,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 24,
                                    ),
                              ),
                              const SizedBox(height: Dimensions.padding_5),
                              Text(
                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dictum sapien ac accumsan ullamcorper.',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: CustomColors.clr_AAAAAA,
                                      fontSize: 12,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Dimensions.padding_15),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        InkWell(
                          onTap: () async {
                            vm.showAddSOS();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              border: Border.all(
                                  color: CustomColors.primaryColor,
                                  strokeAlign: 1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Center(
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.add,
                                    color: CustomColors.svgImageColorDarkBlue,
                                    size: 15,
                                  ),
                                  Text(
                                    vm.translation.txt_add,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleSmall
                                        ?.copyWith(
                                          color: CustomColors
                                              .svgImageColorDarkBlue,
                                          fontSize: 14,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: vm.sosList?.length ?? 0,
                        itemBuilder: (BuildContext context, int index) {
                          return InkWell(
                            onTap: () {},
                            child: Column(
                              children: [
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: Dimensions.padding_10,
                                      horizontal: 0),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              "${vm.sosList?[index].title}",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodySmall
                                                  ?.copyWith(
                                                    color: Colors.black,
                                                    fontSize: 15,
                                                  ),
                                            ),
                                            const SizedBox(
                                                height: Dimensions.padding_5),
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              children: [
                                                Text(
                                                  "${vm.sosList?[index].dialCode}${vm.sosList?[index].phoneNumber}",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        color: Colors.black,
                                                        fontSize: 15,
                                                      ),
                                                ),
                                                const SizedBox(
                                                    width:
                                                        Dimensions.padding_5),
                                                if (vm.sosList?[index]
                                                        .isAdminAdded ==
                                                    false) ...[
                                                  const SizedBox(
                                                      width:
                                                          Dimensions.padding_5),
                                                  InkWell(
                                                    onTap: () async {
                                                      vm.showConfirmation(
                                                          "${vm.sosList?[index].id}");
                                                    },
                                                    child: const Icon(
                                                      Icons.delete,
                                                      color: CustomColors
                                                          .clr_303030,
                                                      size: 15,
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () async {
                                          final sos = vm.sosList?[index];
                                          if (sos == null) return;
                                          final phoneNumber =
                                              "${sos.dialCode ?? ""}${sos.phoneNumber ?? ""}";
                                          if (phoneNumber.isNotEmpty) {
                                            await vm.makePhoneCall(phoneNumber);
                                          }
                                        },
                                        child: SvgPicture.asset(
                                          CustomImages.call,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ));
  }
}
