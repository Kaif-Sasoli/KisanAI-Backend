import { firebaseMessaging } from "../config/firebase.config.js";
import { PushNotification } from "../types/notification.types.js";


/**
 * Sends a push notification to a specific device using Firebase Cloud Messaging (FCM).
 *
 * @param token - FCM device registration token of the recipient.
 * @param title - Notification title displayed to the user.
 * @param body - Notification message displayed to the user.
 * @param data - Optional custom key-value data sent with the notification.
 *
 * @returns An object containing the notification status and FCM message ID.
 */

export const sendPushNotification = async ({
    token,
    title,
    body,
    data = {},
}: PushNotification) => {

    try {
        const response = await firebaseMessaging.send({
            token,
            notification: { title, body, },
            data,
            // Android
            android: {
                priority: "high",
                notification: {
                    sound: "default",
                    channelId: "high_importance_channel",
                    priority: "high",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                },
            },
            // iOS
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1,
                    },
                },
            },
            // Web
            webpush: {
                notification: {
                    title,
                    body,
                    icon: "/icons/notification-icon.png",
                },
            },
        });

        return { success: true, messageId: response };

    } catch (error: any) {
        console.error("Firebase push notification error:", error);
        return { success: false, messageId: null };
    }
};