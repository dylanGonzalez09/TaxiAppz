import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/custom_colors.dart';

class PaymentMethodBs extends StatefulWidget {
  final TranslationModel translation;
  const PaymentMethodBs({super.key, required this.translation});

  @override
  _PaymentMethodBs createState() => _PaymentMethodBs();
}

class _PaymentMethodBs extends State<PaymentMethodBs> {
  final List<String> payment_method = ['Cash', 'Card', 'Wallet'];
  List<int> selectedIndices = [];

  @override
  Widget build(BuildContext context) {
    return PopScope(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Text(
                widget.translation.txt_payment_methods,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.black,
                      fontSize: 18,
                    ),
              ),
            ),
            const SizedBox(
              height: 20,
            ),
            ListView.builder(
              shrinkWrap: true,
              itemCount: payment_method.length,
              itemBuilder: (context, index) {
                bool isSelected = selectedIndices.contains(index);
                return Container(
                  padding: const EdgeInsets.symmetric(
                      vertical: 8.0, horizontal: 8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Icon(
                        Icons.credit_card,
                        color: CustomColors.primaryColor,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          payment_method[index],
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.black,
                                    fontSize: 16,
                                  ),
                        ),
                      ),
                      const Icon(
                        Icons.check,
                        color: Colors.black,
                        size: 20,
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(
              height: 20,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      GoRouter.of(context).pop(true);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: CustomColors.primaryColor,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          widget.translation.txt_add_payment_method,
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Colors.black,
                                    fontSize: 18,
                                  ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
