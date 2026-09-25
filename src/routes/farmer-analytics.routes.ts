import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { UserRole } from "../../generated/prisma/enums.js";
import * as farmerAnalyticsController from '../controllers/farmer-analytics.controller.js'



const router = Router();

// All routes
router.use(
    authenticate,
    authorize(UserRole.FARMER)
);

// Dashboard
router.get(
    "/dashboard",
    farmerAnalyticsController.getDashboard
);

// Crop Analyitics
router.get(
    "/crops",
    farmerAnalyticsController.getCropAnalytics
);

// Yield Analyitics
router.get(
    "/yield",
    farmerAnalyticsController.getYieldAnalytics
);


// Field Analytics
router.get(
    "/fields",
    farmerAnalyticsController.getFieldAnalytics
);

// Field Analytics
router.get(
    "/soil",
    farmerAnalyticsController.getSoilAnalytics
);



export default router;

