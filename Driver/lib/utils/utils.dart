import 'dart:io';
import 'dart:math';
import 'dart:ui' as ui;

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:taxiappzpro/ui/trip/trip_vm.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import '../base/base_vm.dart';
import 'app_constants.dart';

class Utils {
  static bool isDemoKey = false;

  static Future<BitmapDescriptor> bitmapDescriptorFromSvgAsset(
    String assetName, [
    Size size = const Size(18, 18),
  ]) async {
    final pictureInfo = await vg.loadPicture(SvgAssetLoader(assetName), null);

    double devicePixelRatio =
        ui.PlatformDispatcher.instance.implicitView?.devicePixelRatio ?? 1.0;
    int width = (size.width * devicePixelRatio * 2).toInt(); // Scale up
    int height = (size.height * devicePixelRatio * 2).toInt(); // Scale up

    final scaleFactor = min(
      width / pictureInfo.size.width,
      height / pictureInfo.size.height,
    );

    final recorder = ui.PictureRecorder();

    ui.Canvas(recorder)
      ..scale(scaleFactor)
      ..drawPicture(pictureInfo.picture);

    final rasterPicture = recorder.endRecording();

    final image = rasterPicture.toImageSync(width, height);
    final bytes = (await image.toByteData(format: ui.ImageByteFormat.png))!;

    return BitmapDescriptor.bytes(bytes.buffer.asUint8List());
  }

  // Future<BitmapDescriptor> getBitmapDescriptorFromSVGAsset(
  //     String svgAssetLink, {
  //       Size size = const Size(30, 30),
  //     }) async {
  //   // Load the SVG asset as a string
  //   final String svgString = await rootBundle.loadString(svgAssetLink);
  //
  //   final pictureInfo = await vg.loadPicture(SvgStringLoader(svgAssetLink),null);
  //
  //   // Create a PictureRecorder and Canvas
  //   final ui.PictureRecorder pictureRecorder = ui.PictureRecorder();
  //   final Canvas canvas = Canvas(pictureRecorder);
  //
  //   // Define the size for rendering
  //   final double devicePixelRatio = ui.PlatformDispatcher.instance.views.first.devicePixelRatio;
  //   final double width = size.width * devicePixelRatio;
  //   final double height = size.height * devicePixelRatio;
  //
  //
  //   // Draw the SVG onto the canvas
  //   svgDrawable.draw(canvas, Rect.fromLTWH(0, 0, width, height));
  //
  //   // Convert the canvas into an Image
  //   final ui.Image image = await pictureRecorder.endRecording().toImage(
  //     width.toInt(),
  //     height.toInt(),
  //   );
  //
  //   // Convert the Image into bytes
  //   final ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
  //   if (byteData == null) {
  //     throw Exception("Failed to convert SVG to BitmapDescriptor.");
  //   }
  //
  //   final Uint8List bytes = byteData.buffer.asUint8List();
  //
  //   // Return the BitmapDescriptor
  //   return BitmapDescriptor.fromBytes(bytes);
  // }

  Future<Uint8List> svgStringToPngBytes(
    // The SVG string
    String svgPicture,
    // The target width of the output image
    double targetWidth,
    // The target height of the output image
    double targetHeight,
  ) async {
    final SvgAssetLoader svgStringLoader = SvgAssetLoader(svgPicture);
    final PictureInfo pictureInfo = await vg.loadPicture(svgStringLoader, null);
    final ui.Picture picture = pictureInfo.picture;
    final ui.PictureRecorder recorder = ui.PictureRecorder();
    final ui.Canvas canvas = Canvas(recorder,
        Rect.fromPoints(Offset.zero, Offset(targetWidth, targetHeight)));
    canvas.scale(targetWidth / pictureInfo.size.width,
        targetHeight / pictureInfo.size.height);
    canvas.drawPicture(picture);
    final ui.Image imgByteData = await recorder
        .endRecording()
        .toImage(targetWidth.ceil(), targetHeight.ceil());
    final ByteData? bytesData =
        await imgByteData.toByteData(format: ui.ImageByteFormat.png);
    final Uint8List imageData = bytesData?.buffer.asUint8List() ?? Uint8List(0);
    pictureInfo.picture.dispose();
    return imageData;
  }

  // Future<BitmapDescriptor> svgStringToBitmapDescriptor(
  //     String svgAssetPath, double width, double height) async {
  //   // Load the SVG content from an asset file
  //
  //  // final Uint8List pngBytes = await svgStringToPngBytes(width, height);
  //
  //   // Convert PNG bytes to BitmapDescriptor
  //   return BitmapDescriptor.bytes(pngBytes);
  // }

  // Future<BitmapDescriptor> getBitmap(String svgAsset,BuildContext context) async{
  //   final pictureInfo = await vg.loadPicture(SvgAssetLoader(svgAsset),context);
  //
  //
  //   final ui.PictureRecorder recorder = ui.PictureRecorder();
  //   final ui.Canvas canvas = ui.Canvas(recorder);
  //
  //   canvas.scale(24 / pictureInfo.size.width, 24 / pictureInfo.size.height);
  //   canvas.drawPicture(pictureInfo.picture);
  //   final ui.Picture scaledPicture = recorder.endRecording();
  //
  //   final image = await scaledPicture.toImage(24, 24);
  //
  //   final ByteData? bytesData = await image.toByteData(format: ui.ImageByteFormat.png);
  //   final Uint8List imageData = bytesData?.buffer.asUint8List() ?? Uint8List(0);
  //   pictureInfo.picture.dispose();
  //   return BitmapDescriptor.bytes(imageData);
  // }

