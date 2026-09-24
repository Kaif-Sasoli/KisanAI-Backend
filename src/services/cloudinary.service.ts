import cloudinary from "../config/cloudinary.config.js";

interface CloudinaryUploadResult {
    imageUrl: string;
    publicId: string;
}

// Upload Image
export const uploadImage = async (buffer: Buffer, folder: string):
    Promise<CloudinaryUploadResult> => {

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `kisanai/${folder}`,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!result?.secure_url || !result.public_id) {
                    reject(new Error("Cloudinary upload failed"));
                    return;
                }
                resolve({
                    imageUrl: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
};




// Delete Image
export const deleteImage = async (publicId: string): Promise<void> => {
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Failed to delete image from Cloudinary");
    }
};