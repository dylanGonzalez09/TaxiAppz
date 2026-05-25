import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/response_models/base_response.dart';
import '../network/response_models/custom_error_model.dart';
import '../utils/app_url.dart';
import '../utils/preference_helper.dart';
import '../di/di_config.dart';
import '../utils/app_constants.dart';
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

  // Future<Either<ErrorModel, BaseResponse>> get(String url) async {
  //   try {
  //     final model = await _dio.get(url, options: Options(headers: addHeader()));
  //     final response = BaseResponse.fromJson(model.data);
  //     return Either.right(response);
  //   } on DioException catch (e) {
  //     return Either.left(_handleError(e));
  //   }
  // }

  Future<Either<ErrorModel, BaseResponse>> get(String url) async {
    try {
      final model = await _dio.get(url, options: Options(headers: addHeader()));
      final response = BaseResponse.fromJson(model.data);
      return Either.right(response);

    } on DioException catch (e) {

      // ----------- CHECK IF TOKEN EXPIRED -----------
      if (e.response?.statusCode == 401 &&
          (e.response?.data?["message"] ?? "").toString().toLowerCase() == "please authenticate") {

        final refreshed = await _refreshAccessToken();

        if (refreshed) {
          try {
            // retry the same GET call after refresh
            final retryModel = await _dio.get(url, options: Options(headers: addHeader()));
            final response = BaseResponse.fromJson(retryModel.data);
            return Either.right(response);
          } catch (_) {}
        }
      }

      // If not refreshable or retry fails → return error
      return Either.left(_handleError(e));
    }
  }


  // Future<Either<ErrorModel, BaseResponse>> post(String url,
  //     {dynamic params, bool isImage = false}) async {
  //   try {
  //     final model = await _dio.post(url,
  //         data: params,
  //         options: Options(
  //             headers: addHeader(),
  //             contentType:
  //                 isImage ? "multipart/form-data" : 'application/json'));
  //     final response = BaseResponse.fromJson(model.data);
  //     return Either.right(response);
  //   } on DioException catch (e) {
  //     return Either.left(_handleError(e));
  //   }
  // }
  Future<Either<ErrorModel, BaseResponse>> post(String url,
      {dynamic params, bool isImage = false}) async {
    try {
      final model = await _dio.post(
        url,
        data: params,
        options: Options(
          headers: addHeader(),
          contentType: isImage
              ? "multipart/form-data"
              : "application/json",
        ),
      );

      final response = BaseResponse.fromJson(model.data);
      return Either.right(response);

    } on DioException catch (e) {

      // ---------- CHECK FOR EXPIRED TOKEN ----------
      if (e.response?.statusCode == 401 &&
          (e.response?.data?["message"] ?? "").toString().toLowerCase() == "please authenticate") {

        final refreshed = await _refreshAccessToken();

        if (refreshed) {
          try {
            // Retry the same post request after refresh
            final retryModel = await _dio.post(
              url,
              data: params,
              options: Options(
                headers: addHeader(),
                contentType: isImage
                    ? "multipart/form-data"
                    : "application/json",
              ),
            );

            final response = BaseResponse.fromJson(retryModel.data);
            return Either.right(response);

          } catch (_) {}
        }
      }

      return Either.left(_handleError(e));
    }
  }

  // Future<Either<ErrorModel, BaseResponse>> put(String url,
  //     {dynamic params, bool isImage = false}) async {
  //   try {
  //     final model = await _dio.put(url,
  //         data: params,
  //         options: Options(
  //             headers: addHeader(),
  //             contentType:
  //             isImage ? "multipart/form-data" : 'application/json'));
  //     final response = BaseResponse.fromJson(model.data);
  //     return Either.right(response);
  //   } on DioException catch (e) {
  //     return Either.left(_handleError(e));
  //   }
  // }
  Future<Either<ErrorModel, BaseResponse>> put(String url,
      {dynamic params, bool isImage = false}) async {
    try {
      final model = await _dio.put(
        url,
        data: params,
        options: Options(
          headers: addHeader(),
          contentType:
          isImage ? "multipart/form-data" : "application/json",
        ),
      );

      final response = BaseResponse.fromJson(model.data);
      return Either.right(response);

    } on DioException catch (e) {

      // ------- Handle Token Expiration -------
      if (e.response?.statusCode == 401 &&
          (e.response?.data?["message"] ?? "")
              .toString()
              .toLowerCase() == "please authenticate") {

        final refreshed = await _refreshAccessToken();

        if (refreshed) {
          try {
            // Retry request after token refresh
            final retryModel = await _dio.put(
              url,
              data: params,
              options: Options(
                headers: addHeader(),
                contentType:
                isImage ? "multipart/form-data" : "application/json",
              ),
            );

            final response = BaseResponse.fromJson(retryModel.data);
            return Either.right(response);

          } catch (_) {}
        }
      }

      return Either.left(_handleError(e));
    }
  }

  // Future<Either<ErrorModel, BaseResponse>> patch(String url,
  //     {dynamic params, bool isImage = false}) async {
  //   try {
  //     final model = await _dio.patch(url,
  //         data: params,
  //         options: Options(
  //             headers: addHeader(),
  //             contentType:
  //             isImage ? "multipart/form-data" : 'application/json'));
  //     final response = BaseResponse.fromJson(model.data);
  //     return Either.right(response);
  //   } on DioException catch (e) {
  //     return Either.left(_handleError(e));
  //   }
  // }
  Future<Either<ErrorModel, BaseResponse>> patch(String url,
      {dynamic params, bool isImage = false}) async {
    try {
      final model = await _dio.patch(
        url,
        data: params,
        options: Options(
          headers: addHeader(),
          contentType:
          isImage ? "multipart/form-data" : "application/json",
        ),
      );

      final response = BaseResponse.fromJson(model.data);
      return Either.right(response);

    } on DioException catch (e) {

      // --- Detect Expired Token ---
      if (e.response?.statusCode == 401 &&
          (e.response?.data?["message"] ?? "")
              .toString()
              .toLowerCase() == "please authenticate") {

        final refreshed = await _refreshAccessToken();

        if (refreshed) {
          try {
            // 🔁 Retry request after token refresh
            final retryModel = await _dio.patch(
              url,
              data: params,
              options: Options(
                headers: addHeader(),
                contentType:
                isImage ? "multipart/form-data" : "application/json",
              ),
            );

            final response = BaseResponse.fromJson(retryModel.data);
            return Either.right(response);

          } catch (_) {}
        }
      }

      return Either.left(_handleError(e));
    }
  }

  // Future<Either<ErrorModel, BaseResponse>> delete(String url,
  //     {dynamic params, bool isImage = false}) async {
  //   try {
  //     final model = await _dio.delete(url,
  //         data: params,
  //         options: Options(
  //             headers: addHeader(),
  //             contentType:
  //             isImage ? "multipart/form-data" : 'application/json'));
  //     final response = BaseResponse.fromJson(model.data);
  //     return Either.right(response);
  //   } on DioException catch (e) {
  //     return Either.left(_handleError(e));
  //   }
  // }
  Future<Either<ErrorModel, BaseResponse>> delete(String url,
      {dynamic params, bool isImage = false}) async {
    try {
      final model = await _dio.delete(
        url,
        data: params,
        options: Options(
          headers: addHeader(),
          contentType:
          isImage ? "multipart/form-data" : "application/json",
        ),
      );

      final response = BaseResponse.fromJson(model.data);
      return Either.right(response);

    } on DioException catch (e) {

      // ---- AUTH EXPIRED CASE ----
      if (e.response?.statusCode == 401 &&
          (e.response?.data?["message"] ?? "")
              .toString()
              .toLowerCase() == "please authenticate") {

        final refreshed = await _refreshAccessToken();

        if (refreshed) {
          try {
            // 🔁 Retry DELETE after token refresh
            final retryModel = await _dio.delete(
              url,
              data: params,
              options: Options(
                headers: addHeader(),
                contentType:
                isImage ? "multipart/form-data" : "application/json",
              ),
            );

            final response = BaseResponse.fromJson(retryModel.data);
            return Either.right(response);

          } catch (_) {}
        }
      }

      return Either.left(_handleError(e));
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
        return ErrorModel(statusCode: 500, message: "Something went wrong");
      }
    }
  }

  Map<String, String> addHeader() {
    final preference = getIt<SharedPreferences>();
    final Map<String, String> map = {
      "Accept": "application/json",
      AppConstants.clientid:AppConstants.clientId
    };
    final token = preference.getString(PreferenceHelper.authToken); 
    if (token != null && token.isNotEmpty) {
      map["Authorization"] = "Bearer $token";
    }
    final languageCode = preference.getString(PreferenceHelper.languageCode);
    map["Content-Language"] = languageCode ?? "en";
    return map;
  }

  Future<Response> normalGet(String url) async{
    return _dio.get(url);
  }
  Future<bool> _refreshAccessToken() async {
    final prefs = getIt<SharedPreferences>();
    final refreshToken = prefs.getString(PreferenceHelper.refreshToken);

    if (refreshToken == null || refreshToken.isEmpty) return false;

    try {
      final response = await _dio.post(
        AppUrls.refreshToken,
        data: {"refresh_token": refreshToken},
        options: Options(headers: {
          "Accept": "application/json",
          AppConstants.clientid: AppConstants.clientId,
        }),
      );

      final model = BaseResponse.fromJson(response.data);

      // ---- UPDATE TOKEN IF AVAILABLE ----
      final newToken = model.data?["token"];
      if (newToken != null && newToken.toString().isNotEmpty) {
        await prefs.setString(PreferenceHelper.authToken, newToken);
        return true;
      }
      return false;

    } catch (_) {
      return false;
    }
  }


}
