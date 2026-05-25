import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import '../trip/trip_vm.dart';

class MeterUploadScreen extends StatefulWidget {
  final Map<String, dynamic> map;

  const MeterUploadScreen({super.key, required this.map});

  @override
  State<MeterUploadScreen> createState() => _MeterUploadScreenState();
}

class _MeterUploadScreenState extends State<MeterUploadScreen> {
  final vm = TripVm();
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  String? errorMsg = "", meterImageUrl, userId, unit;
  File? meterImage;
  TRIPSTATUS? tripStatus;
  double? startMeter;

  final TextEditingController meterController = TextEditingController();

  @override
  void initState() {
    tripStatus = widget.map[AppConstants.tripStatus];
    unit = widget.map[AppConstants.unit];
    userId = widget.map[AppConstants.userId];
    if (tripStatus == TRIPSTATUS.TRIP_STARTED) {
      try {
        startMeter = double.tryParse(widget.map[AppConstants.distanceUnit]);
      } catch (e) {
        vm.showErrorDialog(message: "$e");
      }
    }
    super.initState();
  }

  void onImageSelected(File file) {
    setState(() {
      meterImage = file;
    });
  }


  void _onTakePhoto(BuildContext context) async {
    if (meterController.text.isEmpty) {
      vm.showErrorDialog(message: vm.translation.txt_enter_meter_value);
      return;
    }

    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      setState(() {
        meterImage = File(pickedFile.path);
      });
    }
  }


  void _onUpload() async {
    if (meterController.text.isEmpty) {
      vm.showErrorDialog(message: vm.translation.txt_enter_meter_value);
      return;
    }
    if (tripStatus == TRIPSTATUS.TRIP_STARTED &&
        !vm.isValidEndTripMeterValue(meterController.text, startMeter)) {
      vm.showErrorDialog(
          message: vm.translation.txtEndKmMustBeGreaterThanStartKm);
      return;
    }
    if (meterImage == null) {
      vm.showErrorDialog(message: vm.translation.txt_meter_image_not_uploaded);
      return;
    }

    setState(() => vm.isLoading.value = true);

    try {
      final data = FormData.fromMap({
        AppConstants.userId: userId,
        AppConstants.meter.toLowerCase(): meterController.text,
      });
      data.files.add(MapEntry(
        "image",
        await MultipartFile.fromFile(meterImage!.path),
      ));
      meterImageUrl = await vm.uploadMeter(data);
      if (meterImageUrl?.isNotEmpty == true) {
        vm.pop(args: {"files": meterImageUrl, "km": meterController.text});
      } else {
        vm.showErrorDialog(message: vm.translation.txt_meter_image_not_uploaded);
      }
    } catch (e) {
      vm.showErrorDialog(message: "$e");
    } finally {
      setState(() => vm.isLoading.value = false);
    }
  }


  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      resize: false,
      body: Padding(
        padding: const EdgeInsets.only(left: 20, right: 20),
        child: Column(
          children: [
            HeaderView(title: vm.translation.txt_One_Click_Away),
            const SizedBox(height: 36),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Text(
                      vm.translation.txt_Enter_your_meter_reading_to_proceed,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 14,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 28),
                    Padding(
                      padding: const EdgeInsets.only(left: 20, right: 20),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: TextField(
                                controller: meterController,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontSize: 15,
                                  fontFamily: AppConstants.latoFont,
                                  fontWeight: FontWeight.w400,
                                ),
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  hintText: vm.translation.txt_enter_meter_value,
                                  hintStyle: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 15,
                                    fontFamily: AppConstants.latoFont,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            unit ?? "",
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                              color: Colors.black,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.only(left: 20, right: 20),
                      child: Divider(
                        height: 0,
                        color: CustomColors.clr_AAAAAA,
                        thickness: 1,
                      ),
                    ),
                    const SizedBox(height: 30),
                    Text(
                      vm.translation.txt_upload_the_meter_image_to_start_trip,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Image Preview Box
                    Container(
                      height: 130,
                      margin: const EdgeInsets.symmetric(
                          horizontal: Dimensions.padding_40),
                      decoration: BoxDecoration(
                        color: CustomColors.clr_E9E9E9,
                        borderRadius:
                        BorderRadius.circular(Dimensions.padding_5),
                      ),
                      child: meterImage == null
                          ? Center(
                        child: SizedBox(
                          height: 32,
                          child: SvgPicture.asset(CustomImages.icCloud),
                        ),
                      )
                          : ClipRRect(
                        borderRadius:
                        BorderRadius.circular(Dimensions.padding_5),
                        child: Image.file(
                          meterImage!,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: 130,
                        ),
                      ),
                    ),

                    const SizedBox(height: Dimensions.padding_20),

                    // Take Photo Button
                    InkWell(
                      onTap: () => _onTakePhoto(context),
                      child: Container(
                        width: 150,
                        padding: const EdgeInsets.symmetric(
                            vertical: Dimensions.padding_12,
                            horizontal: Dimensions.padding_10),
                        decoration: BoxDecoration(
                          color: CustomColors.primaryColor,
                          borderRadius:
                          BorderRadius.circular(Dimensions.padding_27),
                        ),
                        child: Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SvgPicture.asset(
                                CustomImages.icCamera,
                                color: Colors.white,
                              ),
                              const SizedBox(width: Dimensions.padding_8),
                              Flexible(
                                child: Text(
                                  vm.translation.txt_Take_Photo,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(
                                    fontSize: 15,
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  left: 45, right: 45, bottom: Dimensions.padding_20),
              child: InkWell(
                onTap: _onUpload,
                child: Container(
                  width: double.infinity,
                  height: 52,
                  padding: const EdgeInsets.symmetric(
                      vertical: Dimensions.padding_12,
                      horizontal: Dimensions.padding_10),
                  decoration: BoxDecoration(
                    color: CustomColors.primaryColor,
                    borderRadius:
                    BorderRadius.circular(Dimensions.padding_27),
                  ),
                  child: Center(
                    child: vm.isLoading.value
                        ? const CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    )
                        : Text(
                      vm.translation.txt_Upload,
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                        fontSize: 15,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      scaffoldKey: scaffoldKey,
    );
  }

}
