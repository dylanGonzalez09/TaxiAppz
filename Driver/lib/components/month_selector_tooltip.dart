import 'dart:async';

import 'package:flutter/material.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

import '../utils/custom_colors.dart';

class MonthSelectorTooltip extends CustomPainter {
  final Size size;
  final Color color;
  final bool isInverted;

  MonthSelectorTooltip({
    required this.size,
    required this.color,
    required this.isInverted,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();

    if (isInverted) {
      path.moveTo(0.0, size.height);
      path.lineTo(size.width / 2, 0.0);
      path.lineTo(size.width, size.height);
    } else {
      path.moveTo(0.0, 0.0);
      path.lineTo(size.width / 2, size.height);
      path.lineTo(size.width, 0.0);
    }

    path.close();

    canvas.drawShadow(path, Colors.black, 4.0, false);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class TooltipArrow extends StatelessWidget {
  final Size size;
  final Color color;
  final bool isInverted;

  const TooltipArrow({
    super.key,
    this.size = const Size(16.0, 16.0),
    this.color = Colors.white,
    this.isInverted = false,
  });

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: Offset(-size.width / 2, 0.0),
      child: CustomPaint(
        size: size,
        painter: MonthSelectorTooltip(
          size: size,
          color: color,
          isInverted: isInverted,
        ),
      ),
    );
  }
}

// A tooltip with text, action buttons, and an arrow pointing to the target.
class AnimatedMonthSelectedToolTip extends StatefulWidget {
  final GlobalKey? targetGlobalKey;
  final Duration? delay;
  final ThemeData? theme;
  final Widget? child;
  final Function(String year, String month) onItemSelected;
  final List<String> monthList;
  final List<String> yearList;

  const AnimatedMonthSelectedToolTip({
    super.key,
    this.targetGlobalKey,
    this.theme,
    this.delay,
    this.child,
    required this.onItemSelected,
    required this.monthList,
    required this.yearList,
  }) : assert(child != null || targetGlobalKey != null);

