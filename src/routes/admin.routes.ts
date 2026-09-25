import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { UserRole } from "../../generated/prisma/enums.js";
import upload from '../middleware/upload.middleware.js'
import * as adminController from "../controllers/admin.controller.js"

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