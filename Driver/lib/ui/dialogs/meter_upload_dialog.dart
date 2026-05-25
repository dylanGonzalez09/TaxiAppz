import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:taxiappzpro/ui/trip/trip_vm.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';

import '../../network/response_models/document_image_view.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class MeterUploadDialog extends StatefulWidget {
  const MeterUploadDialog({super.key});

  @override
  State<MeterUploadDialog> createState() => _MeterUploadDialogState();
}

class _MeterUploadDialogState extends State<MeterUploadDialog> {
  final vm = TripVm();
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();

  Future<void> captureImage() async {
    final XFile? pickedFile = await _picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  final TextEditingController _meterController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Title
            Text(
              vm.translation.txt_TaxiAppz_Driver,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            // Subtitle
            Text(
              vm.translation.txt_meter_proceed,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 14,
                color: Colors.black54,
              ),
            ),
            const SizedBox(height: 25),
            // Meter Input Field
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: TextField(
                      controller: _meterController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: vm.translation.txt_enter_meter_value,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Km',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          Text(
            vm.translation.txt_enter_meter_desc_uplode,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
          ),
            const SizedBox(height: 20),

            Container(
              height: 100,
              margin: const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
              decoration: BoxDecoration(
                color: CustomColors.clr_E9E9E9,
                borderRadius: BorderRadius.circular(Dimensions.padding_5),
              ),

              child: _imageFile == null
                  ? Center(
                child: SizedBox(
                  height: 32,
                  child: SvgPicture.asset(CustomImages.icCloud),
                ),
              )
                  : Image.file(
                _imageFile!,
                fit: BoxFit.cover,
                width: double.infinity,
                height: 120,
              ),
            ),

            const SizedBox(height: Dimensions.padding_20),
            Container(
              width: 150,
              padding: const EdgeInsets.symmetric(vertical: Dimensions.padding_12, horizontal: Dimensions.padding_10),
              decoration: BoxDecoration(
                color: CustomColors.primaryColor,
                borderRadius: BorderRadius.circular(Dimensions.padding_27),
              ),
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SvgPicture.asset(CustomImages.icCamera),
                    const SizedBox(width: Dimensions.padding_8),
                    Flexible(
                      child: Text(
                        vm.translation.txt_Take_Photo,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 15, color: CustomColors.clr_303030),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),

          ],
        ),
      ),
    );
  }
}
