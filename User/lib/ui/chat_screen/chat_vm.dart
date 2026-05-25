import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:user/utils/base_vm.dart';
import '../../network/response_models/chat_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import 'chat_screen.dart';

class UserChatScreenVM extends BaseVm {
  String formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

    final timeFormatter = DateFormat('h:mm a');
    final timeString = timeFormatter.format(dateTime);

    if (messageDate == today) {
      return 'Today $timeString';
    } else if (messageDate == yesterday) {
      return 'Yesterday $timeString';
    } else {
      final dateFormatter = DateFormat('MMM d, yyyy');
      return '${dateFormatter.format(dateTime)} $timeString';
    }
  }

  final TextEditingController messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();
  List<ChatMessage> messages = [];
  List<ChatHistoryModel> chatHistory = [];
  final String? driverId;
  final String? userId;
  final String? reqID;

  // Add message ID tracking to prevent duplicates
  final Set<String> processedMessageIds = {};

  // Add callback to notify UI
  VoidCallback? onMessageReceived;
  VoidCallback? onHistoryLoaded;














  UserChatScreenVM({this.driverId, this.userId, this.reqID}) {
    listenForChatMessages();
  }

  Future<void> getChatHistory() async {
    try {
      final response = await apiHelper.get(
          "${AppUrls.getChatHistory1}${userId.toString()}${AppUrls.getChatHistory2}${driverId.toString()}${AppUrls.getChatHistory3}${reqID.toString()}");

      response.fold((e) {
        onHistoryLoaded?.call();
        showErrorDialog(errorModel: e);
      }, (r) {
        if (r.data != null) {
          processResponseData(r.data);
        } else {
          tryDirectApiCall();
        }

        notifyListeners();
      });
    } catch (e) {
      onHistoryLoaded?.call();
      notifyListeners();
    }
  }

  Future<void> tryDirectApiCall() async {
    try {
      final url =
          "${AppUrls.getChatHistory1}${userId.toString()}${AppUrls.getChatHistory2}${driverId.toString()}${AppUrls.getChatHistory3}${reqID.toString()}";

      final directResponse = await apiHelper.normalGet(url);

      if (directResponse.data != null) {
        processResponseData(directResponse.data);
      } else {
        onHistoryLoaded?.call();
      }
    } catch (e) {
      onHistoryLoaded?.call();
    }
  }

  void processResponseData(dynamic responseData) {
    try {
      List<dynamic>? messagesArray;

      if (responseData is Map<String, dynamic>) {
        if (responseData.containsKey('messages')) {
          messagesArray = responseData['messages'] as List<dynamic>?;
        } else if (responseData.containsKey('data')) {
          var nestedData = responseData['data'];
          if (nestedData is Map && nestedData.containsKey('messages')) {
            messagesArray = nestedData['messages'] as List<dynamic>?;
          } else if (nestedData is List) {
            messagesArray = nestedData;
          }
        }
      } else if (responseData is List<dynamic>) {
        messagesArray = responseData;
      } else {
        onHistoryLoaded?.call();
        return;
      }

      if (messagesArray != null && messagesArray.isNotEmpty) {
        chatHistory.clear();
        messages.clear();
        processedMessageIds.clear();

        for (int i = 0; i < messagesArray.length; i++) {
          try {
            var messageJson = messagesArray[i];
            var chatModel =
            ChatHistoryModel.fromJson(messageJson as Map<String, dynamic>);
            chatHistory.add(chatModel);
            String uniqueId = chatModel.sId ??
                "${chatModel.senderId}_${chatModel.message}_${chatModel.createdAt}";
            processedMessageIds.add(uniqueId);

            var chatMessage = ChatMessage(
              text: chatModel.message ?? '',
              isMe: chatModel.senderId == userId,
              timestamp:
              DateTime.tryParse(chatModel.createdAt ?? '') ?? DateTime.now(),
              status: MessageStatus.sent,
              translation: translation,
            );
            messages.add(chatMessage);
          } catch (e) {}
        }
        messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      }
      onHistoryLoaded?.call();
    } catch (e) {
      onHistoryLoaded?.call();
    }
  }

  Future<bool> messagePostWithText(String messageText) async {
    if (driverId == null || driverId!.isEmpty) {
      debugPrint("Error: driverId is missing");
      return false;
    }

    isLoading.value = true;

    final map = {
      AppConstants.requestId: reqID,
      AppConstants.receiverId: driverId,
      AppConstants.senderType: "Users",
      AppConstants.receiverType: "Driver",
      AppConstants.message: messageText,
    };

    final response = await apiHelper.post(AppUrls.sendMessage, params: map);
    isLoading.value = false;

    return response.fold((e) {
      showErrorDialog(errorModel: e);
      return false;
    }, (r) {
      return true;
    });
  }

  StreamSubscription? msgRecieve;

  void listenForChatMessages() async {
    if (userId == null || userId!.isEmpty) {
      debugPrint("Cannot subscribe: userId is null or empty");
      return;
    }

    final chatTopic = "${AppConstants.recieveMsg}$userId";

    try {
      await mqtt.subscribe(chatTopic);
      debugPrint("Subscribed to chat topic: $chatTopic");

      await msgRecieve?.cancel();
      msgRecieve = mqtt.messageController.stream.listen((onData) {
        final topic = onData[AppConstants.topic];

        if (topic == chatTopic) {
          final rawResponse = onData[AppConstants.response];

          if (rawResponse is String && rawResponse.isNotEmpty) {
            try {
              final jsonData = jsonDecode(rawResponse);
              final senderType = jsonData['senderType'] ?? '';
              final senderId = jsonData['senderId'] ?? '';
              final receiverId = jsonData['receiverId'] ?? '';
              final messageText = jsonData['message'] ?? '';
              final timestamp =
                  jsonData['timestamp'] ?? jsonData['createdAt'] ?? '';
              final messageId =
                  jsonData['messageId'] ?? jsonData['id'] ?? jsonData['_id'] ?? '';

              String uniqueId = messageId.isNotEmpty
                  ? messageId
                  : "${senderId}_${messageText}_${timestamp}";

              if (processedMessageIds.contains(uniqueId)) {
                debugPrint("Duplicate message detected, skipping: $uniqueId");
                return;
              }
              bool isFromCurrentUser = senderId == userId;
              if (!isFromCurrentUser) {
                processedMessageIds.add(uniqueId);

                final newMessage = ChatMessage(
                  text: messageText,
                  isMe: false,
                  timestamp: DateTime.tryParse(timestamp) ?? DateTime.now(),
                  status: MessageStatus.sent,
                  translation: translation,
                );

                messages.add(newMessage);
                onMessageReceived?.call();
                debugPrint(
                    "✅ Message added to list. Total messages: ${messages.length}");
              } else {
                debugPrint("🔄 Skipping own message to avoid duplication");
                processedMessageIds.add(uniqueId);
              }
            } catch (e) {
              debugPrint("❌ Failed to parse chat message: $e");
              debugPrint("❌ Raw data that failed: $rawResponse");
            }
          }
        }
      });
    } catch (e) {}
  }

  void addSentMessage(String messageText) {
    final timestamp = DateTime.now();
    final uniqueId =
        "${userId}_${messageText}_${timestamp.millisecondsSinceEpoch}";

    processedMessageIds.add(uniqueId);

    final newMessage = ChatMessage(
      text: messageText,
      isMe: true,
      timestamp: timestamp,
      status: MessageStatus.sending,
      translation: translation
    );

    messages.add(newMessage);
  }

  void updateMessageStatus(String messageText, MessageStatus status) {
    for (var message in messages) {
      if (message.text == messageText &&
          message.isMe &&
          message.status == MessageStatus.sending) {
        message.status = status;
        break;
      }
    }
  }

  void printMessageStats() {
    final myMessages = messages.where((m) => m.isMe).length;
    final otherMessages = messages.where((m) => !m.isMe).length;
    debugPrint("📊 Message Stats:");
    debugPrint("   - Total: ${messages.length}");
    debugPrint("   - My messages: $myMessages");
    debugPrint("   - Other messages: $otherMessages");
    debugPrint("   - Processed IDs: ${processedMessageIds.length}");
  }

  @override
  void dispose() {
    msgRecieve?.cancel();
    messageController.dispose();
    scrollController.dispose();
    super.dispose();
  }
}
