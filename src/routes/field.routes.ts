import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { addFieldSchema, updateFieldSchema } from "../schema/field.schema.js";
import * as fieldController from '../controllers/field.controller.js'
import { authenticate } from "../middleware/auth.middleware.js";


const router = Router();

// Add Field
router.post(
    "/add-field",
    authenticate,
    validate(addFieldSchema),
    fieldController.addField
);

// Get Fields
router.get(
    "/fields",
    authenticate,
    fieldController.getFields
);

// Delete All Fields
router.delete(
    "/fields/all",
    authenticate,
    fieldController.deleteAllFields
);

// Get Single Field
router.get(
    "/:fieldId",
    authenticate,
    fieldController.getField
);

// Update Single Field
router.patch(
    "/:fieldId",
    authenticate,
    validate(updateFieldSchema),
    fieldController.updateField
);

// Delete Single Field
router.delete(
    "/:fieldId",
    authenticate,
    fieldController.deleteField
);

export default router;