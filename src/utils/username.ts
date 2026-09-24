export const generateUsername = (name: string) => {
    const cleaned = name
        .toLowerCase()
        .replace(/\s+/g, "");

    const random = Math.floor(
        1000 + Math.random() * 9000
    );

    return `${cleaned}${random}`;
};