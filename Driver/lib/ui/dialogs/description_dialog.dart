import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taxiappzpro/ui/history/completed/invoice_vm.dart';

import '../../utils/custom_colors.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/theme_data.dart';

class DescriptionDialog extends StatelessWidget {
  final String title;
  final String title1;
  final InvoiceVm vm;
  const DescriptionDialog({
    super.key,
    required this.title,
    required this.title1,
    required this.vm,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.all(17),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20), color: Colors.white),
        padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: themeData.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            Text(
              title1,
              style: themeData.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 10,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: () {
                    GoRouter.of(context)
                        .pushNamed(CustomRouterConfig.profileScreen);
                  },
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 22, vertical: 2),
                    decoration: BoxDecoration(
                      color: CustomColors.clr_FF0000,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Center(
                      child: Text(
                        vm.translation.txt_edit,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white,
                              fontSize: 20,
                            ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(
                  width: 30,
                ),
                GestureDetector(
                  onTap: () {
                    vm.sharePdf();
                  },
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 22, vertical: 2),
                    decoration: BoxDecoration(
                      color: CustomColors.clr_35CF08,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Center(
                      child: Text(
                        vm.translation.txt_Send,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white,
                              fontSize: 20,
                            ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
