import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as yieldController from "../controllers/predict-yield.controller.js";
import { predictYieldSchema_ } from "../schema/yield.schema.js";

const router = Router();


// Predict yield
router.post(
    "/predict",
    authenticate,
    validate(predictYieldSchema_),
    yieldController.predictYield
);


// Get all yield predictions
router.get(
    "/",
    authenticate,
    yieldController.getYieldPredictions
);


// Delete all yield predictions
router.delete(
    "/all",
    authenticate,
    yieldController.deleteAllYieldPredictions
);


// Get one yield prediction
router.get(
    "/:predictionId",
    authenticate,
    yieldController.getYieldPrediction
);


// Delete one yield prediction
router.delete(
    "/:predictionId",
    authenticate,
    yieldController.deleteYieldPrediction
);


export default router;