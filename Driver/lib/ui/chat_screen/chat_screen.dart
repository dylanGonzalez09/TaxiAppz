import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../main.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import 'chat_screenvm.dart';

class DriverChatScreen extends StatefulWidget {
  final String? userId;
  final String? driverId;
  final String? reqId;
  final String? userName;
  final String? tripStartTime;

  const DriverChatScreen({super.key, this.userId, this.driverId, this.reqId, this.userName, this.tripStartTime});

  @override
  State<DriverChatScreen> createState() => _DriverChatScreenState();
}

class _DriverChatScreenState extends State<DriverChatScreen> with WidgetsBindingObserver {
  late DriverChatScreenVM vm;
  bool _showScrollToBottomButton = false;
  bool _isLoadingHistory = true;
  bool _isUserAtBottom = true;
  int _unreadMessageCount = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    vm = DriverChatScreenVM(userId: widget.userId, driverId: widget.driverId, reqId: widget.reqId);
    vm.scrollController.addListener(_scrollListener);

    vm.onMessageReceived = () {
      if (mounted) {
        setState(() {
          if (!_isUserAtBottom && !vm.messages.last.isMe) {
            _unreadMessageCount++;
          }
        });
        if (_isUserAtBottom || (vm.messages.isNotEmpty && vm.messages.last.isMe)) {
          _scrollToBottomAnimated();
        }
      }
    };

