import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { UserRole } from "../../generated/prisma/enums.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = Router();

router.use(
    authenticate,
    authorize(UserRole.FARMER)
);

// Register Firebase token
router.post(
    "/token",
    notificationController.registerToken
);

// // Remove Firebase token
// router.delete(
//     "/token",
//     notificationController.removeToken
// );

// Get notifications
router.get(
    "/",
    notificationController.getNotifications
);

// Delete All Notifications
router.delete(
    "/all",
    authenticate,
    notificationController.deleteAllNotifications
);

// delete single notification
router.delete(
    "/:notificationId",
    authenticate,
    notificationController.deleteNotification
);

// Mark as read
router.patch(
    "/:notificationId/read",
    notificationController.markAsRead
);

export default router;