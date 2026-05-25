import 'dart:math';

import 'package:flutter/material.dart';
import 'package:user/ui/tripscreen/trip_screen_vm.dart';

import '../utils/custom_colors.dart';

class SliderButton extends StatefulWidget {
  final double height;
  final Function() onCompleted;
  final Icon icon;
  final Color? sliderIconColor;
  final String text;
  final TripScreenVm? vm;

  const SliderButton(
      {super.key,
      this.height = 70,
      required this.onCompleted,
      required this.icon,
      this.sliderIconColor,
      required this.text,
      this.vm});
  @override
  State<SliderButton> createState() => _SliderButtonState();
}

class _SliderButtonState extends State<SliderButton>
    with TickerProviderStateMixin {
  double _dx = 0;
  double _maxDx = 0;
  double _endDx = 0;
  double _dz = 1;
  final GlobalKey _containerKey = GlobalKey();
  final GlobalKey _sliderKey = GlobalKey();
  double? _initialContainerWidth, _containerWidth;
  double _checkAnimationDx = 0;

  double get _progress => _dx == 0 ? 0 : _dx / _maxDx;
  late AnimationController _cancelAnimationController,
      _resizeAnimationController,
      _shrinkAnimationController,
      _checkAnimationController;

  bool isSubmitted = false;

  @override
  void initState() {
    super.initState();
    _cancelAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _resizeAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _checkAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _shrinkAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final RenderBox containerBox =
          _containerKey.currentContext!.findRenderObject() as RenderBox;
      _containerWidth = containerBox.size.width;
      _initialContainerWidth = _containerWidth;

      final RenderBox sliderBox =
          _sliderKey.currentContext!.findRenderObject() as RenderBox;
      final sliderWidth = sliderBox.size.width;
      _maxDx = _containerWidth! - (sliderWidth / 2) - widget.height+10 ;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.rotationY(0),
      child: Container(
        key: _containerKey,
        padding: const EdgeInsets.symmetric(horizontal: 5),
        height: widget.height,
        width: _containerWidth,
        constraints: _containerWidth != null
            ? null
            : BoxConstraints.expand(
                height: widget.height, width: double.infinity),
        decoration: BoxDecoration(
            color: isSubmitted ? CustomColors.primaryColor : null,
            gradient:isSubmitted?null: const LinearGradient(
              colors: [CustomColors.clr_FFF3A3A, CustomColors.clr_000000],
              begin: Alignment.topLeft,
              end: Alignment(0.6, 1),
            ),
            borderRadius: BorderRadius.circular(40)),
        child: isSubmitted
            ? Transform(
                alignment: Alignment.center,
                transform: Matrix4.rotationY(0),
                child: Center(
                  child: Stack(
                    clipBehavior: Clip.antiAlias,
                    children: <Widget>[
                      const Icon(
                        Icons.done,
                        color: Colors.black,
                      ),
                      Positioned.fill(
                        right: 0,
                        child: Transform(
                          transform:
                              Matrix4.rotationY(_checkAnimationDx * (pi / 2)),
                          alignment: Alignment.centerRight,
                          child: Container(
                            color: CustomColors.primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            : Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  Text(widget.text,
                      textAlign: TextAlign.center,
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge?.copyWith(fontSize: 16)
                          .copyWith(color: Colors.white)),
                  Positioned(
                    left: 0,
                    child: Transform.scale(
                      scale: _dz,
                      origin: Offset(_dx, 0),
                      child: Transform.translate(
                        offset: Offset(_dx, 0),
                        child: GestureDetector(
                          onHorizontalDragUpdate: onHorizontalDragUpdate,
                          onHorizontalDragEnd: (details) async {
                            _endDx = _dx;
                            if (_progress <= 0.9) {
                              reverseSliderAnimation();
                            } else {
                              await _resizeAnimation();
                              await _shrinkAnimation();
                              await _checkAnimation();
                              await _cancelAnimation();
                            }
                          },
                          child: Container(
                            key: _sliderKey,
                            height: widget.height - 10,
                            width: widget.height - 10,
                            decoration: BoxDecoration(
                                color: widget.sliderIconColor ??Colors.black,
                                shape: BoxShape.circle),
                            child: Center(
                              child: widget.icon,
                            ),
                          ),
                        ),
                      ),
                    ),
                  )
                ],
              ),
      ),
    );
  }

  Future _resizeAnimation() async {
    _resizeAnimationController.reset();

    final animation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(
      parent: _resizeAnimationController,
      curve: Curves.easeInBack,
    ));

    animation.addListener(() {
      if (mounted) {
        setState(() {
          _dz = 1 - animation.value;
        });
      }
    });
    await _resizeAnimationController.forward();
  }

  Future<void> reverseSliderAnimation() async {
    _cancelAnimationController.reset();
    final animation = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(
        parent: _cancelAnimationController, curve: Curves.easeInOut));
    animation.addListener(() {
      if (mounted) {
        setState(() {
          _dx = (_endDx - (_endDx * animation.value));
        });
      }
    });
    _cancelAnimationController.forward();
  }

  void onHorizontalDragUpdate(DragUpdateDetails details) {
    setState(() {
      _dx = (_dx + details.delta.dx).clamp(0.0, _maxDx);
    });
  }

  Future _shrinkAnimation() async {
    _shrinkAnimationController.reset();

    final diff = _initialContainerWidth! - widget.height;
    final animation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(
      parent: _shrinkAnimationController,
      curve: Curves.easeOutCirc,
    ));

    animation.addListener(() {
      if (mounted) {
        setState(() {
          _containerWidth = _initialContainerWidth! - (diff * animation.value);
        });
      }
    });
    setState(() {
      isSubmitted = true;
    });
    await _shrinkAnimationController.forward();

  }

  Future _checkAnimation() async {
    _checkAnimationController.reset();

    final animation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(
      parent: _checkAnimationController,
      curve: Curves.slowMiddle,
    ));

    animation.addListener(() {
      if (mounted) {
        setState(() {
          _checkAnimationDx = animation.value;
        });
      }
    });
    await _checkAnimationController.forward();
    widget.onCompleted();
    reset();
  }

  Future reset() async {
    await _checkAnimationController.reverse();

    isSubmitted = false;

    await _shrinkAnimationController.reverse();

    await _resizeAnimationController.reverse();

    await _cancelAnimation();
  }

  Future _cancelAnimation() async {
    _cancelAnimationController.reset();
    final animation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(
      parent: _cancelAnimationController,
      curve: Curves.fastOutSlowIn,
    ));

    animation.addListener(() {
      if (mounted) {
        setState(() {
          _dx = (_endDx - (_endDx * animation.value));
        });
      }
    });
    _cancelAnimationController.forward();
  }

  @override
  void dispose() {
    _cancelAnimationController.dispose();
    _shrinkAnimationController.dispose();
    _resizeAnimationController.dispose();
    _checkAnimationController.dispose();
    super.dispose();
  }


}
