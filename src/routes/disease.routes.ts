import { Router } from "express";
import * as diseaseController from "../controllers/predict-disease.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    predictDiseaseSchema,
    updateDiseasePredictionSchema,
} from "../schema/disease-prediction.schema.js";

const router = Router();

router.post(
    "/predict",
    authenticate,
    upload.single("image"),
    validate(predictDiseaseSchema),
    diseaseController.predictDisease
);

router.get(
    "/",
    authenticate,
    diseaseController.getDiseasePredictions
);

router.delete(
    "/all",
    authenticate,
    diseaseController.deleteAllDiseasePredictions
);

router.get(
    "/:predictionId",
    authenticate,
    diseaseController.getDiseasePrediction
);


router.delete(
    "/:predictionId",
    authenticate,
    diseaseController.deleteDiseasePrediction
);

export default router;