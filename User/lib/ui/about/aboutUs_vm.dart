import 'dart:io';

import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../utils/base_vm.dart';

class AboutUsVm extends BaseVm {
  Future<void> openPlayStore() async {
    var packageName = packageInfo.packageName;
    final url = Platform.isAndroid
        ? 'https://play.google.com/store/apps/details?id=$packageName'
        : Platform.isIOS
            ? "https://apps.apple.com/in/app/$packageName"
            : "";

    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      showErrorDialog(message: "Cannot launch app");
    }
  }
}
