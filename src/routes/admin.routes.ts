import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { UserRole } from "../../generated/prisma/enums";
import upload from '../middleware/upload.middleware.js'
import * as adminController from "../controllers/admin.controller"

const router = Router();


router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Get Admin Account
router.get("/account",
    adminController.getAdminAccount
);

// Update Admin Account
router.patch("/update",
    upload.single("profileImage"),
    adminController.updateAdminAccount
);

// Update Profile Image
router.patch(
    "/profile-image",
    upload.single("profileImage"),
    adminController.updateAdminProfileImage
);

// Delete Profile Image
router.delete(
    "/profile-image",
    adminController.deleteAdminProfileImage
);


export default router;