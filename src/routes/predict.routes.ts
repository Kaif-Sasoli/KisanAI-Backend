import { Router } from "express";
import upload from '../middleware/upload.middleware.js'
import * as predict from "../controllers/predict.controller.js";

const router = Router();

// Predict Disease
router.post("/disease",
    upload.single('image'),
    predict.predictDisease
);


// Predict Yield
router.post("/yield",
    predict.predictYield
);


export default router;