// import 'package:flutter/gestures.dart';
// import 'package:flutter/material.dart';
//
// class ReadMoreText extends StatefulWidget {
//   final String text;
//   final int maxLines;
//
//   const ReadMoreText({super.key, required this.text, this.maxLines = 4});
//
//   @override
//   _ReadMoreTextState createState() => _ReadMoreTextState();
// }
//
// class _ReadMoreTextState extends State<ReadMoreText> {
//   bool isExpanded = false;
//
//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: const EdgeInsets.symmetric(horizontal: 20),
//       child: LayoutBuilder(
//         builder: (context, size) {
//           final span = TextSpan(
//             text: widget.text,
//             style: Theme.of(context).textTheme.bodySmall,
//           );
//
//           final tp = TextPainter(
//             text: span,
//             maxLines: isExpanded ? null : widget.maxLines,
//             textDirection: TextDirection.ltr,
//           );
//
//           tp.layout(maxWidth: size.maxWidth);
//
//           if (tp.didExceedMaxLines) {
//             return Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: <Widget>[
//                 RichText(
//                   text: TextSpan(
//                     text: isExpanded ? widget.text : widget.text.substring(0, tp.getPositionForOffset(Offset(size.maxWidth, tp.height)).offset) + '...',
//                     style: Theme.of(context).textTheme.bodySmall,
//                     children: <TextSpan>[
//                       if (!isExpanded)
//                         TextSpan(
//                           text: ' more',
//                           style: TextStyle(color: Colors.blue),
//                           recognizer: TapGestureRecognizer()
//                             ..onTap = () {
//                               setState(() {
//                                 isExpanded = true;
//                               });
//                             },
//                         ),
//                     ],
//                   ),
//                 ),
//                 if (isExpanded)
//                   GestureDetector(
//                     onTap: () {
//                       setState(() {
//                         isExpanded = false;
//                       });
//                     },
//                     child: Text(
//                       ' less',
//                       style: TextStyle(color: Colors.blue),
//                     ),
//                   ),
//               ],
//             );
//           } else {
//             return Text(
//               widget.text,
//               style: Theme.of(context).textTheme.bodySmall,
//             );
//           }
//         },
//       ),
//     );
//   }
// }