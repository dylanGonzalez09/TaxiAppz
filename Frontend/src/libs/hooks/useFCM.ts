"use client";
import { useEffect, useRef, useState } from "react";

import type { MessagePayload } from "firebase/messaging";
import { onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

import useFCMToken from "./useFCMToken";
import { messaging } from "../firebase";

const useFCM = () => {
  const fcmToken = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const listenerAdded = useRef(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && !listenerAdded.current) {
      const fcmmessaging = messaging();

      const unsubscribe = onMessage(fcmmessaging, (payload) => {
        // Generate unique ID for each notification to prevent duplicates
        const notificationId = `notif-${Date.now()}`;
        
        toast(payload.notification?.title || 'New notification', {
          toastId: notificationId, // Unique ID for each toast
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,

          // Stack notifications vertically
          style: { 
            marginBottom: '8px',
            width: '300px',
            background: 'white',
            color: 'black' ,
          }
        });
        
        setMessages((prev) => [...prev, payload]);
      });

      return () => {
        unsubscribe();
        listenerAdded.current = false;
      }
    }
  }, [fcmToken]);
  
  return { fcmToken, messages };
};

export default useFCM;