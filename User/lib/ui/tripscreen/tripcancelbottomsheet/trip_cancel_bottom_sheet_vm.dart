
import '../../../utils/base_vm.dart';

class TripCancelBottomSheetVm extends BaseVm{
  List<String> reason= [
    "Excepted a shorter wait time",
    "Booked another ride",
    "Driver denied ride",
    "Unable to contact driver",
    "My reason is not listed"
  ];
  int selectedCancelReason = -1;
}