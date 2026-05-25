import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mqtt_client/mqtt_client.dart';
import '../../network/response_models/user_model.dart';
import '../../utils/base_vm.dart';

import '../../network/response_models/base_response.dart';
import '../../network/response_models/favouriteModel.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/custom_router.dart';
import '../../utils/preference_helper.dart';

class ProfileScreenVm extends BaseVm {
  TextEditingController userName = TextEditingController();
  TextEditingController email = TextEditingController();
  TextEditingController phoneNumber = TextEditingController();
  TextEditingController joinedDate = TextEditingController();

  bool isUserNameFocus = false,
      isEmailFocus = false,
      isReferralFocus = false,
      isImageCaptured = false,
      KisWeb = false,
      isProfileChanged = false;

  File? profileImg;
  final ImagePicker imagePicker = ImagePicker();
  UserModel? userDetail;
  String? profileImageUrl;
  FavouriteListModel favouriteListModelDetails = FavouriteListModel();

  bool isHomeAdded = false;
  bool isWorkAdded = false;

  ProfileScreenVm() {
    userName.addListener(() {
      if (userName.text != (userDetail?.firstName ?? "")) {
        isProfileChanged = true;
      } else {
        isProfileChanged = false;
      }
      notifyListeners();
    });
    email.addListener(() {
      if (email.text != (userDetail?.eMail ?? "")) {
        isProfileChanged = true;
      } else {
        isProfileChanged = false;
      }
      notifyListeners();
    });
  }

  Future<void> getUserProfileDetails() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getUserProfileDetails);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      userDetail = parseData(r.data, UserModel.fromJson);
      if (userDetail != null) {
        userName.text = userDetail?.firstName ?? "";
        email.text = userDetail?.eMail ?? "";
        phoneNumber.text =
            "${userDetail?.countryCode ?? ""} ${userDetail?.phoneNumber ?? ""}";
        joinedDate.text = "${userDetail?.regDate} ${userDetail?.regTime}";
        AppConstants.userFirstName = userDetail?.firstName ?? "user";
        final imageUrl = userDetail!.profileImage;
        if (imageUrl != null &&
            !imageUrl.startsWith(AppConstants.imageBaseUrl)) {
          AppConstants.userProfileImage =
              "${AppConstants.imageBaseUrl}$imageUrl";
        } else {
          AppConstants.userProfileImage = imageUrl ?? "";
        }
        if (imageUrl != null && imageUrl.isNotEmpty) {
          profileImageUrl = AppConstants.userProfileImage;
        } else {
          profileImageUrl = null;
        }
        notifyListeners();
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> updateProfile() async {
    if (!isLoading.value) {
      showLoader();
      isLoading.value = true;

      try {
        final formData = FormData.fromMap({
          AppConstants.name: userName.text,
          AppConstants.email: email.text,
        });

        if (profileImg != null) {
          formData.files.add(MapEntry(
            "profilePic",
            await MultipartFile.fromFile(profileImg!.path),
          ));
        }
        final response =
            await apiHelper.put(AppUrls.updateUserProfile, params: formData);

        response.fold(
          (error) {
            showErrorDialog(errorModel: error);
          },
          (result) {
            getUserProfileDetails();
            showSuccessDialog(
              message: "User profile Updated Successfully",
            );
            isProfileChanged = false;
          },
        );
      } catch (e) {
        debugPrint("Exception: $e");
        showErrorDialog();
      } finally {
        isLoading.value = false;
        hideLoader();
      }
    }
  }

  Future<void> getFavouriteList() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getFavouriteList);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      favouriteListModelDetails = FavouriteListModel.fromJson(r.data);
      isHomeAdded = favouriteListModelDetails.favouriteList
              ?.any((item) => item.type == 'HOME') ??
          false;
      isWorkAdded = favouriteListModelDetails.favouriteList
              ?.any((item) => item.type == 'WORK') ??
          false;
      notifyListeners();
    });
  }

  Future<void> createFavouriteLocation(
      double latitude, double longitude, String address, String type) async {
    try {
      bool addressExists = favouriteListModelDetails.favouriteList
              ?.any((item) => item.address == address) ??
          false;
      if (addressExists) {
        showErrorDialog(message: "Address already exists");
        return;
      }

      var map = {
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "type": type,
      };

      final response =
          await apiHelper.post(AppUrls.createFavouritePlaces, params: map);

      response.fold(
        (error) {
          //showErrorDialog(errorModel: error);
        },
        (result) {
          final createFavouritePlaces =
              parseData(result, BaseResponse.fromJson);
          if (createFavouritePlaces != null) {
            getFavouriteList();
          } else {
            //showErrorDialog();
          }
        },
      );
    } catch (e) {
      // showErrorDialog();
    }
  }

  Future<void> deleteFavouriteLocation(String id) async {
    if (!isLoading.value) {
      isLoading.value = true;
      final response =
          await apiHelper.delete("${AppUrls.deleteFavouritePlaces}/$id");
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) {
        if (r.data != null) {
          getFavouriteList();
        } else {
          showErrorDialog();
        }
      });
      isLoading.value = false;
    }
  }

  // Future<void> pickImage() async {
  //   final pickedFile = await imagePicker.pickImage(source: ImageSource.gallery);
  //   if (pickedFile != null) {
  //     profileImg = File(pickedFile.path);
  //     isImageCaptured = true;
  //     isProfileChanged = true;
  //     notifyListeners();
  //   }
  // }

  void setProfileImg(File? newImg) {
    if (newImg != profileImg) {
      profileImg = newImg;
      isProfileChanged = true;
    } else {
      isProfileChanged = false;
    }
    notifyListeners();
  }

  Future<void> pickImage() async {
    final pickedFile = await imagePicker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setProfileImg(File(pickedFile.path));
    }
  }

  Future<void> deleteAccount() async {
    showLoader();
    final map = {
      AppConstants.refreshToken:
          preference.getString(PreferenceHelper.refreshToken),
    };
    final response = await apiHelper.post(AppUrls.deleteAccount, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      AppConstants.userFirstName = "";
      AppConstants.userPhoneNumber = "";
      AppConstants.userProfileImage = "";
      AppConstants.isBookingForOthersChanged = false;
      AppConstants.bookingForOthersRiderName = "";
      AppConstants.bookingForOthersRiderPhoneNumber = "";
      preference.setString(PreferenceHelper.demoKey, "");
      preference.remove(PreferenceHelper.demoKey);
      preference.setString(PreferenceHelper.authToken, "");
      preference.setString(PreferenceHelper.refreshToken, "");
      preference.remove(PreferenceHelper.authToken);
      preference.remove(PreferenceHelper.refreshToken);
      for (var i in mqtt.subscribedTopics) {
        if (i.isNotEmpty) {
          mqtt.unSubscribe(i);
        }
      }
      mqtt.disconnect();
      Fluttertoast.showToast(msg: translation.txt_delete_success);
      popAndMove(CustomRouter.loginScreen);
    });
    notifyListeners();
  }
}
