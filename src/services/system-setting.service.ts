// services/system-setting.service.ts

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";


// Get Setting
export const getSetting = async <T>(
    key: string,
    defaultValue: T
): Promise<T> => {

    const setting = await prisma.systemSetting.findUnique({
        where: { key },
    });

    if (!setting) {
        return defaultValue;
    }

    return setting.value as T;
};

// Update Setting
export const updateSetting = async (key: string, value: Prisma.InputJsonValue) => {

    return prisma.systemSetting.upsert({
        where: { key },

        update: {
            value,
        },

        create: {
            key,
            value,
        },
    });
};