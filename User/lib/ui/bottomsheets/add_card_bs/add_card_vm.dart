import 'package:flutter/cupertino.dart';

import '../../../utils/base_vm.dart';

class AddCardVm extends BaseVm {
  final TextEditingController cardNameController = TextEditingController();
  final TextEditingController cardExpireController = TextEditingController();
  final TextEditingController cardCCVController = TextEditingController();
  final TextEditingController cardHolderNameController = TextEditingController();
}