import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import * as adminAnalyticsController from '../controllers/admin-analytics.controller'



const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));


// Admin Dashboard
router.get("/dashboard",
    adminAnalyticsController.getAdminDashboard);

// Overview Analytics
router.get("/overview",
    adminAnalyticsController.getAdminOverviewAnalytics);

// User Analytics
router.get("/users",
    adminAnalyticsController.getAdminUserAnalytics);

// Farmer Analytics
router.get("/farmers",
    adminAnalyticsController.getAdminFarmerAnalytics);

// Fields Analytics
router.get("/fields",
    adminAnalyticsController.getAdminFarmerAnalytics);

// Crop Analytics
router.get("/crops",
    adminAnalyticsController.getAdminCropAnalytics);

// Disease Analytics
router.get("/diseases",
    adminAnalyticsController.getAdminDiseaseAnalytics);

// Yield Analytics
router.get("/yield",
    adminAnalyticsController.getAdminYieldAnalytics);

// Soil Analytics
router.get("/soil",
    adminAnalyticsController.getAdminSoilAnalytics);

// Weather Analytics
router.get("/weather",
    adminAnalyticsController.getAdminWeatherAnalytics);


export default router;  