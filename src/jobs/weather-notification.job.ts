import cron from "node-cron";
import { processTestNotifications } from "../services/notification.service.js";
import { processWeatherNotifications } from "../services/weather-notification.service.js";

export const startNotificationJob = () => {

    cron.schedule("0 */3 * * *", async () => {

        try {
            // await processTestNotifications();
            await processWeatherNotifications();

        } catch (error) {
            console.error("Test notification job failed:", error);
        }
    });
    console.log("Test notification scheduler started.");
};