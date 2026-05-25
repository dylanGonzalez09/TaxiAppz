import 'package:flutter/material.dart';

class PlayGround extends StatefulWidget {
  const PlayGround({super.key});

  @override
  State<PlayGround> createState() => _PlayGroundState();
}

class _PlayGroundState extends State<PlayGround> {
  bool data = false;
  bool dataTwo = false;

  @override
  void didChangeDependencies() {
    print("didchange dependies");
    super.didChangeDependencies();
  }

  @override
  void didUpdateWidget(covariant PlayGround oldWidget) {
    print("did update widget");
    super.didUpdateWidget(oldWidget);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Column(
          children: [
            Container(
              height: 15,
              width: 20000000,
              color: Colors.red,
            ),
            ElevatedButton(
                onPressed: () {
                  setState(() {

                  });
                },
                child: const Text("first button")),
         const  Text("data") ,
            const SecondPage(),

            ElevatedButton(
                onPressed: () {
                  setState(() {
                    dataTwo = !dataTwo;
                  });
                },
                child: const Text("third button")),

            StateTwo(changedData: dataTwo, child: const PageThree())
          ],
        ),
      ),
    );
  }
}

class SecondPage extends StatefulWidget {


  const SecondPage({super.key});

  @override
  State<SecondPage> createState() => _SecondPageState();
}

class _SecondPageState extends State<SecondPage> {
  @override
  void didChangeDependencies() {
    print("second didChange didChangeDependencies");
    super.didChangeDependencies();
  }

  @override
  void didUpdateWidget(covariant SecondPage oldWidget) {
    print("second didupdate widget");
    setState(() {
      data = !data;
    });
    super.didUpdateWidget(oldWidget);
  }
  bool data = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (data) const Text("data"),
        ElevatedButton(onPressed: () {}, child: const Text("hellow world")),
      ],
    );
  }
}

class PageThree extends StatefulWidget {
  const PageThree({super.key});

  @override
  State<PageThree> createState() => _PageThreeState();
}

class _PageThreeState extends State<PageThree> {

  @override
  void didChangeDependencies() {
    print("didChangeDependencies three");
    super.didChangeDependencies();
  }
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (StateTwo.of(context)?.changedData == true) const Text("third text")
      ],
    );
  }
}

class StateTwo extends InheritedWidget {
  final bool changedData;

  const StateTwo({super.key, required this.changedData, required super.child});

  static StateTwo? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<StateTwo>();
  }

  @override
  bool updateShouldNotify(StateTwo oldWidget) {
    return oldWidget.changedData != changedData;
  }
}
