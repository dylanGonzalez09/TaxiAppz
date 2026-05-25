import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:photo_manager/photo_manager.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/register/register_vm.dart';
import '../../components/camera_view.dart';
import '../../components/common_text_field.dart';
import '../../components/gallery_image_view.dart';
import '../../ui/bottomsheets/image_selector/image_selector_bs.dart';
import '../../ui/register/register_vm.dart';
import '../../utils/custom_colors.dart';

import '../../components/proceed_button.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class RegisterScreen extends StatefulWidget {
  final Map<String, dynamic> args;

  const RegisterScreen({super.key, required this.args});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final vm = RegisterVm();
  bool _isLoading = false;

  @override
  void initState() {
    vm.setArgs(widget.args);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context).size;
    return SafeArea(
      child: Scaffold(
        body: ChangeNotifierProvider<RegisterVm>(
          create: (context) => vm,
          child: Consumer<RegisterVm>(
            builder: (key, vm, child) {
              return Padding(
                padding: const EdgeInsets.all(Dimensions.padding_16),
                child: Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Center(
                              child: Text(
                                vm.translation.txt_Add_personal_info
                                    .toUpperCase(),
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(fontSize: 20),
                              ),
                            ),
                            SizedBox(height: mediaQuery.height * 0.05),
                            SizedBox(
                              height: mediaQuery.height * 0.11,
                              width: mediaQuery.height * 0.11,
                              child: InkWell(
                                onTap: () async {
                                  setState(() => _isLoading = true);
                                  final picker = ImagePicker();
                                  final XFile? galleryImage =
                                      await picker.pickImage(
                                    source: ImageSource.gallery,
                                    requestFullMetadata: false,
                                  );
                                  if (galleryImage != null) {
                                    onGalleryImageSelected(
                                        File(galleryImage.path));
                                  }
                                  setState(() => _isLoading = false);
                                },
                                child: Stack(
                                  fit: StackFit.expand,
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      padding: vm.profileImage != null
                                          ? null
                                          : const EdgeInsets.all(
                                              Dimensions.padding_10,
                                            ),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(
                                            Dimensions.padding_10),
                                        color: CustomColors.clr_E6ECFF,
                                      ),
                                      child: vm.profileImage == null
                                          ? SvgPicture.asset(
                                              CustomImages.dummyProfile,
                                            )
                                          : ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      Dimensions.padding_10),
                                              child: Image.file(
                                                vm.profileImage!,
                                                fit: BoxFit.fill,
                                              ),
                                            ),
                                    ),
                                    Positioned(
                                      right: -8,
                                      bottom: -8,
                                      child: Container(
                                        height: mediaQuery.height * 0.03,
                                        width: mediaQuery.height * 0.03,
                                        decoration: const BoxDecoration(
                                          color: CustomColors.clr_303030,
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: _isLoading
                                              ? const SizedBox(
                                                  height: 15,
                                                  width: 15,
                                                  child:
                                                      CircularProgressIndicator(
                                                    color: CustomColors
                                                        .primaryColor,
                                                    strokeWidth: 2,
                                                  ),
                                                )
                                              : const Icon(
                                                  Icons.add_rounded,
                                                  color: CustomColors
                                                      .buttonTxtColor,
                                                  size: 18,
                                                ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: Dimensions.padding_40),
                            // Name / Email / Referral Fields
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                CommonTextField(
                                  controller: vm.nameController,
                                  errorTxt: vm.nameError,
                                  hint: vm.translation.txt_name,
                                  keyboardType: TextInputType.text,
                                  caps: true,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.allow(
                                      RegExp(r'[a-zA-Z\s]'),
                                    ),
                                    LengthLimitingTextInputFormatter(50),
                                  ],
                                ),
                                const SizedBox(height: Dimensions.padding_14),
                                CommonTextField(
                                    controller: vm.emailController,
                                    hint: vm.translation.txt_Email_optional,
                                    errorTxt: vm.emailError,
                                    keyboardType: TextInputType.emailAddress,
                                    caps: false),
                                const SizedBox(height: Dimensions.padding_14),
                                CommonTextField(
                                  controller: vm.referralController,
                                  errorTxt: vm.referralError,
                                  hint: vm.translation.txt_Referral_optional,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    Align(
                      alignment: Alignment.bottomCenter,
                      child: Center(
                        child: Obx(
                          () => ProceedButton(
                            btnTxt: vm.translation.txt_Sign_up,
                            onPressed: () {
                              FocusScope.of(context).unfocus();
                              vm.checkAndSubmit();
                            },
                            isLoading: vm.isLoading.value,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  void onImageSelected(File file) {
    setState(() {
      vm.profileImage = file;
    });
  }

  void onGalleryImageSelected(File file) {
    setState(() {
      vm.profileImage = file;
    });
  }
}
