import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/profile/profile_screen_vm.dart';

import '../../components/common_text_field.dart';
import '../../components/custom_alert_dialog.dart';
import '../../components/custom_scaffold.dart';
import '../../main.dart';
import '../../network/response_models/favouriteModel.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import '../bottomsheets/confirmation_bs/confirmation_bs.dart';
import '../map_view/map_view_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<StatefulWidget> createState() => ProfileScreenState();
}

class ProfileScreenState extends State<ProfileScreen> {
  late ProfileScreenVm vm;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isLoading = false;

  @override
  void initState() {
    vm = ProfileScreenVm();
    vm.userName.addListener(() {
      setState(() {
        vm.isUserNameFocus = vm.userName.text.isNotEmpty;
      });
    });
    vm.email.addListener(() {
      setState(() {
        vm.isEmailFocus = vm.email.text.isNotEmpty;
      });
    });
    try {
      if (Platform.isAndroid || Platform.isIOS) {
        vm.KisWeb = false;
      } else {
        vm.KisWeb = true;
      }
    } catch (e) {
      vm.KisWeb = true;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getFavouriteList();
      vm.getUserProfileDetails();
    });
    super.initState();
  }

  @override
  void dispose() {
    //vm.referral.dispose();
    super.dispose();
  }

  String deleteFavoriteType = "";

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context).size;
    return ChangeNotifierProvider<ProfileScreenVm>(
      create: (_) => vm,
      child: Consumer<ProfileScreenVm>(
        builder: (context, vm, child) => CustomScaffold(
          scaffoldKey: scaffoldKey,
          body: Padding(
            padding: const EdgeInsets.all(Dimensions.padding_20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.only(bottom: Dimensions.padding_20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          vm.pop();
                        },
                        child: SvgPicture.asset(CustomImages.backArrowIcon),
                      ),
                      Text(
                        vm.translation.txt_myProfile.toUpperCase(),
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox()
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(
                          height: Dimensions.padding_20,
                        ),
                        Align(
                          alignment: Alignment.center,
                          child: InkWell(
                            onTap: () async {
                              await vm.pickImage();
                            },
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                (vm.isImageCaptured && vm.profileImg != null
                                    ? (vm.KisWeb)
                                        ? ClipRRect(
                                            borderRadius: BorderRadius.circular(
                                                Dimensions.padding_10),
                                            child: Image.network(
                                              vm.profileImg!.path,
                                              fit: BoxFit.fill,
                                            ),
                                          )
                                        : ClipRRect(
                                            borderRadius: BorderRadius.circular(
                                                Dimensions.padding_10),
                                            child: Image.file(
                                              vm.profileImg!,
                                              fit: BoxFit.fill,
                                            ),
                                          )
                                    : Container(
                                        width: Dimensions.padding_80,
                                        height: Dimensions.padding_80,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                              color: Colors.grey, width: 0.5),
                                          color: CustomColors.clr_000000,
                                          borderRadius: BorderRadius.circular(
                                              Dimensions.padding_10),
                                        ),
                                        child: vm.profileImg != null
                                            ? ClipRRect(
                                                borderRadius:
                                                    BorderRadius.circular(
                                                        Dimensions.padding_10),
                                                child: Image.file(
                                                  vm.profileImg!,
                                                  fit: BoxFit.fill,
                                                ),
                                              )
                                            : (vm.profileImageUrl != null
                                                ? ClipRRect(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            Dimensions
                                                                .padding_10),
                                                    child: CachedNetworkImage(
                                                      imageUrl:
                                                          vm.profileImageUrl!,
                                                      placeholder:
                                                          (context, url) =>
                                                              const Padding(
                                                        padding:
                                                            EdgeInsets.all(20),
                                                        child:
                                                            CircularProgressIndicator(
                                                          color: CustomColors
                                                              .primaryColor,
                                                          strokeWidth: 3,
                                                        ),
                                                      ),
                                                      errorWidget: (context,
                                                              url, error) =>
                                                          const Icon(
                                                              Icons.error),
                                                      fit: BoxFit.fill,
                                                    ),
                                                  )
                                                : ClipRRect(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            Dimensions
                                                                .padding_10),
                                                    child: SvgPicture.asset(
                                                      CustomImages.dummyProfile,
                                                      fit: BoxFit.fill,
                                                    ),
                                                  )),
                                      )),
                                Positioned(
                                  right: -8,
                                  bottom: -8,
                                  child: Container(
                                    height: mediaQuery.height * 0.03,
                                    width: mediaQuery.height * 0.03,
                                    decoration: const BoxDecoration(
                                      color: CustomColors.svgImageColorDarkBlue,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: _isLoading
                                          ? const SizedBox(
                                              height: 20,
                                              width: 20,
                                              child: CircularProgressIndicator(
                                                color:
                                                    CustomColors.primaryColor,
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : const Icon(
                                              Icons.add_rounded,
                                              color:
                                                  CustomColors.buttonTxtColor,
                                              size: 20,
                                            ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: Dimensions.padding_40,
                        ),
                        CommonTextField(
                          controller: vm.userName,
                          hint: vm.translation.txt_name,
                        ),
                        const SizedBox(height: Dimensions.padding_25),
                        CommonTextField(
                          controller: vm.email,
                          hint: vm.translation.txt_Email_optional,
                        ),
                        const SizedBox(height: Dimensions.padding_25),
                        CommonTextField(
                          controller: vm.phoneNumber,
                          hint: vm.translation.txt_phone_number,
                          readOnly: true,
                        ),
                        const SizedBox(
                          height: Dimensions.padding_25,
                        ),
                        CommonTextField(
                          controller: vm.joinedDate,
                          hint: vm.translation.txt_joined_date,
                          readOnly: true,
                          showBottomLine: false,
                        ),
                        const SizedBox(
                          height: Dimensions.padding_25,
                        ),
                        Center(
                          child: GestureDetector(
                            onTap: vm.isProfileChanged
                                ? () {
                                    vm.updateProfile();
                                  }
                                : null,
                            child: Container(
                              width: MediaQuery.sizeOf(context).width * 0.75,
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(
                                  vertical: Dimensions.padding_12,
                                  horizontal: Dimensions.padding_5),
                              decoration: BoxDecoration(
                                color: vm.isProfileChanged
                                    ? CustomColors.primaryColor
                                    : CustomColors
                                        .clr_E2E2E2, // Change color based on isProfileChanged
                                borderRadius: BorderRadius.circular(26),
                              ),
                              child: Text(
                                vm.translation.txt_save,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      color: vm.isProfileChanged
                                          ? CustomColors.buttonTxtColor
                                          : CustomColors.clr_ADADAD,
                                    ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(
                          height: Dimensions.padding_20,
                        ),
                        Text(
                          vm.translation.txt_myFavorites,
                          style: Theme.of(context)
                              .textTheme
                              .titleSmall
                              ?.copyWith(fontSize: 16),
                        ),
                        const SizedBox(
                          height: Dimensions.padding_5,
                        ),
                        _favoritesLocationList(vm.favouriteListModelDetails),
                        const SizedBox(
                          height: Dimensions.padding_20,
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 3.0),
                          child: _addFavoriteCategory(),
                        ),
                        const SizedBox(
                          height: Dimensions.padding_10,
                        ),
                        const SizedBox(
                          height: 20,
                        ),
                        InkWell(
                          onTap: () async {
                            if (vm.isLoading.value == false) {
                              final response = await showModalBottomSheet(
                                  context: navigatorKey.currentState!.context,
                                  backgroundColor: Colors.white,
                                  isDismissible: true,
                                  isScrollControlled: true,
                                  enableDrag: false,
                                  shape: const RoundedRectangleBorder(
                                      borderRadius: BorderRadius.only(
                                          topLeft: Radius.circular(20),
                                          topRight: Radius.circular(20))),
                                  builder: (_) {
                                    return ConfirmationBs(
                                      title: vm.translation.txt_delete_account,
                                      subTitle: vm.translation
                                          .txt_are_you_sure_to_delete,
                                      primaryBtnTitle:
                                          vm.translation.txt_delete,
                                      secondaryBtnTitle:
                                          vm.translation.txt_cancel,
                                    );
                                  });
                              if (response == true) {
                                vm.deleteAccount();
                              }
                            }
                          },
                          child: Container(
                              width: MediaQuery.sizeOf(context).width * 0.50,
                              padding: const EdgeInsets.symmetric(
                                  vertical: Dimensions.padding_12,
                                  horizontal: Dimensions.padding_5),
                              decoration: BoxDecoration(
                                color: CustomColors
                                    .primaryColor, // Change color based on isProfileChanged
                                borderRadius: BorderRadius.circular(26),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SvgPicture.asset(CustomImages.deleteIcon,
                                      width: 15,
                                      height: 15,
                                      colorFilter: const ColorFilter.mode(
                                        Colors.white,
                                        BlendMode.srcIn,
                                      )),
                                  const SizedBox(
                                    width: 10,
                                  ),
                                  Text(
                                    vm.translation.txt_delete_account,
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelSmall!
                                        .copyWith(
                                            color: CustomColors.buttonTxtColor,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold),
                                  ),
                                ],
                              )),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _favoritesLocationList(FavouriteListModel favoriteList) =>
      ListView.builder(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        itemCount: favoriteList.favouriteList?.length ?? 0,
        itemBuilder: (c, i) {
          final item = favoriteList.favouriteList![i];
          return Container(
            padding: const EdgeInsets.all(Dimensions.padding_8),
            margin: const EdgeInsets.only(top: Dimensions.padding_10),
            decoration: BoxDecoration(
              border: Border.all(
                  color: CustomColors.textPlaceholderClr,
                  width: Dimensions.padding_1),
              borderRadius: BorderRadius.circular(Dimensions.padding_10),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SvgPicture.asset((item.type == "HOME")
                          ? CustomImages.icFavoriteListHome
                          : (item.type == "WORK")
                              ? CustomImages.icFavoriteListWork
                              : CustomImages.icFavoriteListOthers),
                      const SizedBox(
                        width: Dimensions.padding_10,
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.type ?? "OTHERS",
                              style: Theme.of(context)
                                  .textTheme
                                  .labelSmall!
                                  .copyWith(fontSize: 14),
                            ),
                            Text(
                              item.address ?? "",
                              style: Theme.of(context)
                                  .textTheme
                                  .labelSmall!
                                  .copyWith(fontSize: 14),
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                InkWell(
                  onTap: () {
                    deleteFavoriteType = item.type ?? "OTHERS";
                    CustomAlertDialog.showCustomDialog(context,
                        "${vm.translation.txt_delete_favorite} $deleteFavoriteType ${vm.translation.txt_location}",
                        () {
                      vm.deleteFavouriteLocation(item.id!);
                    },
                        () {},
                        Theme.of(context).textTheme.labelSmall!.copyWith(
                              fontSize: 16,
                            ));
                  },
                  child: Container(
                    margin: const EdgeInsets.only(
                        left: Dimensions.padding_5,
                        right: Dimensions.padding_5),
                    child: SvgPicture.asset(CustomImages.icFavoriteDelete),
                  ),
                ),
              ],
            ),
          );
        },
      );

  Widget _addFavoriteCategory() => Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (!vm.isHomeAdded)
            SizedBox(
              width: 100,
              child: InkWell(
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MapViewScreen(
                          map: {'type': 'HOME', 'isPickChange': 'isPick'}),
                    ),
                  );

                  await vm.createFavouriteLocation(
                    result['latLng'].latitude,
                    result['latLng'].longitude,
                    result['address'],
                    'HOME', // Pass the type as 'HOME'
                  );
                  await vm.getFavouriteList(); // Refresh the favorite list
                },
                child: Container(
                  padding: const EdgeInsets.all(Dimensions.padding_8),
                  decoration: BoxDecoration(
                    border: Border.all(
                        color: CustomColors.primaryColor, strokeAlign: 1),
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      SvgPicture.asset(CustomImages.icFavoriteHome),
                      Text(
                        vm.translation.txt_addHome,
                        style: Theme.of(context).textTheme.labelSmall!.copyWith(
                            color: CustomColors.svgImageColorDarkBlue,
                            fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (!vm.isHomeAdded) const SizedBox(width: Dimensions.padding_5),
          if (!vm.isWorkAdded)
            SizedBox(
              width: 100,
              child: InkWell(
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MapViewScreen(
                          map: {'type': 'WORK', 'isPickChange': 'isPick'}),
                    ),
                  );
                  await vm.createFavouriteLocation(
                    result['latLng'].latitude,
                    result['latLng'].longitude,
                    result['address'],
                    'WORK', // Pass the type as 'WORK'
                  );
                  await vm.getFavouriteList(); // Refresh the favorite list
                },
                child: Container(
                  padding: const EdgeInsets.all(Dimensions.padding_8),
                  decoration: BoxDecoration(
                    border: Border.all(
                        color: CustomColors.primaryColor, strokeAlign: 1),
                    borderRadius: BorderRadius.circular(Dimensions.padding_5),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      SvgPicture.asset(CustomImages.icFavoriteAddWork),
                      Text(
                        vm.translation.txt_addWork,
                        style: Theme.of(context).textTheme.labelSmall!.copyWith(
                            color: CustomColors.svgImageColorDarkBlue,
                            fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (!vm.isWorkAdded) const SizedBox(width: Dimensions.padding_5),
          SizedBox(
            width: 100,
            child: InkWell(
              onTap: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MapViewScreen(
                        map: {'type': 'OTHERS', 'isPickChange': 'isPick'}),
                  ),
                );

                await vm.createFavouriteLocation(
                  result['latLng'].latitude,
                  result['latLng'].longitude,
                  result['address'],
                  'OTHERS', // Pass the type as 'OTHERS'
                );
                await vm.getFavouriteList(); // Refresh the favorite list
              },
              child: Container(
                padding: const EdgeInsets.all(Dimensions.padding_8),
                decoration: BoxDecoration(
                  border: Border.all(
                      color: CustomColors.primaryColor, strokeAlign: 1),
                  borderRadius: BorderRadius.circular(Dimensions.padding_5),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    SvgPicture.asset(CustomImages.icFavoriteOthers),
                    Text(
                      vm.translation.txt_addOthers,
                      style: Theme.of(context).textTheme.labelSmall!.copyWith(
                          color: CustomColors.svgImageColorDarkBlue,
                          fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );

  void moveToCamera() async {
    final result = await GoRouter.of(navigatorKey.currentState!.context)
        .pushNamed(CustomRouter.cameraAppPreview);
    print("profile--------------$result");
    if (result != null && result is File) {
      vm.profileImg = result;
      vm.isImageCaptured = true;
      setState(() {});
    }
  }

  Future<void> getImageFromGallery() async {
    try {
      final XFile? img =
          await vm.imagePicker.pickImage(source: ImageSource.gallery);

      if (img != null) {
        vm.profileImg = File(img.path);
        vm.isImageCaptured = true;
        setState(() {});
      }
    } catch (e) {
      print("Error----------e--------------------$e");
      CustomAlertDialog.showErrorMessage(context, () {}, "${e}");
    }
  }

  void onImageSelected(File file) {
    setState(() {
      vm.profileImg = file;
      GoRouter.of(context).pop();
    });
  }

  void onGalleryImageSelected(File file) {
    setState(() {
      vm.profileImg = file;
      GoRouter.of(context).pop();
    });
  }
}
