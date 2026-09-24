import { prisma } from "../lib/prisma";

export const findFarmerField = async (
    userId: string | undefined,
    fieldId: string
) => {
    if (!userId) {
        return null;
    }

    return prisma.field.findFirst({
        where: {
            id: fieldId,
            farmer: {
                userId
            }
        }
    });
};