export const getSoilMoistureFromIoT = async (
    fieldId: string
): Promise<number> => {

    // TEMPORARY VALUE
    // Replace this later with actual IoT sensor/API
    console.log(`Getting soil moisture for field: ${fieldId}`);

    return 35;
};