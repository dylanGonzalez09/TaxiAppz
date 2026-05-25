import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:overlay_windows_plugin/overlay_message.dart';
import 'package:overlay_windows_plugin/overlay_windows_api.g.dart';
import 'package:overlay_windows_plugin/overlay_windows_plugin.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class OverlayHelper extends WidgetsBindingObserver {
  final String _tag = "OverlayHelper";
  final String _id = AppConstants.driverLocationUpdate;
  final String _entryPointName = AppConstants.showOverlay;
  final _overlayWindowsPlugin = OverlayWindowsPlugin.defaultInstance;
  StreamSubscription<OverlayMessage>? _onMsgListener;
  StreamSubscription<OverlayMessage>? _onTouchListener;

  void initializeForOverlays() {
    print("init");
    try {
      WidgetsBinding.instance.addObserver(this);
      _onMsgListener = _overlayWindowsPlugin.messageStream.listen((m) {
        // print(
        //     "messageStream    ===============================  ${m.toJson()}");
      });
      _onTouchListener = _overlayWindowsPlugin.touchEventStream.listen((m) {
        // print(
        //     "touchEventStream    ===============================  ${m.toJson()}");
      });
    } catch (e) {
      print("init catch ${e}");
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    // print("  State =============== $state");
    if (await _isForegroundServiceRunning()) {
      if (state == AppLifecycleState.resumed) {
        closeOverlayWindow();
      } else if (state == AppLifecycleState.paused) {
        openOverlayWindow();
      } else if (state == AppLifecycleState.detached) {
        openOverlayWindow();
      } else if (state == AppLifecycleState.inactive) {
      } else if (state == AppLifecycleState.hidden) {}
    } else {
      closeOverlayWindow();
    }
    super.didChangeAppLifecycleState(state);
  }

  Future<void> openOverlayWindow() async {
    print("open await _isOverlayActive(_id!)   ${await _isOverlayActive(_id)}");
    if (await _overlayWindowsPlugin.isPermissionGranted()) {
      if (_id.isNotEmpty == true && await _isOverlayActive(_id)) {
        await _overlayWindowsPlugin.showOverlayWindow(
            _id,
            _entryPointName,
            OverlayWindowConfig(
              alignment: OverlayAlignment.centerLeft,
              width: Dimensions.padding_60.toInt(),
              height: Dimensions.padding_60.toInt(),
              enableDrag: true,
            ));
      }
    }
  }

  void closeOverlayWindow() async {
    print(
        "close await _isOverlayActive(_id!)   ${await _isOverlayActive(_id)}");
    if (_id.isNotEmpty == true && await _isOverlayActive(_id)) {
      await _overlayWindowsPlugin.closeOverlayWindow(_id);
    }
  }

  Future<bool> _isOverlayActive(String overlayId) async =>
      await _overlayWindowsPlugin.isActive(overlayId);

  Future<bool> _isForegroundServiceRunning() async =>
      await FlutterForegroundTask.isRunningService;

  void print(String msg) {
    debugPrint("$_tag \t $msg");
  }

  void sendMessageToOverlaysWindows(String msg) {
    _overlayWindowsPlugin.sendMessage(_id, msg);
  }

  void dispose() async {
    closeOverlayWindow();
    _onMsgListener?.cancel();
    _onMsgListener = null;
    _onTouchListener?.cancel();
    _onTouchListener = null;
    WidgetsBinding.instance.removeObserver(this);
  }
}
