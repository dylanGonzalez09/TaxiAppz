import 'dart:convert';
import 'dart:developer';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class CustomLoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.headers.isNotEmpty) {
      log(const JsonEncoder.withIndent('  ').convert(options.headers),
          name: "headers");
    }
    if (options.data != null && options.data is Map) {
      if (options.data is Map) {
        log(json.encode(options.data), name: "Parameters");
      }
    } else if (options.data != null && options.data is FormData) {
      try {
        final formDataMap = <String, dynamic>{}
          ..addEntries(options.data.fields)
          ..addEntries(options.data.files);
        log(json.encode(formDataMap), name: "Parameters");
      } catch (e) {
        debugPrint("$e");
      }
    }
    log(options.uri.toString(), name: "request url");
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    log(err.requestOptions.uri.toString(),
        name: "response url [${err.requestOptions.method}]");
    log("Status code [${err.response?.statusCode}]");
    try {
      if (err.response?.data != null) {
        log(json.encode(err.response?.data), name: "Error body");
      } else {
        log(err.message ?? "");
      }
    } catch (e) {
      log(err.message ?? "");
    }
    super.onError(err, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    log(response.requestOptions.uri.toString(),
        name:
            "response url [${response.requestOptions.method} ${response.statusCode}]");
    if (response.data != null) {
      if (response.data is Map) {
        log(json.encode(response.data), name: "Response body");
      } else {
        if (kDebugMode) {
          print("Response ${response.data}");
        }
      }
    }
    super.onResponse(response, handler);
  }
}
