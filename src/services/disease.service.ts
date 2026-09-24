import axios from "axios";
import FormData from "form-data";
import { DiseasePredictionResult } from "../types/predict.types.js";


export const predictDiseaseService = async (
    imageBuffer: Buffer,
    originalName: string,
    mimetype: string,
    model: "mobilenet" | "efficientnet"
): Promise<DiseasePredictionResult> => {
    try {
        const formData = new FormData();
        formData.append("image", imageBuffer,
            {
                filename: originalName,
                contentType: mimetype,
            }
        );

        const apiUrl = `${process.env.FASTAPI_URL}/disease/${model}`;

        const response = await axios.post(
            apiUrl,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 60000,
            }
        );
        return response.data;

    } catch (error: any) {
        throw new Error("Disease prediction service is currently unavailable");
    }
};