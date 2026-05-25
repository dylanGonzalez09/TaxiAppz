
import '../../base/base_vm.dart';

class UpdateAppVm extends BaseVm {

  bool isDisposed = false;

    @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

}