import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from "cookie-parser"

import { PORT } from './config/env.config.js';
import { corsOptions } from './config/env.config.js';
import { startNotificationJob } from "./jobs/weather-notification.job.js";

// Routes
import authRouter from './routes/auth.routes.js'
import verfiyEmail from './routes/verifyemail.routes.js'
import fieldRoutes from './routes/field.routes.js'
import predictDisease from './routes/disease.routes.js'
import cropRoutes from './routes/crop.routes.js'
import soilDataRoutes from './routes/soil-data.routes.js'
import predictRoutes from './routes/predict.routes.js'
import predictYieldRoutes from './routes/yield.routes.js'
import farmerRoutes from './routes/farmer.routes.js'
import farmerAnalyticsRoutes from './routes/farmer-analytics.routes.js'
import adminRoutes from './routes/admin.routes.js'
import adminAnalyticsRoutes from './routes/admin-analytics.routes.js'
import adminManagementController from './routes/admin-management.routes.js'
import notificationRoutes from "./routes/notification.routes.js";
import weatherRoutes from './routes/weather.routes.js'

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
// app.use(cors(corsOptions));

// Test
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Backend is running...",
    });
});

// Test Cookies
app.get("/test-cookies", (req, res) => {
    console.log("Cookies received:", req.cookies);
    return res.status(200).json({
        success: true,
        cookies: req.cookies,
        accessTokenExists: !!req.cookies?.access_token,
        refreshTokenExists: !!req.cookies?.refresh_token
    });
});


// Check Health
app.get("/check-health", async (_, res) => {
    return res.status(200).json({
        success: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        message: "Health is fine.",
    })
});


// Routes
app.use("/auth", authRouter);
app.use("/email", verfiyEmail);
app.use("/field", fieldRoutes);
app.use("/disease", predictDisease);
app.use("/crops", cropRoutes);
app.use("/soil-data", soilDataRoutes);
app.use("/predict", predictRoutes);
app.use("/yield", predictYieldRoutes);
app.use("/farmer", farmerRoutes);
app.use("/farmer/analytics", farmerAnalyticsRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);
app.use("/admin/management", adminManagementController);
app.use("/notifications", notificationRoutes);
app.use("/weather", weatherRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} ... `);
    // startNotificationJob();
});

export default app;

// npx nodemon --exec "npx tsx" src/index.ts