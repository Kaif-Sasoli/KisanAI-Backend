import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addCropSchema, updateCropSchema } from "../schema/crop.schema.js";
import * as cropController from "../controllers/crop.controller.js";


const router = Router();

// Add crop to field
router.post(
    "/field/:fieldId",
    authenticate,
    validate(addCropSchema),
    cropController.addCrop
);


// Get all crops of field
router.get(
    "/field/:fieldId",
    authenticate,
    cropController.getCrops
);


// Delete all crops of field
router.delete(
    "/field/:fieldId/all",
    authenticate,
    cropController.deleteAllCrops
);


// Get single crop
router.get(
    "/:cropId",
    authenticate,
    cropController.getCrop
);


// // Update crop
router.patch(
    "/:cropId",
    authenticate,
    validate(updateCropSchema),
    cropController.updateCrop
);


// Delete single crop
router.delete(
    "/:cropId",
    authenticate,
    cropController.deleteCrop
);


export default router;