  @override
  State<StatefulWidget> createState() => AnimatedMonthSelectedToolTipState();
}

class AnimatedMonthSelectedToolTipState
    extends State<AnimatedMonthSelectedToolTip>
    with SingleTickerProviderStateMixin {
  late double? _tooltipTop;
  late double? _tooltipBottom;
  late Alignment _tooltipAlignment;
  late Alignment _transitionAlignment;
  bool _isInverted = false;
  Timer? _delayTimer;

  final _arrowSize = const Size(16.0, 16.0);
  final _tooltipMinimumHeight = 140;

  var selectedYearIndex = 0;

  final _overlayController = OverlayPortalController();
  late AnimationController _animationController;
  late final Animation<double> _scaleAnimation = CurvedAnimation(
    parent: _animationController,
    curve: Curves.easeOutBack,
  );

  void _toggle() {
    if (!mounted) return; // Check if the widget is still mounted
    _delayTimer?.cancel();
    _animationController.stop();
    if (_overlayController.isShowing) {
      _animationController.reverse().then((_) {
        _overlayController.hide();
      });
    } else {
      _updatePosition();
      _overlayController.show();
      _animationController.forward();
    }
  }

  void _updatePosition() {
    final Size contextSize = MediaQuery.of(context).size;
    final BuildContext? targetContext = widget.targetGlobalKey != null
        ? widget.targetGlobalKey!.currentContext
        : context;
    final targetRenderBox = targetContext?.findRenderObject() as RenderBox;
    if (targetContext == null) return;
    final targetOffset = targetRenderBox.localToGlobal(Offset.zero);
    final targetSize = targetRenderBox.size;
    // Try to position the tooltip above the target,
    // otherwise try to position it below or in the center of the target.
    final tooltipFitsAboveTarget = targetOffset.dx - _tooltipMinimumHeight >= 0;
    final tooltipFitsBelowTarget =
        targetOffset.dy + targetSize.height + _tooltipMinimumHeight <=
            contextSize.height;
    _tooltipTop = tooltipFitsAboveTarget
        ? null
        : tooltipFitsBelowTarget
            ? targetOffset.dy + targetSize.height
            : null;
    _tooltipBottom = tooltipFitsAboveTarget
        ? contextSize.height - targetOffset.dy
        : tooltipFitsBelowTarget
            ? null
            : targetOffset.dy + targetSize.height / 2;
    // If the tooltip is below the target, invert the arrow.
    _isInverted = _tooltipTop != null;
    // Align the tooltip horizontally relative to the target.
    _tooltipAlignment = Alignment(
      (targetOffset.dx) / (contextSize.width - targetSize.width) * 2 - 1.0,
      _isInverted ? 1.0 : -1.0,
    );
    // Make the tooltip appear from the target.
    _transitionAlignment = Alignment(
      (targetOffset.dx + targetSize.width / 2) / contextSize.width * 2 - 1.0,
      _isInverted ? -1.0 : 1.0,
    );
    // Center the arrow horizontally on the target.
  }

  @override
  void initState() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.delay != null) {
        _delayTimer = Timer(widget.delay!, _toggle);
      }
    });
  }

  @override
  void dispose() {
    _delayTimer?.cancel();
    _animationController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // If no theme is provided,
    // use the opposite brightness of the current theme to make the tooltip stand out.
    final theme = widget.theme ??
        ThemeData(
          useMaterial3: true,
          brightness: Theme.of(context).brightness == Brightness.light
              ? Brightness.dark
              : Brightness.light,
        );

    return OverlayPortal.targetsRootOverlay(
      controller: _overlayController,
      child: widget.child != null
          ? GestureDetector(onTap: _toggle, child: widget.child)
          : null,
      overlayChildBuilder: (context) {
        return Positioned(
          top: _tooltipTop,
          bottom: _tooltipBottom,
          // Provide a transition alignment to make the tooltip appear from the target.
          child: ScaleTransition(
            alignment: _transitionAlignment,
            scale: _scaleAnimation,
            // TapRegion allows the tooltip to be dismissed by tapping outside of it.
            child: TapRegion(
              onTapOutside: (PointerDownEvent event) {
                _toggle();
              },
              // If no theme is provided, a theme with inverted brightness is used.
              child: SizedBox(
                width: MediaQuery.of(context).size.width,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: Dimensions.padding_10),
                    Align(
                      alignment: _tooltipAlignment,
                      child: IntrinsicWidth(
                        child: Material(
                          elevation: 4.0,
                          color: Colors.white,
                          borderRadius:
                              BorderRadius.circular(Dimensions.padding_10),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: Dimensions.padding_10,
                                vertical: Dimensions.padding_5),
                            child: Column(
                              children: [
                                SizedBox(
                                  height: 200,
                                  width: 140,
                                  child: Column(
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          SizedBox(
                                            height: 35,
                                            width: 40,
                                            child: InkWell(
                                              onTap: () {
                                                if (selectedYearIndex > 0) {
                                                  setState(() {
                                                    selectedYearIndex -= 1;
                                                  });
                                                }
                                              },
                                              child: const Icon(
                                                Icons
                                                    .arrow_back_ios_new_rounded,
                                                size: 12,
                                              ),
                                            ),
                                          ),
                                          Center(
                                              child: Text(
                                            widget.yearList[selectedYearIndex],
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall,
                                          )),
                                          SizedBox(
                                            height: 35,
                                            width: 40,
                                            child: InkWell(
                                              onTap: () {
                                                if (selectedYearIndex <
                                                    widget.yearList.length -
                                                        1) {
                                                  setState(() {
                                                    selectedYearIndex += 1;
                                                  });
                                                }
                                              },
                                              child: const Icon(
                                                Icons.arrow_forward_ios_rounded,
                                                size: 12,
                                              ),
                                            ),
                                          )
                                        ],
                                      ),
                                      Container(
                                          height: 1,
                                          width: double.infinity,
                                          color: CustomColors.clr_AAAAAA),
                                      const SizedBox(
                                          height: Dimensions.padding_10),
                                      Expanded(
                                          child: ListView.builder(
                                        itemBuilder: (context, index) {
                                          return Center(
                                            child: InkWell(
                                              onTap: () {
                                                widget.onItemSelected(
                                                    widget.yearList[
                                                        selectedYearIndex],
                                                    widget.monthList[index]);
                                                _toggle();
                                              },
                                              child: Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          bottom: Dimensions
                                                              .padding_10),
                                                  child: Text(
                                                    widget.monthList[index],
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodySmall,
                                                  )),
                                            ),
                                          );
                                        },
                                        itemCount: widget.monthList.length,
                                      ))
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
