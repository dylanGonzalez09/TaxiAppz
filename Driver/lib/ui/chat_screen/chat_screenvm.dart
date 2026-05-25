import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/cupertino.dart';
import '../../base/base_vm.dart';
import '../../network/response_models/chat_history_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';
import 'chat_screen.dart';

class DriverChatScreenVM extends BaseVm {
  final TextEditingController messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();
  List<ChatMessage> messages = [];
  List<ChatHistoryModel> chatHistory = [];
  final String? userId;
  final String? driverId;
  final String? reqId;

  final Set<String> processedMessageIds = {};

  // Add callbacks to notify UI
  VoidCallback? onMessageReceived;
  VoidCallback? onHistoryLoaded;

  // StreamSubscription to properly manage MQTT listener
  StreamSubscription? msgReceive;

  DriverChatScreenVM({this.driverId, this.userId, this.reqId}) {
    print("DriverChatScreenVM initialized with driverId: $driverId, userId: $userId, reqId: $reqId");
  }

  Future<void> getChatHistory() async {
    print("sdgvsgddfvdfn ${reqId.toString()}");
    try {
      final response = await apiHelper.get("${AppUrls.getChatHistory1}${userId.toString()}${AppUrls.getChatHistory2}${driverId.toString()}${AppUrls.getChatHistory3}${reqId.toString()}");

      response.fold((e) {
        showErrorDialog(errorModel: e);
        onHistoryLoaded?.call();
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
      final url = "${AppUrls.getChatHistory1}${userId.toString()}${AppUrls.getChatHistory2}${driverId.toString()}${AppUrls.getChatHistory3}${reqId.toString()}";
      final directResponse = await apiHelper.normalGet(url);

      if (directResponse.data != null) {
        processResponseData(directResponse.data);
      } else {
        onHistoryLoaded?.call();
      }

    } catch (e) {
      print(" Direct API call failed: $e");
      onHistoryLoaded?.call();
    }
  }


  void processResponseData(dynamic responseData) {
    try {
      print(" Processing response data...");
      print(" Data type: ${responseData.runtimeType}");

      List<dynamic>? messagesArray;

      // Handle different response structures
      if (responseData is Map<String, dynamic>) {
        print(" Response is a Map with keys: ${responseData.keys.toList()}");

        if (responseData.containsKey('messages')) {
          messagesArray = responseData['messages'] as List<dynamic>?;
          print(" Found 'messages' key with ${messagesArray?.length ?? 0} items");
        } else if (responseData.containsKey('data')) {
          var nestedData = responseData['data'];
          if (nestedData is Map && nestedData.containsKey('messages')) {
            messagesArray = nestedData['messages'] as List<dynamic>?;
          } else if (nestedData is List) {
            messagesArray = nestedData;
          }
        } else {
          print(" No 'messages' key found. Available keys: ${responseData.keys}");
        }
      } else if (responseData is List<dynamic>) {
        print("📦 Response is directly a List with ${responseData.length} items");
        messagesArray = responseData;
      } else {
        print(" Unexpected response type: ${responseData.runtimeType}");
        onHistoryLoaded?.call();
        return;
      }

      if (messagesArray != null && messagesArray.isNotEmpty) {
        // Clear existing data
        chatHistory.clear();
        messages.clear();
        processedMessageIds.clear(); // Clear processed IDs when loading history

        print(" Parsing ${messagesArray.length} messages...");

        // Parse each message
        for (int i = 0; i < messagesArray.length; i++) {
          try {
            var messageJson = messagesArray[i];
            var chatModel = ChatHistoryModel.fromJson(messageJson as Map<String, dynamic>);
            chatHistory.add(chatModel);


            String uniqueId = chatModel.sId ?? "${chatModel.senderId}_${chatModel.message}_${chatModel.createdAt}";
            processedMessageIds.add(uniqueId);


            var chatMessage = ChatMessage(
              text: chatModel.message ?? '',
              isMe: chatModel.senderId == driverId,
              timestamp: DateTime.tryParse(chatModel.createdAt ?? '') ?? DateTime.now(),
              status: MessageStatus.sent,
              translation: translation,
            );
            messages.add(chatMessage);

          } catch (e) {
            print(" Error parsing message $i: $e");
          }
        }

        // Sort messages by timestamp
        messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));

        print("Successfully loaded ${messages.length} messages");
        print(" Driver ID: $driverId, User ID: $userId");

        if (messages.isNotEmpty) {
          print(" Sample messages:");
          for (int i = 0; i < math.min(3, messages.length); i++) {
            print("   ${i + 1}. '${messages[i].text}' (isMe: ${messages[i].isMe})");
          }
        }
      } else {
        print(" No messages found or empty array");
      }

      // Always call the callback to update UI
      onHistoryLoaded?.call();

    } catch (e) {
      print("❌ Error processing response data: $e");
      onHistoryLoaded?.call(); // Still call to handle empty state
    }
  }


  Future<bool> messagePostWithText(String messageText) async {
    print(" Driver sending message to userId: $userId");
    if (userId == null || userId!.isEmpty) {
      debugPrint(" Error: userId is missing");
      return false;
    }

    isLoading.value = true;

    final map = {
      AppConstants.requestId: reqId,
      AppConstants.receiverId: userId,
      AppConstants.senderType: "Driver",
      AppConstants.receiverType: "Users",
      AppConstants.message: messageText,
    };
    print(" Sending message payload: $map");

    final response = await apiHelper.post(AppUrls.sendMessage, params: map);
    isLoading.value = false;

    return response.fold((e) {
      print(" Message send error: $e");
      showErrorDialog(errorModel: e);
      return false;
    }, (r) {
      print(" Message sent successfully");
      return true;
    });
  }


