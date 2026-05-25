
import '../../../main.dart';
import '../../../utils/base_vm.dart';

class RightConfirmVm extends BaseVm{
  int hourPackage = 1;
  int distanceCount = 1;

  void showVehicle() async {
    if (navigatorKey.currentState != null) {
    }
  }

  // void showVehicle() async {
  //   if (navigatorKey.currentState != null) {
  //     // DraggableScrollableSheet(
  //     //   initialChildSize: .8,
  //     //   minChildSize: .1,
  //     //   maxChildSize: .6,
  //     //   builder: (BuildContext context, ScrollController scrollController) {
  //     //     return  const SingleChildScrollView(
  //     //       child: RightConfirmBs(),
  //     //     );
  //     //   },
  //     // );
  //
  //     // final response = await showModalBottomSheet(
  //     //
  //     //   context: navigatorKey.currentState!.context,
  //     //   isScrollControlled: true, // Allows the bottom sheet to fit content size
  //     //   backgroundColor: Colors.white,
  //     //   builder: (BuildContext context) {
  //     //     return const SingleChildScrollView(
  //     //       child: RightConfirmBs(),
  //     //     );
  //     //   },
  //     // );
  //     final response = await showModalBottomSheet(
  //       context: navigatorKey.currentState!.context,
  //       isScrollControlled: true,
  //       backgroundColor: Colors.white,
  //       builder: (BuildContext context) {
  //         return SingleChildScrollView(
  //           child: RightConfirmBs(),
  //         );
  //       },
  //     );
  //   }
  // }


  void decreaseHour(){
    if(hourPackage>1){
      hourPackage--;
    }
    notifyListeners();
  }

  void increaseHour(){
    hourPackage++;
    notifyListeners();
  }

}