  Future<BitmapDescriptor> getBitmap(
      String svgAsset, BuildContext context) async {
    // Load the SVG picture
    final pictureInfo = await vg.loadPicture(SvgAssetLoader(svgAsset), context);

    final ui.PictureRecorder recorder = ui.PictureRecorder();
    final ui.Canvas canvas = ui.Canvas(recorder);

    // Calculate scale factor based on desired output size (adjust as necessary)
    double scaleX = 64 / pictureInfo.size.width;
    double scaleY = 64 / pictureInfo.size.height;

    // Apply scaling to the canvas
    canvas.scale(scaleX, scaleY);

    // Draw the picture (scaled to the desired size)
    canvas.drawPicture(pictureInfo.picture);

    // End recording the picture
    final ui.Picture scaledPicture = recorder.endRecording();

    // Convert to Image
    final image = await scaledPicture.toImage(64, 64);

    // Convert image to PNG byte data
    final ByteData? bytesData =
        await image.toByteData(format: ui.ImageByteFormat.png);
    final Uint8List imageData = bytesData?.buffer.asUint8List() ?? Uint8List(0);

    // Dispose of the picture to free resources
    pictureInfo.picture.dispose();

    // Return BitmapDescriptor
    return BitmapDescriptor.bytes(imageData);
  }

  static Future<void> makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    await launchUrl(launchUri);
  }

 static Future<void> openGoogleMap({
    required double lat,
    required double lng,
    double? stopLat,
    double? stopLng,
    required BaseVm vm,
  }) async {
    String url;

    if (stopLat != null && stopLng != null) {
      // For navigation with waypoints
      url = 'https://www.google.com/maps/dir/?api=1'
          '&destination=$lat,$lng'
          '&waypoints=$stopLat,$stopLng'
          '&dir_action=navigate';
    } else {
      // For direct navigation
      url = 'https://www.google.com/maps/dir/?api=1'
          '&destination=$lat,$lng'
          '&dir_action=navigate';
    }

    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
    } else {
    vm.showErrorDialog(message: vm.translation.txt_Something_went_wrong);  }
    }
  

  static void showToast(String msg) {
    Fluttertoast.showToast(
        msg: msg,
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        timeInSecForIosWeb: 1,
        backgroundColor: Colors.white,
        textColor: Colors.black,
        fontSize: 16.0);
  }

  static String convertToStringData(dynamic data) => "$data";

  static String formatDecimalPointValue(String value, int point) {
    try {
      return value.contains(".")
          ? double.tryParse(value)?.toStringAsFixed(point) ?? value
          : value;
    } catch (e) {
      return value;
    }
  }

  static bool isBillValueNotEmpty(String? value) {
    if (value == null) {
      return false;
    }
    final double? v = double.tryParse(value);
    return v != null && v > 0;
  }

  static double convertMilesToKilometers(double miles) {
    return miles * 1.60934;
  }

  static double? convertToDouble(dynamic value) {
    try {
      if (value is int) {
        return value.toDouble();
      } else if (value is double) {
        return value;
      } else if (value is String) {
        return double.tryParse(value);
      } else {
        throw Exception('Unsupported type');
      }
    } catch (e) {
      return 0.0;
    }
  }

  static int colorToInt(Color color) {
    int a = (color.a * 255).toInt();
    int r = (color.r * 255).toInt();
    int g = (color.g * 255).toInt();
    int b = (color.b * 255).toInt();

    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  static Future<bool> hasRealInternetConnection() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return false;
    }
    try {
      const timeout = Duration(seconds: 10);
      final response = await http
          .get(
            Uri.parse('https://www.google.com'),
          )
          .timeout(timeout);

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static bool isTripWithinTwentyFourHours(String tripStartTimeUtc) {
    if (tripStartTimeUtc.isEmpty) {
      return false;
    }

    try {
      final nowUtc = DateTime.now();
      final tripStartTimeParse = DateTime.tryParse(tripStartTimeUtc);

      if (tripStartTimeParse == null) {
        return false;
      }
      final difference = nowUtc.difference(tripStartTimeParse);
      return difference.inSeconds > 0 && difference.inHours < 24;
    } catch (e) {
      return false;
    }
  }

  static String getVehicleImageName(String? vehicleType) {
    return CustomImages.driverIconPng;
    return vehicleType?.isNotEmpty == true
        ? vehicleType!.toUpperCase() == VEHICLETYPES.SEDAN.name.toUpperCase()
            ? CustomImages.driverSedanIconPng
            : vehicleType.toUpperCase() == VEHICLETYPES.MINI.name.toUpperCase()
                ? CustomImages.driverMiniIconPng
                : vehicleType.toUpperCase() ==
                        VEHICLETYPES.SUV.name.toUpperCase()
                    ? CustomImages.driverSuvIconPng
                    : vehicleType.toUpperCase() ==
                            VEHICLETYPES.LUXURY.name.toUpperCase()
                        ? CustomImages.driverLuxuryIconPng
                        : vehicleType.toUpperCase() ==
                                VEHICLETYPES.BIKE.name.toUpperCase()
                            ? CustomImages.driverBikeIconPng
                            : vehicleType.toUpperCase() ==
                                    VEHICLETYPES.AUTO.name.toUpperCase()
                                ? CustomImages.driverAutoIconPng
                                : CustomImages.driverIconPng
        : CustomImages.driverIconPng;
  }
}

extension GoRouterExtension on GoRouter {
  String? get currentRouteName =>
      routerDelegate.currentConfiguration.last.route.name;
}
