import 'package:flutter/material.dart';
import '../../../utils/custom_colors.dart';

class IntroPageView extends StatefulWidget {
  final List<Widget> pages;

  const IntroPageView({super.key, required this.pages});

  @override
  State<IntroPageView> createState() => _IntroPageViewState();
}

class _IntroPageViewState extends State<IntroPageView> {
  final PageController _pageController = PageController();
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.pages.length,
            onPageChanged: (index) {
              setState(() {
                selectedIndex = index;
              });
            },
            itemBuilder: (context, index) {
              return widget.pages[index];
            },
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.pages.length, (index) {
            return InkWell(
              onTap: () {
                _pageController.animateToPage(
                  index,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.only(right: 8),
                width: selectedIndex == index ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: selectedIndex == index
                      ? CustomColors.primaryColor
                      : CustomColors.clr_AAAAAA,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 20),
      ],
    );
  }
}