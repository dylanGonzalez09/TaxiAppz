import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/web_view/web_view_vm.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class WebView extends StatelessWidget {
  final String htmlContent;

  const WebView({super.key, required this.htmlContent});

  @override
  Widget build(BuildContext context) {
    final vm = getIt<WebViewVm>();
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_20),
          child: Column(
            children: [
              HeaderView(title: vm.translation.txt_terms_conditions),
              Expanded(
                child: SingleChildScrollView(
                  child: Html(data: htmlContent),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
