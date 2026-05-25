import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:user/network/response_models/translation_model.dart';
import 'package:user/utils/custom_colors.dart';
import '../../main.dart';
import '../../utils/custom_images.dart';
import 'chat_vm.dart';

class UserChatScreen extends StatefulWidget {
  final String? driverId;
  final String? uSerId;
  final String? userName;
  final String? tripStartTime;
  final String? reqID;

  const UserChatScreen({
    super.key,
    this.driverId,
    this.uSerId,
    this.userName,
    this.reqID,
    this.tripStartTime
  });

  @override
  State<UserChatScreen> createState() => _UserChatScreenState();
}

class _UserChatScreenState extends State<UserChatScreen> with WidgetsBindingObserver {
  late UserChatScreenVM vm;
  bool _showScrollToBottomButton = false;
  bool _isLoadingHistory = true;
  bool _isUserAtBottom = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    vm = UserChatScreenVM(driverId: widget.driverId, userId: widget.uSerId, reqID: widget.reqID);
    vm.scrollController.addListener(_scrollListener);

    vm.onMessageReceived = () {
      if (mounted) {
        setState(() {});
        // Auto scroll only if user is at bottom
        if (_isUserAtBottom) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _scrollToBottom();
          });
        }
      }
    };

    vm.onHistoryLoaded = () {
      if (mounted) {
        setState(() {
          _isLoadingHistory = false;
        });

        WidgetsBinding.instance.addPostFrameCallback((_) {
          _scrollToBottom();
        });
      }
    };

    vm.getChatHistory();
    vm.listenForChatMessages();

    debugPrint("Dkjkws: ${widget.driverId},,,,,${widget.uSerId} reqqqqq ${widget.reqID}");
  }

  void _scrollListener() {
    if (!vm.scrollController.hasClients) return;

    final isAtBottom = vm.scrollController.position.pixels >=
        (vm.scrollController.position.maxScrollExtent - 100);

    if (_isUserAtBottom != isAtBottom) {
      setState(() {
        _isUserAtBottom = isAtBottom;
      });
    }

    if (_showScrollToBottomButton == isAtBottom) {
      setState(() {
        _showScrollToBottomButton = !isAtBottom;
      });
    }
  }

  void _scrollToBottom() {
    if (vm.scrollController.hasClients) {
      vm.scrollController.animateTo(
        vm.scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  void didChangeMetrics() {
    final bottomInset = WidgetsBinding.instance.window.viewInsets.bottom;
    if (bottomInset > 0 && _isUserAtBottom) {
      // only auto-scroll if user is already at bottom
      Future.delayed(const Duration(milliseconds: 200), () {
        _scrollToBottom();
      });
    }
    super.didChangeMetrics();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    vm.scrollController.removeListener(_scrollListener);
    vm.messageController.dispose();
    vm.scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (vm.messageController.text.trim().isNotEmpty) {
      final sentText = vm.messageController.text.trim();
      final timestamp = DateTime.now();

      final uniqueId = "${vm.userId}_${sentText}_${timestamp.millisecondsSinceEpoch}";
      vm.processedMessageIds.add(uniqueId);

      final newMessage = ChatMessage(
        text: sentText,
        isMe: true,
        timestamp: timestamp,
        status: MessageStatus.sending,
        translation: vm.translation,
      );

      print("📤 Sending message:");
      print("   - text: $sentText");
      print("   - userId: ${vm.userId}");
      print("   - driverId: ${vm.driverId}");
      print("   - reqID: ${vm.reqID}");
      print("   - uniqueId: $uniqueId");

      setState(() {
        vm.messages.add(newMessage);
      });

      vm.messageController.clear();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });

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
            // Chat Messages with proper ordering
            Expanded(
              child: Stack(
                children: [
                  if (_isLoadingHistory)
                     Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Color(0xFF004D73),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            vm.translation.txt_loading_msg,
                            style: const TextStyle(
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
                        overflow: TextOverflow.clip,
                        textAlign: TextAlign.center,
                      ),
                    )
                  else
                  // KEY CHANGE: Use Column with MainAxisAlignment.end wrapped in SingleChildScrollView
                    SingleChildScrollView(
                      controller: vm.scrollController,
                      physics: const ClampingScrollPhysics(),
                      child: Container(
                        width: double.infinity,
                        constraints: BoxConstraints(
                          minHeight: MediaQuery.of(context).size.height -
                              MediaQuery.of(context).padding.top -
                              MediaQuery.of(context).padding.bottom -
                              200, // Approximate header + input height
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            // Add some top padding to ensure messages don't stick to top
                            const SizedBox(height: 20),
                            // Build messages in chronological order
                            ...vm.messages.map((message) => Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 6
                              ),
                              child: ChatBubble(
                                message: message,
                                onRetry: () {
                                  setState(() {
                                    message.status = MessageStatus.sending;
                                  });
                                  vm.messagePostWithText(message.text)
                                      .then((success) {
                                    if (mounted) {
                                      setState(() {
                                        message.status = success
                                            ? MessageStatus.sent
                                            : MessageStatus.failed;
                                      });
                                    }
                                  });
                                },
                              ),
                            )).toList(),
                            // Add bottom padding
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),

                  // Floating Down Arrow Button
                  if (_showScrollToBottomButton && !_isLoadingHistory)
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: FloatingActionButton(
                        onPressed: _scrollToBottom,
                        backgroundColor: CustomColors.svgImageColorDarkBlue,
                        foregroundColor: Colors.white,
                        elevation: 4,
                        mini: true,
                        heroTag: "scrollToBottom",
                        child: const Icon(
                          Icons.keyboard_arrow_down,
                          size: 24,
                        ),
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
                    color: Colors.black.withValues(alpha: 0.1),
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
                  border: Border.all(
                    color: CustomColors.primaryColor,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: vm.messageController,
                        decoration:  InputDecoration(
                          hintText: vm.translation.txt_type_your_message,
                          contentPadding:
                          const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          border: InputBorder.none,
                          hintStyle: const TextStyle(
                              color: Color(0xFFD9D9D9),
                              fontWeight: FontWeight.w400,
                              fontSize: 16),
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
                            child: SvgPicture.asset(CustomImages.ic_send_msg))),
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
  TranslationModel translation;

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

  const ChatBubble({super.key, required this.message, this.onRetry});

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
    return Row(
      mainAxisAlignment:
      message.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: [
        Flexible(
          child: Column(
            crossAxisAlignment:
            message.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.75,
                ),
                child: Container(
                  padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: message.isMe
                        ? const Color(0xFFD3F0FF)
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
                        color: Colors.black.withOpacity(0.1),
                        spreadRadius: 0,
                        blurRadius: 2,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        message.text,
                        style:
                        Theme.of(context).textTheme.bodyMedium?.copyWith(
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
                              const Icon(Icons.access_time,
                                  size: 14, color: Colors.grey),
                            if (message.status == MessageStatus.sent)
                              const Icon(Icons.check,
                                  size: 14, color: Colors.green),
                            if (message.status == MessageStatus.failed)
                              GestureDetector(
                                onTap: onRetry,
                                child: const Icon(Icons.error,
                                    size: 14, color: Colors.red),
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
    );
  }
}