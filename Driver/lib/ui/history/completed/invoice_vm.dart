import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';
import 'package:taxiappzpro/main.dart';
import '../../../base/base_vm.dart';
import '../../../bottom_sheets/rating/driver_rating_bs.dart';
import '../../../network/response_models/req_in_pro_model.dart';
import '../../../network/response_models/trips_model.dart';
import '../../../utils/app_urls.dart';
import '../../../utils/utils.dart';

class InvoiceVm extends BaseVm {
  RequestInProModel? requestInProModel;
  TripModel? tripModel;
  bool isDisposed = false;
  bool isHistoryInvoice = false;
  final ScreenshotController screenshotController = ScreenshotController();

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void getReqInProgress() async {
    showLoader();
    final reModel = await apiHelper.get(AppUrls.reqInProgress);
    hideLoader();
    reModel.fold((e) => showErrorDialog(errorModel: e), (r) {
      final data = parseData(r.data, RequestInProModel.fromJson);
      print("CheckArrivevehicleId ${data?.driver?.vehicleId}");
      if (data != null && data.trip != null) {
        print("CheckArrive vehicleId ${data.driver?.vehicleId}");
        requestInProModel = data;
        tripModel = data.trip;
        setTripData(data);
        notifyListeners();
      }
    });
  }

  void setTripData(RequestInProModel? data) {}

  void showRatingDetails(tripModel) async {
    final response = await showModalBottomSheet<int>(
      context: navigatorKey.currentState!.context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (BuildContext context) {
        return FractionallySizedBox(
          heightFactor: 0.7,
          child: DriverRatingBs(tripModel: tripModel),
        );
      },
    );

    if (response != null) {}
  }

