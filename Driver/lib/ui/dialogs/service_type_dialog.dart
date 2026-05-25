import 'package:flutter/material.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';

import '../../main.dart';
import 'error_dialog.dart';

class ServiceTypeDialog extends StatefulWidget {
  final String title;
  final String serviceType;
  final TranslationModel translation;

  const ServiceTypeDialog({
    super.key,
    required this.title,
    required this.translation,
    required this.serviceType,
  });

  @override
  _ServiceTypeDialogState createState() => _ServiceTypeDialogState();
}

class _ServiceTypeDialogState extends State<ServiceTypeDialog> {
  List<String> service = [];
  List<int> selectedIndices = [];

  @override
  void initState() {
    final response = widget.serviceType.split(",");
    service.addAll(response);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: Colors.white,
          ),
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  widget.title,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(height: 10),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: service.length,
                itemBuilder: (context, index) {
                  return InkWell(
                    onTap: () {
                      if (selectedIndices.contains(index)) {
                        selectedIndices.remove(index);
                      } else {
                        selectedIndices.add(index);
                      }
                      setState(() {});
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 8.0, horizontal: 8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            service[index],
                            style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontSize: 16,
                            ),
                          ),
                          if (selectedIndices.contains(index))
                            const Icon(
                              Icons.check,
                              color: Colors.black,
                              size: 20,
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 15),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  elevation: 4.0,
                ),
                onPressed: () {
                  if (selectedIndices.isNotEmpty) {
                    String selectedType = selectedIndices
                        .map((index) => service[index]) // Map indices to strings
                        .join(','); // Join with ', '

                    Navigator.of(context).pop(selectedType);
                  } else {
                    showErrorDialog(message: widget.translation.txt_Select_service_type);
                  }
                },
                child: Text(
                  widget.translation.txt_Submit,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void showErrorDialog({
    String? message,
  }) {
    if (navigatorKey.currentState != null) {
      showDialog(
          context: navigatorKey.currentState!.context,
          builder: (_) {
            return ErrorDialog(
              message: message,
            );
          });
    }
  }
}