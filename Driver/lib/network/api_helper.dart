import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/network/response_models/base_response.dart';
import 'package:taxiappzpro/network/response_models/custom_error_model.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../utils/app_constants.dart';
import '../utils/preference_helper.dart';
import 'custom_logging_interceptor.dart';

class ApiHelper {
  final _dio = getIt<Dio>();
  final Map<String, String> _headerMap = {};

  ApiHelper() {
    final options = BaseOptions(
      baseUrl: AppConstants.baseurl,
      headers: _headerMap,
      contentType: "application/json",
    );
    _dio.options = options;
    _dio.interceptors.add(CustomLoggingInterceptor());
  }

  Future<Either<ErrorModel, BaseResponse>> get(String url, {bool isZone = false,String? zoneId}) async {
    if (await Utils.hasRealInternetConnection()) {
      try {
        final model =
            await _dio.get(url, options: Options(headers: addHeader(isZone,zoneId)));
        final response = BaseResponse.fromJson(model.data);
        return Either.right(response);
      } on DioException catch (e) {
        print("object$e");
        return Either.left(_handleError(e));
      }
    } else {
      return Either.left(
          ErrorModel(message: "Check Network Connectivity", statusCode: 500));
    }
  }

  Future<Either<ErrorModel, BaseResponse>> post(String url,
      {dynamic params, bool isImage = false}) async {
    if (await Utils.hasRealInternetConnection()) {
      try {
        final model = await _dio.post(url,
            data: params,
            options: Options(
                headers: addHeader(false,""),
                contentType:
                    isImage ? "multipart/form-data" : 'application/json'));
        final response = BaseResponse.fromJson(model.data);
        return Either.right(response);
      } on DioException catch (e) {
        return Either.left(_handleError(e));
      }
    } else {
      return Either.left(
          ErrorModel(message: "Check Network Connectivity", statusCode: 500));
    }
  }

  Future<Either<ErrorModel, BaseResponse>> put(String url,
      {dynamic params, bool isImage = false}) async {
    if (await Utils.hasRealInternetConnection()) {
      try {
        final model = await _dio.put(url,
            data: params,
            options: Options(
                headers: addHeader(false,""),
                contentType:
                    isImage ? "multipart/form-data" : 'application/json'));
        final response = BaseResponse.fromJson(model.data);
        return Either.right(response);
      } on DioException catch (e) {
        return Either.left(_handleError(e));
      }
    } else {
      return Either.left(
          ErrorModel(message: "Check Network Connectivity", statusCode: 500));
    }
  }

  Future<Either<ErrorModel, BaseResponse>> patch(String url,
      {dynamic params, bool isImage = false}) async {
    if (await Utils.hasRealInternetConnection()) {
      try {
        final model = await _dio.patch(url,
            data: params,
            options: Options(
                headers: addHeader(false,""),
                contentType:
                    isImage ? "multipart/form-data" : 'application/json'));
        final response = BaseResponse.fromJson(model.data);
        return Either.right(response);
      } on DioException catch (e) {
        return Either.left(_handleError(e));
      }
    } else {
      return Either.left(
          ErrorModel(message: "Check Network Connectivity", statusCode: 500));
    }
  }

  Future<Either<ErrorModel, BaseResponse>> delete(String url,
      {dynamic params, bool isImage = false}) async {
    if (await Utils.hasRealInternetConnection()) {
      try {
        final model = await _dio.delete(url,
            data: params,
            options: Options(
                headers: addHeader(false,""),
                contentType:
                    isImage ? "multipart/form-data" : 'application/json'));
        final response = BaseResponse.fromJson(model.data);
        return Either.right(response);
      } on DioException catch (e) {
        return Either.left(_handleError(e));
      }
    } else {
      return Either.left(
          ErrorModel(message: "Check Network Connectivity", statusCode: 500));
    }
  }

// Future<Either<ErrorModel, void>> downloadWithUrl(
//     String url, String path, Function(int, int) onDownloadProgress) async {
//   try {
//     final model = await _dio.download(url, path, onReceiveProgress: onDownloadProgress);
//     return Either.right(null);
//   } on DioException catch (e) {
//     return Either.left(_handleError(e));
//   }
// }

  ErrorModel _handleError(DioException e) {
    if (e.response == null) {
      return ErrorModel(statusCode: 500, message: "Something went wrong");
    } else {
      try {
        final response = BaseResponse.fromJson(e.response?.data);
        final failureModel = ErrorModel(
          statusCode: e.response?.statusCode ?? 500,
          message: response.message ?? "Something went wrong",
        );
        return failureModel;
      } catch (error) {
        return ErrorModel(
            statusCode: 500, message: "Something went wrong please try again");
      }
    }
  }

  Map<String, String> addHeader(bool? isZone, String? zoneId) {
    final preference = getIt<SharedPreferences>();
    final Map<String, String> map = {
      "Accept": "application/json",
      AppConstants.clientid: AppConstants.clientId
    };
    final token = preference.getString(PreferenceHelper.authToken);
    if (token != null && token.isNotEmpty) {
      map["Authorization"] = "${AppConstants.bearer} $token";
    }
    final languageCode = preference.getString(PreferenceHelper.languageCode);
    map["Content-Language"] = languageCode ?? "en";
    if (isZone == true) {
      map["zoneId"] = zoneId ?? "";
    }

    return map;
  }

  Future<Response> normalGet(String url) async {
    return _dio.get(url);
  }
}