    vm.onHistoryLoaded = () {
      if (mounted) {
        setState(() {
          _isLoadingHistory = false;
        });
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (vm.messages.isNotEmpty) {
            _scrollToBottomInstant();
          }
        });
      }
    };

    vm.getChatHistory();
    vm.listenForChatMessages();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    vm.scrollController.removeListener(_scrollListener);
    vm.messageController.dispose();
    vm.scrollController.dispose();
    vm.dispose();
    super.dispose();
  }

  @override
  void didChangeMetrics() {
    final bottomInset = WidgetsBinding.instance.window.viewInsets.bottom;
    if (bottomInset > 0) {
      if (_isUserAtBottom) {
        Future.delayed(const Duration(milliseconds: 200), () {
          _scrollToBottomAnimated();
        });
      }
    }
    super.didChangeMetrics();
  }

  void _scrollToBottomInstant() {
    if (vm.scrollController.hasClients) {
      vm.scrollController.jumpTo(0); // For reversed ListView, position 0 is bottom
    }
  }

  void _scrollListener() {
    if (!vm.scrollController.hasClients) return;

    // For reversed ListView, check if we're at position 0 (bottom)
    final isAtBottom = vm.scrollController.position.pixels <= 50;

    // Update user position tracking
    if (_isUserAtBottom != isAtBottom) {
      setState(() {
        _isUserAtBottom = isAtBottom;

        // Reset unread count when user scrolls to bottom
        if (isAtBottom) {
          _unreadMessageCount = 0;
        }

        // Show/hide scroll button
        _showScrollToBottomButton = !isAtBottom && vm.messages.isNotEmpty;
      });
    }
  }

  void _scrollToBottomAnimated() {
    if (vm.scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (vm.scrollController.hasClients) {
          vm.scrollController.animateTo(
            0, // For reversed ListView, animate to position 0
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  void _scrollToBottom() {
    setState(() {
      _unreadMessageCount = 0;
    });
    _scrollToBottomAnimated();
  }

  void _sendMessage() {
    if (vm.messageController.text.trim().isNotEmpty) {
      final sentText = vm.messageController.text.trim();
      final timestamp = DateTime.now();
      final uniqueId = "${vm.driverId}_${sentText}_${timestamp.millisecondsSinceEpoch}";

      vm.processedMessageIds.add(uniqueId);

      final newMessage = ChatMessage(
        text: sentText,
        isMe: true,
        timestamp: timestamp,
        status: MessageStatus.sending,
        translation: vm.translation,
      );

      print("📤 Sending message: $sentText");

      setState(() {
        vm.messages.add(newMessage);
        _isUserAtBottom = true; // User sent message, consider them at bottom
      });

      vm.messageController.clear();
      _scrollToBottomAnimated();

      // Call API
      vm.messagePostWithText(sentText).then((success) {
        if (mounted) {
          setState(() {
            newMessage.status = success ? MessageStatus.sent : MessageStatus.failed;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Stack(
              children: [
                Container(
                  width: MediaQuery.of(context).size.width,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: CustomColors.svgImageColorDarkBlue.withValues(alpha: 0.1),
                        spreadRadius: 0,
                        blurRadius: 6,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(15.0),
                    child: Column(
                      children: [
                        Text(
                          vm.translation.txt_chat,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          widget.userName.toString(),
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.parse(widget.tripStartTime.toString())),
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                            fontSize: 15,
                          ),
                        )
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 15,
                  left: 20,
                  child: GestureDetector(
                      onTap: () {
                        GoRouter.of(navigatorKey.currentState!.context).pop();
                      },
                      child: const Icon(Icons.arrow_back_ios_new, color: Colors.black)),
                ),
              ],
            ),

            // Chat Messages Area
            Expanded(
              child: Stack(
                children: [
                  if (_isLoadingHistory)
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF004D73)),
                          ),
                          SizedBox(height: 16),
                          Text(
                            vm.translation.txt_loading_msg,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w400,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    )
                  else if (vm.messages.isEmpty)
                    Center(
                      child: Text(
                        vm.translation.txt_no_msg_found,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                          color: Colors.grey,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    )
                  else
                  // ListView with reverse: true for bottom alignment
                    ListView.builder(
                      controller: vm.scrollController,
                      padding: const EdgeInsets.all(16),
                      reverse: true,
                      itemCount: vm.messages.length,
                      itemBuilder: (context, index) {
                        // Reverse the index to maintain chronological order
                        final reversedIndex = vm.messages.length - 1 - index;
                        final message = vm.messages[reversedIndex];
                        final isNewMessage = reversedIndex == vm.messages.length - 1 &&
                            !message.isMe &&
                            !_isUserAtBottom;

                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                          child: ChatBubble(
                            message: message,
                            isNewMessage: isNewMessage,
                            translation: vm.translation,
                            onRetry: () {
                              setState(() {
                                vm.messages[reversedIndex].status = MessageStatus.sending;
                              });
                              vm.messagePostWithText(vm.messages[reversedIndex].text).then((success) {
                                if (mounted) {
                                  setState(() {
                                    vm.messages[reversedIndex].status =
                                    success ? MessageStatus.sent : MessageStatus.failed;
                                  });
                                }
                              });
                            },
                          ),
                        );
                      },
                    ),

                  // Enhanced Scroll to Bottom Button with Unread Count
                  if (_showScrollToBottomButton && !_isLoadingHistory)
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: Stack(
                        children: [
                          FloatingActionButton(
                            onPressed: _scrollToBottom,
                            backgroundColor: CustomColors.svgImageColorDarkBlue,
                            foregroundColor: Colors.white,
                            elevation: 4,
                            mini: true,
                            heroTag: "scrollToBottom",
                            child: const Icon(Icons.keyboard_arrow_down, size: 24),
                          ),
                          if (_unreadMessageCount > 0)
                            Positioned(
                              top: -5,
                              right: -5,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 20,
                                  minHeight: 20,
                                ),
                                child: Text(
                                  _unreadMessageCount > 9 ? '9+' : _unreadMessageCount.toString(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // Message Input Field
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(10),
                    spreadRadius: 0,
                    blurRadius: 4,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(50),
                  border: Border.all(color: CustomColors.primaryColor),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: vm.messageController,
                        decoration: InputDecoration(
                          hintText: vm.translation.txt_type_your_message,
                          contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          border: InputBorder.none,
                          hintStyle: TextStyle(
                              color: Color(0xFFD9D9D9),
                              fontWeight: FontWeight.w400,
                              fontSize: 16
                          ),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                        textInputAction: TextInputAction.send,
                      ),
                    ),
                    Container(
                        margin: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: CustomColors.primaryColor.withAlpha(50),
                          borderRadius: BorderRadius.circular(50),
                        ),
                        child: GestureDetector(
                            onTap: _sendMessage,
                            child: SvgPicture.asset(CustomImages.ic_send_msg)
                        )
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum MessageStatus { sending, sent, failed }

class ChatMessage {
  final String text;
  final bool isMe;
  final DateTime timestamp;
  MessageStatus status;
  final TranslationModel translation;

  ChatMessage({
    required this.text,
    required this.isMe,
    required this.timestamp,
    required this.translation,
    this.status = MessageStatus.sending,
  });
}

class ChatBubble extends StatelessWidget {
  final ChatMessage message;
  final VoidCallback? onRetry;
  final bool isNewMessage;
  final TranslationModel translation;

  const ChatBubble({
    super.key,
    required this.message,
    this.onRetry,
    this.isNewMessage = false,
    required this.translation,
  });

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

    final timeFormatter = DateFormat('h:mm a');
    final timeString = timeFormatter.format(dateTime);

    if (messageDate == today) {
      return '${message.translation.txt_today} $timeString';
    } else if (messageDate == yesterday) {
      return '${message.translation.txt_tomorrow} $timeString';
    } else {
      final dateFormatter = DateFormat('MMM d, yyyy');
      return '${dateFormatter.format(dateTime)} $timeString';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: message.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Flexible(
            child: Column(
              crossAxisAlignment: message.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.75,
                  ),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: message.isMe
                          ? const Color(0xFFD3F0FF)
                          : isNewMessage
                          ? const Color(0xFFE7FFF4).withValues(alpha: 0.9)
                          : const Color(0xFFE7FFF4),
                      borderRadius: message.isMe
                          ? const BorderRadius.only(
                        bottomLeft: Radius.circular(20),
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      )
                          : const BorderRadius.only(
                        bottomRight: Radius.circular(20),
                        topRight: Radius.circular(20),
                        topLeft: Radius.circular(20),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isNewMessage ? 0.15 : 0.1),
                          spreadRadius: 0,
                          blurRadius: isNewMessage ? 4 : 2,
                          offset: const Offset(0, 1),
                        ),
                      ],
                      border: isNewMessage
                          ? Border.all(color: Colors.green.withValues(alpha: 0.3), width: 1)
                          : null,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          message.text,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.w400,
                            color: Colors.black,
                          ),
                          overflow: TextOverflow.clip,
                        ),
                        if (message.isMe)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              if (message.status == MessageStatus.sending)
                                const Icon(Icons.access_time, size: 14, color: Colors.grey),
                              if (message.status == MessageStatus.sent)
                                const Icon(Icons.check, size: 14, color: Colors.green),
                              if (message.status == MessageStatus.failed)
                                GestureDetector(
                                  onTap: onRetry,
                                  child: const Icon(Icons.error, size: 14, color: Colors.red),
                                ),
                            ],
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatDateTime(message.timestamp),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFFAAAAAA),
                    fontWeight: FontWeight.w400,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}