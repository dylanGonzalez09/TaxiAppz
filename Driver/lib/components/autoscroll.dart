import 'dart:async';
import 'package:flutter/cupertino.dart';

class AutoScrollText extends StatefulWidget {
  final String text;
  final TextStyle? style;
  final double height;
  final Duration speed;

  const AutoScrollText({
    super.key,
    required this.text,
    this.style,
    this.height = 22,
    this.speed = const Duration(milliseconds: 30),
  });

  @override
  State<AutoScrollText> createState() => _AutoScrollTextState();
}

class _AutoScrollTextState extends State<AutoScrollText> {
  late final ScrollController _controller;
  Timer? _timer;
  bool _userScrolling = false;

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startAutoScroll();
    });
  }

  void _startAutoScroll() {
    _timer?.cancel();

    _timer = Timer.periodic(widget.speed, (_) {
      if (!_controller.hasClients || _userScrolling) return;

      final maxScroll = _controller.position.maxScrollExtent;
      final nextOffset = _controller.offset + 1;

      if (nextOffset >= maxScroll) {
        _controller.jumpTo(0);
      } else {
        _controller.jumpTo(nextOffset);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      child: NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          if (notification is ScrollStartNotification) {
            _userScrolling = true;
          } else if (notification is ScrollEndNotification) {
            _userScrolling = false;
          }
          return false;
        },
        child: ListView(
          controller: _controller,
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          children: [
            Text(widget.text, style: widget.style),
            const SizedBox(width: 40),
            Text(widget.text, style: widget.style),
            const SizedBox(width: 40),
          ],
        ),
      ),
    );
  }
}
