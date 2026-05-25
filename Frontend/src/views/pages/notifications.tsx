// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { useState } from 'react';

// import { useNotification } from '../../hooks/useNotification';

// const NotificationsPage = () => {
//   const { token } = useNotification();
//   const [isSubscribed, setIsSubscribed] = useState(false);

//   return (
//     <div>
//       <h1>Push Notifications</h1>
//       {token ? (
//         <>
//           <p>Your device is registered for push notifications</p>
//           <p>Token: {token}</p>
//         </>
//       ) : (
//         <button onClick={() => {
//           Notification.requestPermission().then(permission => {
//             if (permission === 'granted') {
//               setIsSubscribed(true);
//             }
//           });
//         }}>
//           Enable Push Notifications
//         </button>
//       )}
//     </div>
//   );
// };

// export default NotificationsPage;