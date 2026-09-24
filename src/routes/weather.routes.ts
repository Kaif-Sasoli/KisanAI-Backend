import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getWeather } from "../controllers/weather.controller";


const router = Router();

// Get Weather
router.get(
    "/",
    authenticate,
    getWeather
);


export default router;
