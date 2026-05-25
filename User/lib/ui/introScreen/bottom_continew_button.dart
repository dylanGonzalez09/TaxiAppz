import 'package:flutter/material.dart';

import '../about/aboutUs_screen.dart';

class BottomContinueButton extends StatelessWidget {
  final VoidCallback onPressed;

  const BottomContinueButton({super.key, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16.0),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: Text(
          vm.translation.Txt_Continue,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontSize: 16,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
