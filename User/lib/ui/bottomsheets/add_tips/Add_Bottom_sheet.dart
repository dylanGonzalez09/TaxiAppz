import 'package:flutter/material.dart';

class AddTipBottomSheet extends StatefulWidget {
  const AddTipBottomSheet({super.key});

  @override
  _AddTipBs createState() => _AddTipBs();
}

class _AddTipBs extends State<AddTipBottomSheet> {
  int selectedAmount = 5;
  int selectedPercentage = 10;
  bool isCustomSelected = false;
  bool isAmountSelected = true;

  final TextEditingController customTipController = TextEditingController();

  final List<int> amountList = [1, 2, 5];

  final List<int> percentageList = [
    1,
    2,
    5,
    10,
    15,
  ];

  double tripFare = 25;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        child: SizedBox(
      width: double.infinity,
      child: Padding(
        padding: const EdgeInsets.only(top: 20, left: 30, right: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            /// TITLE
            const Text(
              "Add a Tip",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 5),

            Text(
              "Show appreciation to your driver",
              style: TextStyle(
                color: Colors.grey.shade600,
              ),
            ),

            const SizedBox(height: 20),

            /// DRIVER
            const Column(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundImage: AssetImage(
                    "assets/driver.png",
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  "Ravi Kumar",
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 3),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.star,
                      color: Colors.orange,
                      size: 16,
                    ),
                    SizedBox(width: 3),
                    Text("4.8"),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 25),

            /// CHOOSE AMOUNT
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Choose Amount",
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),

            const SizedBox(height: 10),

            Row(
              children: [
                ...amountList.map((amount) {
                  bool isSelected =
                      selectedAmount == amount && !isCustomSelected;

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(
                        right: 8,
                      ),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            isAmountSelected = true;

                            isCustomSelected = false;

                            selectedAmount = amount;

                            selectedPercentage =
                                ((amount / tripFare) * 100).round();
                          });
                        },
                        child: Container(
                          height: 42,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.green : Colors.white,
                            border: Border.all(
                              color: Colors.green,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            "\$$amount",
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }),

                /// CUSTOM
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        isCustomSelected = true;

                        isAmountSelected = false;
                      });
                    },
                    child: Container(
                      height: 42,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isCustomSelected ? Colors.green : Colors.white,
                        border: Border.all(
                          color: Colors.green,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        "Custom",
                        style: TextStyle(
                          color: isCustomSelected ? Colors.white : Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (isAmountSelected) ...[
              const SizedBox(height: 20),

              /// TIP PRICE
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "\$ ${selectedAmount.toStringAsFixed(2)}",
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    "Trip Fare + Tip ($selectedPercentage%)",
                    style: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              LinearProgressIndicator(
                value: 1,
                minHeight: 3,
                borderRadius: BorderRadius.circular(10),
                color: Colors.green,
                backgroundColor: Colors.green.shade100,
              ),

              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: Colors.grey.shade300,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                    ),
                    child: Text(
                      "Or",
                      style: TextStyle(
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: Colors.grey.shade300,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              /// CHOOSE PERCENTAGE
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Choose Percentage",
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: percentageList.map((percentage) {
                  bool isSelected = selectedPercentage == percentage;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(
                        right: 8,
                      ),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedPercentage = percentage;
                            selectedAmount =
                                ((tripFare * percentage) / 100).round();
                          });
                        },
                        child: Container(
                          height: 42,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.green : Colors.white,
                            border: Border.all(
                              color: Colors.green,
                            ),
                            borderRadius: BorderRadius.circular(
                              8,
                            ),
                          ),
                          child: Text(
                            "$percentage%",
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
            if (isCustomSelected) ...[
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: Colors.grey.shade300,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                    ),
                    child: Text(
                      "Or",
                      style: TextStyle(
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: Colors.grey.shade300,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              /// CHOOSE PERCENTAGE
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Choose Percentage",
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: percentageList.map((percentage) {
                  bool isSelected = selectedPercentage == percentage;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(
                        right: 8,
                      ),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedPercentage = percentage;
                            selectedAmount =
                                ((tripFare * percentage) / 100).round();
                          });
                        },
                        child: Container(
                          height: 42,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.green : Colors.white,
                            border: Border.all(
                              color: Colors.green,
                            ),
                            borderRadius: BorderRadius.circular(
                              8,
                            ),
                          ),
                          child: Text(
                            "$percentage%",
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 10),

              /// TIP PRICE
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "\$ ${selectedAmount.toStringAsFixed(2)}",
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    "Trip Fare + Tip ($selectedPercentage%)",
                    style: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              LinearProgressIndicator(
                value: 1,
                minHeight: 3,
                borderRadius: BorderRadius.circular(10),
                color: Colors.green,
                backgroundColor: Colors.green.shade100,
              ),

              const SizedBox(height: 20),
            ],

            const SizedBox(height: 20),

            /// CARD
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(
                        10,
                      ),
                    ),
                    child: const Icon(
                      Icons.credit_card,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Paying with •••• 4587",
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Tips are available only for card payments",
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 25),

            /// BUTTONS
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade50,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            30,
                          ),
                        ),
                      ),
                      child: const Text(
                        "No Tip",
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            30,
                          ),
                        ),
                      ),
                      child: const Text(
                        "Add Tip",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 25),
          ],
        ),
      ),
    ));
  }
}
