

import '../../../utils/base_vm.dart';

class FareDetailsBsVm extends BaseVm{
  int hourPackage = 1;
  int distanceCount = 1;

  // void showVehicle() async {
  //   if (navigatorKey.currentState != null) {
  //     final response = await showModalBottomSheet(
  //       context: navigatorKey.currentState!.context,
  //       isScrollControlled: true,
  //       backgroundColor: Colors.white,
  //       builder: (BuildContext context) {
  //         return DraggableScrollableSheet(
  //           initialChildSize: 0.7,
  //           expand: false,
  //           builder: (BuildContext context, ScrollController scrollController) {
  //             return SingleChildScrollView(
  //               controller: scrollController,
  //               child: RightConfirmBs(),
  //             );
  //           },
  //         );
  //       },
  //     );
  //   }
  // }

  // void showFareDetails() async {
  //   if (navigatorKey.currentState != null) {
  //     final response = await showModalBottomSheet(
  //       context: navigatorKey.currentState!.context,
  //       isScrollControlled: true,
  //       backgroundColor: Colors.white,
  //       builder: (BuildContext context) {
  //         return SingleChildScrollView(
  //           child: FareDetailsBs(),
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