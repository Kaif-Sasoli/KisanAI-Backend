import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import { firebasePrivateKey, projectId, clientEmail } from "../config/env.config.js";


if (!projectId || !clientEmail || !firebasePrivateKey) {
    throw new Error("Firebase environment variables are missing");
}

const firebaseApp = getApps().length === 0
    ? initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: firebasePrivateKey,
        }),
    })
    : getApps()[0];

export const firebaseAdmin = firebaseApp;
export const firebaseMessaging = getMessaging(firebaseApp);