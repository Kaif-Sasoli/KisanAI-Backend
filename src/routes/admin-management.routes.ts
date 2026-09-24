import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import * as adminManagementController from '../controllers/admin-management.controller'



const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));


// Get Farmers
router.get("/farmers",
    adminManagementController.getAllFarmers
);


// Get Settings
router.get(
    "/system-settings",
    adminManagementController.getSystemSettings
);

router.put(
    "/system-settings",
    adminManagementController.upsertSystemSettings
);

router.put(
    "/system-settings/single",
    adminManagementController.upsertSystemSetting
);




// Get a Farmer
router.get("/:farmerId",
    adminManagementController.getFarmerDetails
);

// Get a Farmer
router.delete("/:farmerId",
    adminManagementController.deleteFarmer
);

// Delete a Setting by Key
router.delete(
    "/settings/:key",
    adminManagementController.deleteSystemSetting
);


export default router;  