  void listenForChatMessages() async {
    print(" Setting up MQTT listener for driver...");

    if (driverId == null || driverId!.isEmpty) {
      debugPrint(" Cannot subscribe: driverId is null or empty");
      return;
    }

    // FIXED: Driver should listen to their own topic for incoming messages
    final chatTopic = "${AppConstants.recieveMsg}$driverId";
    debugPrint("Driver subscribing to topic: $chatTopic");

    try {
      await mqtt.subscribe(chatTopic);
      debugPrint(" Successfully subscribed to chat topic: $chatTopic");

      await msgReceive?.cancel();
      msgReceive = mqtt.messageController.stream.listen(
            (onData) {
          print("🔔 Driver received MQTT data: $onData");

          final topic = onData[AppConstants.topic];
          print("📣 Message received on topic: $topic");

          if (topic == chatTopic) {
            print(" Topic matches driver's chat topic!");
            final rawResponse = onData[AppConstants.response];
            print("Raw response: $rawResponse");

            if (rawResponse is String && rawResponse.isNotEmpty) {
              try {
                final jsonData = jsonDecode(rawResponse);
                debugPrint("📨 Received message JSON: $jsonData");

                final senderType = jsonData['senderType'] ?? '';
                final senderId = jsonData['senderId'] ?? '';
                final receiverId = jsonData['receiverId'] ?? '';
                final messageText = jsonData['message'] ?? '';
                final timestamp = jsonData['timestamp'] ?? jsonData['createdAt'] ?? '';
                final messageId = jsonData['messageId'] ?? jsonData['id'] ?? jsonData['_id'] ?? '';

                // Enhanced debugging
                print("🔍 MESSAGE DETAILS:");
                print("   - senderType: $senderType");
                print("   - senderId: $senderId");
                print("   - receiverId: $receiverId");
                print("   - currentDriverId: $driverId");
                print("   - messageId: $messageId");
                print("   - message: $messageText");
                print("   - timestamp: $timestamp");

                // Create a unique identifier for this message
                String uniqueId = messageId.isNotEmpty
                    ? messageId
                    : "${senderId}_${messageText}_${timestamp}";


                if (processedMessageIds.contains(uniqueId)) {
                  debugPrint(" Duplicate message detected, skipping: $uniqueId");
                  return;
                }


                bool isFromCurrentDriver = senderId == driverId;

                print(" Is from current driver? $isFromCurrentDriver");

                if (!isFromCurrentDriver) {
                  processedMessageIds.add(uniqueId);

                  final newMessage = ChatMessage(
                    text: messageText,
                    isMe: false, // Always false for incoming messages from others
                    timestamp: DateTime.tryParse(timestamp) ?? DateTime.now(),
                    status: MessageStatus.sent,
                    translation: translation,
                  );

                  messages.add(newMessage);
                  onMessageReceived?.call();
                  debugPrint("Message added to list. Total messages: ${messages.length}");
                } else {
                  debugPrint(" Skipping own message to avoid duplication");
                  // Still add to processed IDs to avoid future duplicates
                  processedMessageIds.add(uniqueId);
                }

              } catch (e) {
                debugPrint("Failed to parse chat message: $e");
                debugPrint(" Raw data that failed: $rawResponse");
              }
            } else {
              debugPrint("⚠️ Empty or invalid response received");
            }
          } else {
            debugPrint("ℹ Message for different topic ignored: $topic");
          }
        },
        onError: (error) {
          debugPrint(" MQTT stream error: $error");
        },
        onDone: () {
          debugPrint("ℹ MQTT stream closed");
        },
      );
    } catch (e) {
      print(" Error setting up MQTT listener: $e");
    }
  }

  /// Helper method to add a sent message to the UI immediately
  void addSentMessage(String messageText) {
    final timestamp = DateTime.now();
    final uniqueId = "${driverId}_${messageText}_${timestamp.millisecondsSinceEpoch}";


    processedMessageIds.add(uniqueId);

    final newMessage = ChatMessage(
      text: messageText,
      isMe: true,
      timestamp: timestamp,
      status: MessageStatus.sending,
      translation: translation,
    );

    messages.add(newMessage);

    print("📤 Added sent message to UI:");
    print("   - text: $messageText");
    print("   - uniqueId: $uniqueId");
    print("   - total messages: ${messages.length}");
  }


  void updateMessageStatus(String messageText, MessageStatus status) {
    for (var message in messages) {
      if (message.text == messageText && message.isMe && message.status == MessageStatus.sending) {
        message.status = status;
        break;
      }
    }
    print("Updated message status: $messageText -> $status");
  }


  void printMessageStats() {
    final myMessages = messages.where((m) => m.isMe).length;
    final otherMessages = messages.where((m) => !m.isMe).length;
    print(" Message Stats:");
    print("   - Total: ${messages.length}");
    print("   - My messages: $myMessages");
    print("   - Other messages: $otherMessages");
    print("   - Processed IDs: ${processedMessageIds.length}");
  }

  @override
  void dispose() {
    print("🗑 Disposing DriverChatScreenVM");
    msgReceive?.cancel();
    messageController.dispose();
    scrollController.dispose();
    super.dispose();
  }
}