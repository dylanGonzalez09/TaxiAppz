"use client";
import { useEffect, useState } from "react";

import { getToken, isSupported } from "firebase/messaging";

import { messaging } from "../firebase";
import useNotificationPermission from "./useNotificationPermission";

const useFCMToken = () => {
  const permission = useNotificationPermission();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const retrieveToken = async () => {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        permission === "granted"
      ) {
        const isFCMSupported = await isSupported();
        
        if (!isFCMSupported) return;

        try {
          const registration = await navigator.serviceWorker.ready;

          const token = await getToken(messaging(), {
            vapidKey: "BKNhJANw8OR-scBolTQe3eqNGIgjnNtqBxcQdmFJnwqcwZoxCzXMJ0rUUWFA1HyoWicbt-G3VdrBkaslYVPuVPU",
            serviceWorkerRegistration: registration,
          });

          if (token) {
            setFcmToken(token);
          } else {
            console.warn("No registration token available.");
          }
        } catch (error) {
          console.error("Error getting FCM token:", error);
        }
      }
    };

    retrieveToken();
  }, [permission]);

  return fcmToken;
};

export default useFCMToken;
