import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getWeather } from "../controllers/weather.controller.js";


const router = Router();

// Get Weather
router.get(
    "/",
    authenticate,
    getWeather
);


export default router;
