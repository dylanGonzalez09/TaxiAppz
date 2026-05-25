import 'package:flutter/material.dart';
import '../../network/response_models/custom_error_model.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';

class SelectDialog extends StatefulWidget {
  final String title, btnText, errorText;
  final List<CustomNameModel> customModel;
  final bool isMultipleSelect;
  final void Function({
  ErrorModel? errorModel,
  String? message,
  Function()? onClick,
  String? buttonTxt,
  bool canDismiss,
  })? showErrorDialog;

  const SelectDialog({
    super.key,
    required this.title,
    required this.customModel,
    this.isMultipleSelect = false,
    this.btnText = "",
    this.showErrorDialog,
    this.errorText = "",
  });

  @override
  State<SelectDialog> createState() => _SelectDialogState();
}

class _SelectDialogState extends State<SelectDialog> {
  int? selectedIndex;
  List<CustomNameModel> multiSelectList = [];

  @override
  void initState() {
    super.initState();
    if (!widget.isMultipleSelect) {
      final preSelected = widget.customModel.indexWhere((i) => i.isSelected);
      if (preSelected != -1) {
        selectedIndex = preSelected;
      }
    } else {
      multiSelectList.addAll(widget.customModel.where((i) => i.isSelected));
    }
  }


  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    return GestureDetector(
      onTap: () => Navigator.of(context).pop(),
      child: Scaffold(
        backgroundColor: Colors.black.withValues(alpha: 0.5),
        body: Center(
          child: GestureDetector(
            onTap: () {}, // prevent close on inner tap
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              constraints: BoxConstraints(
                maxHeight: screenHeight * 0.75,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.white,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      color: CustomColors.primaryColor,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.title,
                          style:
                          Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: CustomColors.buttonTxtColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => Navigator.of(context).pop(),
                          child: Icon(
                            Icons.close_rounded,
                            color: CustomColors.buttonTxtColor,
                            size: 22,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (widget.isMultipleSelect && multiSelectList.isNotEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: CustomColors.primaryColor.withValues(alpha: 0.07),
                        border: Border(
                          bottom: BorderSide(
                              color: Colors.grey.shade200, width: 1),
                        ),
                      ),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: multiSelectList.map((item) {
                          return Chip(
                            label: Text(
                              item.name ?? "",
                              style: TextStyle(
                                color: CustomColors.primaryColor,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            backgroundColor:
                            CustomColors.primaryColor.withValues(alpha: 0.12),
                            deleteIconColor: CustomColors.primaryColor,
                            side: BorderSide(
                                color: CustomColors.primaryColor
                                    .withValues(alpha: 0.3)),
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            onDeleted: () {
                              setState(() {
                                item.isSelected = false;
                                multiSelectList.remove(item);
                              });
                            },
                          );
                        }).toList(),
                      ),
                    ),
                  Flexible(
                    child: ListView.separated(
                      shrinkWrap: true,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: widget.customModel.length,
                      separatorBuilder: (_, __) => Divider(
                        height: 1,
                        indent: 16,
                        endIndent: 16,
                        color: Colors.grey.shade100,
                      ),
                      itemBuilder: (context, index) {
                        final item = widget.customModel[index];
                        final bool isSelected = widget.isMultipleSelect
                            ? item.isSelected
                            : selectedIndex == index;

                        return GestureDetector(
                          onTap: () {
                            if (!widget.isMultipleSelect) {
                              // ── Single select ──
                              setState(() => selectedIndex = index);
                              Future.delayed(
                                  const Duration(milliseconds: 250), () {
                                Navigator.of(context).pop(item);
                              });
                            } else {
                              // ── Multi select ──
                              setState(() {
                                item.isSelected = !item.isSelected;
                                if (item.isSelected) {
                                  multiSelectList.add(item);
                                } else {
                                  multiSelectList.remove(item);
                                }
                              });
                            }
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? CustomColors.primaryColor
                                  .withValues(alpha: 0.08)
                                  : Colors.transparent,
                            ),
                            child: Row(
                              children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  width: 22,
                                  height: 22,
                                  decoration: BoxDecoration(
                                    shape: widget.isMultipleSelect
                                        ? BoxShape.rectangle
                                        : BoxShape.circle,
                                    borderRadius: widget.isMultipleSelect
                                        ? BorderRadius.circular(5)
                                        : null,
                                    border: Border.all(
                                      color: isSelected
                                          ? CustomColors.primaryColor
                                          : Colors.grey.shade400,
                                      width: 2,
                                    ),
                                    color: isSelected
                                        ? CustomColors.primaryColor
                                        : Colors.transparent,
                                  ),
                                  child: isSelected
                                      ? Icon(
                                    Icons.check,
                                    color: CustomColors.buttonTxtColor,
                                    size: 14,
                                  )
                                      : null,
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Text(
                                    item.name ?? "",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: isSelected
                                          ? CustomColors.primaryColor
                                          : Colors.black87,
                                      fontSize: 15,
                                      fontWeight: isSelected
                                          ? FontWeight.w600
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  if (widget.isMultipleSelect)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 16),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(
                              color: Colors.grey.shade200, width: 1),
                        ),
                      ),
                      child: Row(
                        children: [
                          if (multiSelectList.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: CustomColors.primaryColor
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                "${multiSelectList.length} selected",
                                style: TextStyle(
                                  color: CustomColors.primaryColor,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () {
                              if (multiSelectList.isNotEmpty) {
                                Navigator.of(context).pop(multiSelectList);
                              } else {
                                if (widget.showErrorDialog != null) {
                                  widget.showErrorDialog!(
                                      message: widget.errorText);
                                }
                              }
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(
                                  vertical: Dimensions.padding_6,
                                  horizontal: Dimensions.padding_30),
                              decoration: BoxDecoration(
                                boxShadow: multiSelectList.isNotEmpty
                                    ? [
                                  BoxShadow(
                                    color: Colors.grey.shade400,
                                    spreadRadius: 1,
                                    blurRadius: 5,
                                    offset: const Offset(0, 3),
                                  )
                                ]
                                    : [],
                                borderRadius: BorderRadius.circular(
                                    Dimensions.padding_30),
                                color: multiSelectList.isNotEmpty
                                    ? CustomColors.primaryColor
                                    : Colors.grey.shade300,
                              ),
                              child: Text(
                                widget.btnText.isNotEmpty
                                    ? widget.btnText
                                    : "Confirm",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                  color: multiSelectList.isNotEmpty
                                      ? CustomColors.buttonTxtColor
                                      : Colors.grey.shade500,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
