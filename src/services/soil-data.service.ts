import { prisma } from "../lib/prisma.js";
import { getSoilMoistureFromIoT } from "./soil-moisture.service.js";


export const updateSoilMoistureFromIoT = async (fieldId: string) => {

    // Get the latest soil record
    const latestSoilData = await prisma.soilData.findFirst({
        where: {
            fieldId
        },
        orderBy: {
            recordedAt: "desc"
        }
    });

    if (!latestSoilData) {
        throw new Error("No soil data found. Please add soil data manually first.");
    }

    // Get moisture from IoT
    const soilMoisture = await getSoilMoistureFromIoT(fieldId);

    // Create a new record
    const soilData = await prisma.soilData.create({
        data: {
            fieldId,
            nitrogen: latestSoilData.nitrogen,
            phosphorus: latestSoilData.phosphorus,
            potassium: latestSoilData.potassium,
            soilPH: latestSoilData.soilPH,
            organicCarbon: latestSoilData.organicCarbon,
            soilMoisture,
            recordedAt: new Date()
        }
    });

    return soilData;
};