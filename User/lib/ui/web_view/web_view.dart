import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import '../../components/header_view.dart';
import '../../utils/dimensions.dart';
import '../about/aboutUs_screen.dart';


class WebView extends StatelessWidget {
  final String htmlContent;

  const WebView({super.key, required this.htmlContent});

  @override
  Widget build(BuildContext context) {

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