  Future<File> generatePdf() async {
    final pdf = pw.Document();
    final font = await rootBundle.load("assets/fonts/lato_regular.ttf");
    final ttf = pw.Font.ttf(font);
    final t = translation;
    final b = tripModel?.billingDetails;

    List<List<String>> billingData = [
      [t.txtDescription, t.txt_amount],

      [
        t.txtBaseFare,
        "${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.basePrice)}"
      ],
    ];

    if (_isNotEmpty(b?.distancePrice)) {
      billingData.add([
        t.txtDistanceCost,
        "${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.distancePrice)}"
      ]);
    }

    if (_isNotEmpty(b?.timePrice)) {
      billingData.add([
        t.txtTimeCost,
        "${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.timePrice)}"
      ]);
    }

    if (_isNotEmpty(b?.waitingCharge)) {
      billingData.add([
        t.txtWaitingTime,
        "${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.waitingCharge)}"
      ]);
    }

    if (_isNotEmpty(b?.promoDiscount)) {
      billingData.add([
        t.txtPromoBonus,
        "- ${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.promoDiscount)}"
      ]);
    }

    if (_isNotEmpty(b?.bookingFees)) {
      billingData.add([
        t.txtBookingFee,
        "- ${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.bookingFees)}"
      ]);
    }

    if (_isNotEmpty(b?.adminCommission)) {
      billingData.add([
        t.txtAdminCommission,
        "- ${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.adminCommission)}"
      ]);
    }

    if (_isNotEmpty(b?.serviceTax)) {
      billingData.add([
        t.txtServiceTax,
        "- ${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.serviceTax)}"
      ]);
    }

    billingData.add([
      t.txtTotalFareAmount,
      "${tripModel?.requestedCurrencySymbol ?? ''} ${_format(b?.totalAmount)}"
    ]);

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Container(
                color: PdfColors.black,
                padding: const pw.EdgeInsets.all(10),
                child: pw.Text("Invoice",
                    style: pw.TextStyle(
                        font: ttf, fontSize: 24, color: PdfColors.white)),
              ),
              pw.SizedBox(height: 20),
              pw.Text(
                  "User: ${tripModel?.user?.firstName ?? 'Senthil kumar user'}",
                  style: pw.TextStyle(font: ttf, fontSize: 14)),
              pw.Text(
                  "Car Number: ${tripModel?.driverDetails?.carNumber.toString() ?? 'TN 39 KL 3214'}",
                  style: pw.TextStyle(font: ttf, fontSize: 14)),
              pw.Text(
                  "Booking ID: ${tripModel?.requestNumber ?? 'Booking ID : RT_012345'}",
                  style: pw.TextStyle(font: ttf, fontSize: 14)),
              pw.SizedBox(height: 20),
              pw.Text("Trip Details",
                  style: pw.TextStyle(
                      font: ttf, fontSize: 18, color: PdfColors.black)),
              pw.SizedBox(height: 10),
              pw.TableHelper.fromTextArray(
                context: context,
                data: <List<String>>[
                  <String>['Pick-up Address', 'Pick-up Date', 'Pick-up Time'],
                  <String>[
                    tripModel?.pickAddress ?? '',
                    tripModel?.tripStartTime?.isNotEmpty == true
                        ? formatMonthDateYear(tripModel!.tripStartTime!, 1)
                        : "",
                    tripModel?.tripStartTime?.isNotEmpty == true
                        ? formatTime(tripModel!.tripStartTime!)
                        : ""
                  ],
                  /*<String>[
                    'Drop-off Address',
                    'Drop-off Date',
                    'Drop-off Time'
                  ],
                  <String>[
                    tripModel?.dropAddress ??
                        '17/2, Coimbatore, Tamil Nadu, India',
                    tripModel?.completedAt?.isNotEmpty == true
                        ? formatMonthDateYear(tripModel!.completedAt!, 1)
                        : "",
                    tripModel?.completedAt?.isNotEmpty == true
                        ? formatTime(tripModel!.completedAt!)
                        : ""
                  ],*/
                ],
                headerStyle: pw.TextStyle(
                    font: ttf,
                    fontSize: 12,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.white),
                headerDecoration:
                const pw.BoxDecoration(color: PdfColors.black),
                cellStyle: pw.TextStyle(font: ttf, fontSize: 12),
                cellHeight: 30,
                cellAlignments: {
                  0: pw.Alignment.centerLeft,
                  1: pw.Alignment.center,
                  2: pw.Alignment.center,
                },
              ),
              pw.SizedBox(height: 10),
              pw.TableHelper.fromTextArray(
                context: context,
                data: <List<String>>[
                  <String>['Drop-off Address', 'Drop-off Date', 'Drop-off Time'],
                  <String>[
                    tripModel?.dropAddress ??
                        '17/2, Coimbatore, Tamil Nadu, India',
                    tripModel?.completedAt?.isNotEmpty == true
                        ? formatMonthDateYear(tripModel!.completedAt!, 1)
                        : "",
                    tripModel?.completedAt?.isNotEmpty == true
                        ? formatTime(tripModel!.completedAt!)
                        : ""
                  ],
                ],
                headerStyle: pw.TextStyle(
                    font: ttf,
                    fontSize: 12,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.white),
                headerDecoration:
                const pw.BoxDecoration(color: PdfColors.black),
                cellStyle: pw.TextStyle(font: ttf, fontSize: 12),
                cellHeight: 30,
                cellAlignments: {
                  0: pw.Alignment.centerLeft,
                  1: pw.Alignment.center,
                  2: pw.Alignment.center,
                },
              ),
              pw.SizedBox(height: 20),
              pw.Text("Billing Details",
                  style: pw.TextStyle(
                      font: ttf, fontSize: 18, color: PdfColors.black)),
              pw.SizedBox(height: 10),
              pw.TableHelper.fromTextArray(
                context: context,
                data: billingData,
                headerStyle: pw.TextStyle(
                    font: ttf,
                    fontSize: 12,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.white),
                headerDecoration:
                const pw.BoxDecoration(color: PdfColors.black),
                cellStyle: pw.TextStyle(font: ttf, fontSize: 12),
                cellHeight: 30,
                cellAlignments: {
                  0: pw.Alignment.centerLeft,
                  1: pw.Alignment.centerRight,
                },
              ),
            ],
          );
        },
      ),
    );

    final output = await getTemporaryDirectory();
    final file = File("${output.path}/invoice.pdf");
    await file.writeAsBytes(await pdf.save());

    return file;
  }

  bool _isNotEmpty(dynamic value) {
    return value != null &&
        value.toString().isNotEmpty &&
        value.toString() != "0" &&
        value.toString() != "0.0" &&
        value.toString() != "0.00";
  }

  String _format(dynamic value) {
    return Utils.formatDecimalPointValue(value ?? '0', 2);
  }

  Future<void> sharePdf() async {
    final file = await generatePdf();
    Share.shareXFiles([XFile(file.path)], text: 'Here is your invoice.');
  }

  Future<void> shareScreenshot() async {
    final directory = (await getApplicationDocumentsDirectory()).path;
    const fileName = 'invoice_screenshot.png';
    screenshotController
        .captureAndSave(directory, fileName: fileName)
        .then((String? path) {
      if (path != null) {
        Share.shareXFiles([XFile(path)],
            text: 'Here is your invoice screenshot.');
      }
    });
  }

  // StreamSubscription? listenForTripChangesStream;
  //
  // void listenForTripChanges() {
  //   listenForTripChangesStream = mqtt.messageController.stream.listen((onData) {
  //     try {
  //       debugPrint(
  //           "    listenForTripChangesinvoice 1    ${onData.runtimeType}  \n$onData");
  //       List<int> bytes = latin1.encode(onData[AppConstants.response]);
  //       String fixedJsonString = utf8.decode(bytes);
  //       final Map<String, dynamic> jsonData = jsonDecode(fixedJsonString);
  //       final title = jsonData[AppConstants.title];
  //       Map<String, dynamic> tripData =
  //       jsonData[AppConstants.trip] as Map<String, dynamic>;
  //       if (title.toString().toUpperCase() == "MOVE_TO_CASH") {
  //         tripModel?.paymentOpt = tripData["paymentOpt"];
  //         tripModel?.isPaid = tripData["isPaid"];
  //         notifyListeners();
  //         Utils.showToast(translation.txtUserChangedPaymentCardToCash);
  //       } else if (title.toString().toUpperCase() == "PAYMENT_SUCCESS") {
  //         tripModel?.paymentOpt = tripData["paymentOpt"];
  //         tripModel?.isPaid = tripData["isPaid"];
  //         notifyListeners();
  //       } else {
  //         getReqInProgress();
  //       }
  //     } catch (e) {
  //       debugPrint("listenForTripChangesinvoice catch  $e");
  //       getReqInProgress();
  //     }
  //   });
  // }
}
