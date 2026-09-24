import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { addSoilDataSchema, updateSoilDataSchema } from "../schema/soil-data.schema";
import * as soilDataController from "../controllers/soil-data.controller";


const router = Router();

// Add soil data
router.post(
    "/field/:fieldId",
    authenticate,
    validate(addSoilDataSchema),
    soilDataController.addSoilData
);

router.patch(
    "/:fieldId/soil-moisture",
    authenticate,
    soilDataController.updateSoilMoistureFromIoTController
);

// Get all soil data
router.get(
    "/field/:fieldId",
    authenticate,
    soilDataController.getSoilData
);


// Delete all soil data
router.delete(
    "/field/:fieldId/all",
    authenticate,
    soilDataController.deleteAllSoilData
);

// Get single soil data
router.get(
    "/:soilDataId",
    authenticate,
    soilDataController.getSingleSoilData
);


// Update soil data
router.patch(
    "/:soilDataId",
    authenticate,
    validate(updateSoilDataSchema),
    soilDataController.updateSoilData
);


// Delete single soil data
router.delete(
    "/:soilDataId",
    authenticate,
    soilDataController.deleteSoilData
);


export default router;