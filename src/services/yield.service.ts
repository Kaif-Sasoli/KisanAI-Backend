import axios from "axios";
import { z } from "zod";
import { predictYieldSchema } from '../schema/yield.schema.js'

// Yield Service
export const predictYieldService = async (
    data: z.infer<typeof predictYieldSchema>) => {
    try {
        const apiUrl = `${process.env.FASTAPI_URL}/yield/predict`;

        const response = await axios.post<{ prediction: number }>(
            apiUrl,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 60000,
            }
        );
        return response.data;

    } catch (error: any) {
        throw new Error("Yield prediction service is currently unavailable");
    }
};