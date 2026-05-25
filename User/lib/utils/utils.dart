import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:http/http.dart' as http;
import 'app_constants.dart';

class Utils {
  static bool isDemoFlow = false;

  static void showToast(String msg) {
    Fluttertoast.showToast(
      msg: msg,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.white,
      textColor: Colors.black,
      fontSize: 16.0,
    );
  }

  static Future<bool> hasRealInternetConnection() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return false;
    }
    try {
      const timeout = Duration(seconds: 5);
      final response = await http
          .get(Uri.parse('https://www.google.com'))
          .timeout(timeout);
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
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

  static Future<void> shareTrip(String path) async {
    final url = "${AppConstants.adminPanelUrl}$path";
    await Share.share('Check out this trip: $url');
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

  static bool isLastUpdatedTimesIsWithinFifteenSeconds(
    String? lastUpdatedTime,
  ) {
    try {
      if (lastUpdatedTime?.isNotEmpty == true) {
        DateTime updatedTime = DateTime.fromMillisecondsSinceEpoch(
          BigInt.parse(lastUpdatedTime!).toInt(),
          isUtc: true,
        );
        DateTime nowUtc = DateTime.now().toUtc();
        Duration difference = nowUtc.difference(updatedTime);
        return difference.inSeconds < 15;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }



}
