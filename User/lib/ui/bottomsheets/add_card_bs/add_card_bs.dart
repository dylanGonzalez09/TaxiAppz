import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../components/common_text_field.dart';
import '../../../utils/custom_colors.dart';
import 'add_card_vm.dart';

class AddCardBs extends StatelessWidget {
  AddCardBs({super.key});

  final vm = AddCardVm();

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
                vm.translation.txt_add_card,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.black,
                  fontSize: 20,
                ),
              ),
            ),
            const SizedBox(
              height: 38,
            ),
            CommonTextField(
              controller: vm.cardNameController,
              hint: vm.translation.txt_Card_Number,
            ),
            const SizedBox(
              height: 28,
            ),
            Row(
              children: [
                Expanded(
                  child: CommonTextField(
                    controller: vm.cardExpireController,
                    hint: 'MM/YY',
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(
                  width: 26,
                ),
                Expanded(
                  child: CommonTextField(
                    controller: vm.cardCCVController,
                    hint: 'CCV',
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(
              height: 28,
            ),
            CommonTextField(
              controller: vm.cardHolderNameController,
              hint: vm.translation.txt_Card_holder_name,
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
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 26),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: CustomColors.primaryColor,
                          borderRadius: BorderRadius.circular(25),
                        ),
                        child: Center(
                          child: Text(
                            vm.translation.txt_save,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                              color: Colors.black,
                              fontSize: 18,
                            ),
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