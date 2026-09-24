import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import upload from '../middleware/upload.middleware.js'
import { UserRole } from "../../generated/prisma/enums.js";
import { updateAccountSchema } from "../schema/farmer.schema.js";
import * as  farmerControler from "../controllers/farmer.controller.js"


const router = Router();

// All routes
router.use(
    authenticate,
    authorize(UserRole.FARMER)
);


// Get Farmer Account
router.get(
    "/account",
    farmerControler.getAccount
);


// Update Farmer Account  
router.patch(
    "/account",
    upload.single("profileImage"),
    validate(updateAccountSchema),
    farmerControler.updateAccount
);

// Delete Profile Image
router.delete(
    "/account/profile-image",
    farmerControler.deleteProfileImage
);

// Delete Account
router.delete(
    "/account",
    farmerControler.deleteAccount
);
export default router;