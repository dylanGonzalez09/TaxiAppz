import 'package:flutter/material.dart';

class CustomScaffold extends StatelessWidget {
  final Widget body;
  final GlobalKey<ScaffoldState> scaffoldKey;

  const CustomScaffold({super.key, required this.body, required this.scaffoldKey});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
          key: scaffoldKey,
          body: body,
        ));
  }
}
