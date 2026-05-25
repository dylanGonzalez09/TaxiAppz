import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shimmer/shimmer.dart';
import '../../components/common_promo_ui.dart';
import '../../components/custom_scaffold.dart';
import '../../components/custom_text_field.dart';
import '../../components/header_view.dart';
import '../../network/response_models/types_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';
import 'apply_promo_vm.dart';

class ApplyPromoScreen extends StatefulWidget {
  final String vehicleTypeId;
  const ApplyPromoScreen({super.key,required this.vehicleTypeId });

  @override
  State<ApplyPromoScreen> createState() => _ApplyPromoScreenState();
}

class _ApplyPromoScreenState extends State<ApplyPromoScreen> {
  final vm = ApplyPromoVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  late Future<void> promoListFuture;

  @override
  void initState() {
    super.initState();
      if (widget.vehicleTypeId.isNotEmpty) {
        promoListFuture = vm.getPromoList(widget.vehicleTypeId);
      }
      vm.promoController.addListener(() {
        setState(() {
          vm.showNameTextField = vm.promoController.text.length > 1;
        });
      });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScaffold(
        body: Padding(
          padding: const EdgeInsets.only(left: 20, right: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderView(
                title: vm.translation.txt_Apply_promo,
              ),
              const SizedBox(height: 43),
              Visibility(
                visible: vm.showNameTextField,
                child: Text(
                  vm.translation.txt_enter_promo,
                  style: const TextStyle(
                      fontSize: 15, color: CustomColors.textPlaceholderClr),
                ),
              ),
              Container(
                decoration: const BoxDecoration(color: Colors.transparent),
                child: CustomTextField(
                  label: vm.translation.txt_enter_promo,
                  controller: vm.promoController,
                  maxLines: 1,
                  maxLength: 150,
                  clear: true,
                  hideBorder: true,
                  imageUrl: "",
                  contentPadding: const EdgeInsets.only(bottom: 5),
                  inputType: TextInputType.name,
                  style: const TextStyle(
                    fontSize: 15,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(".*")),
                  ],
                ),
              ),
              const Divider(
                thickness: 1,
                color: CustomColors.textPlaceholderClr,
              ),
              const SizedBox(height: 20),
              Text(
                vm.translation.txt_available_promo,
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.black,
                  fontFamily: AppConstants.latoFont,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: FutureBuilder(
                  future: promoListFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 20),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: CustomColors.clr_fafafa,
                                borderRadius: BorderRadius.circular(15),
                                //border: Border.all(color: )
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Shimmer.fromColors(
                                    baseColor: Colors.grey[300]!,
                                    highlightColor: Colors.grey[100]!,
                                    child: Container(
                                      width: 200,
                                      height: 15,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Shimmer.fromColors(
                                    baseColor: Colors.grey[300]!,
                                    highlightColor: Colors.grey[100]!,
                                    child: Container(
                                      width: 150,
                                      height: 15,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Shimmer.fromColors(
                                        baseColor: Colors.grey[300]!,
                                        highlightColor: Colors.grey[100]!,
                                        child: Container(
                                          width: 100,
                                          height: 15,
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(15),
                                          ),
                                        ),
                                      ),
                                     Spacer(),
                                      Shimmer.fromColors(
                                        baseColor: Colors.grey[300]!,
                                        highlightColor: Colors.grey[100]!,
                                        child: Container(
                                          width: 85,
                                          height: 25,
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(15),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    } else if (snapshot.hasError) {
                      return Center(child: Text('Error: ${snapshot.error}'));
                    } else {
                      return ListView.builder(
                        itemCount: vm.promoList.length,
                        itemBuilder: (context, index) {
                          final promo = vm.promoList[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 20),
                            child: DottedCurveRectangle(
                              width: double.infinity,
                              color: CustomColors.primaryColor,
                              strokeWidth: 1,
                              gapLength: 6,
                              dotLength: 4,
                              borderRadius: 15,
                              curveRadius: 0.5,
                              promo: promo,
                            ),
                          );
                        },
                      );
                    }
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
