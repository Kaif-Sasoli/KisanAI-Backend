// utils/disease-treatment.utils.ts

export interface DiseaseTreatment {
    prevention: string[];
    treatment: string[];
}

export const diseaseTreatments: Record<string, DiseaseTreatment> = {

    // RICE DISEASES
    "rice_Bacterial Leaf Blight": {
        prevention: [
            "Use healthy and disease-free seed or planting material.",
            "Use rice varieties with resistance to bacterial leaf blight where available.",
            "Avoid excessive nitrogen fertilizer.",
            "Maintain balanced crop nutrition and proper water management.",
            "Monitor the crop regularly for early symptoms."
        ],
        treatment: [
            "Avoid excessive nitrogen fertilizer during disease development.",
            "Maintain proper water and crop management.",
            "Remove or manage heavily infected plant material where practical.",
            "Use an appropriate locally recommended disease-management treatment when necessary.",
            "Monitor nearby plants regularly for further disease spread."
        ]
    },

    "rice_Brown Spot": {
        prevention: [
            "Use healthy and disease-free seed.",
            "Maintain balanced crop nutrition, including adequate potassium.",
            "Avoid nutrient deficiencies that can stress the crop.",
            "Maintain proper field hygiene and water management.",
            "Monitor the crop regularly for early symptoms."
        ],
        treatment: [
            "Correct identified nutrient deficiencies.",
            "Maintain balanced crop nutrition and proper water management.",
            "Manage heavily affected crop material appropriately where practical.",
            "Use an appropriate locally recommended fungicide when disease severity justifies treatment.",
            "Continue monitoring affected plants for further disease development."
        ]
    },

    "rice_Healthy Rice Leaf": {
        prevention: [
            "Continue regular crop monitoring.",
            "Maintain proper irrigation and balanced crop nutrition.",
            "Maintain good field hygiene.",
            "Use healthy planting material.",
            "Follow recommended crop-management practices."
        ],
        treatment: [
            "No disease treatment is required.",
            "Continue normal irrigation and crop management.",
            "Continue regular monitoring for disease symptoms."
        ]
    },

    "rice_Leaf Blast": {
        prevention: [
            "Use rice varieties with resistance to blast where available.",
            "Avoid excessive nitrogen fertilizer.",
            "Apply nitrogen according to crop requirements and recommended timing.",
            "Maintain proper water management.",
            "Use healthy planting material and maintain good field hygiene.",
            "Monitor the crop regularly for early symptoms."
        ],
        treatment: [
            "Maintain proper nitrogen and water management.",
            "Monitor disease development closely.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Manage infected crop residues appropriately after harvest.",
            "Continue monitoring the crop for further symptoms."
        ]
    },

    "rice_Leaf scald": {
        prevention: [
            "Use healthy and disease-free planting material.",
            "Maintain proper field hygiene.",
            "Maintain balanced crop nutrition.",
            "Avoid excessive nitrogen fertilizer.",
            "Monitor the crop regularly, especially under wet conditions."
        ],
        treatment: [
            "Maintain proper crop and water management.",
            "Manage heavily infected plant material where practical.",
            "Use an appropriate locally recommended fungicide when disease severity justifies treatment.",
            "Maintain good field hygiene.",
            "Monitor the crop regularly for further disease spread."
        ]
    },

    "rice_Sheath Blight": {
        prevention: [
            "Avoid excessive nitrogen fertilizer.",
            "Use appropriate plant spacing to reduce excessive crop density.",
            "Maintain good field hygiene.",
            "Control weeds that can contribute to dense crop growth.",
            "Maintain appropriate water management.",
            "Monitor the crop regularly for early symptoms."
        ],
        treatment: [
            "Avoid excessive nitrogen application during disease development.",
            "Maintain appropriate water management.",
            "Reduce excessive crop density where practical.",
            "Use an appropriate locally recommended fungicide when disease severity justifies treatment.",
            "Monitor surrounding plants for further disease development."
        ]
    },


    // WHEAT PESTS AND DISEASES
    "wheat_aphid": {
        prevention: [
            "Monitor the crop regularly for aphid populations.",
            "Inspect plants regularly for early signs of aphid infestation.",
            "Maintain proper crop management and plant health.",
            "Protect beneficial insects and natural aphid predators where possible.",
            "Avoid unnecessary insecticide applications."
        ],
        treatment: [
            "Monitor aphid populations and crop damage regularly.",
            "Use an appropriate locally recommended insecticide when the infestation justifies treatment.",
            "Protect beneficial insects where possible.",
            "Follow the product label and local pest-management recommendations.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_black_rust": {
        prevention: [
            "Use wheat varieties with resistance to black rust where available.",
            "Use healthy and certified planting material.",
            "Monitor the crop regularly for rust symptoms.",
            "Maintain good field and crop management.",
            "Monitor disease development during favorable weather conditions."
        ],
        treatment: [
            "Monitor the crop closely for further rust development.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Follow local disease-management recommendations and product labels.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_blast": {
        prevention: [
            "Use recommended wheat varieties with resistance or reduced susceptibility to wheat blast where available.",
            "Use clean and healthy seed.",
            "Avoid planting seed from fields known to be affected by wheat blast.",
            "Monitor the crop carefully during warm and wet conditions.",
            "Maintain good field hygiene and crop management.",
            "Follow local disease-surveillance and quarantine recommendations where applicable."
        ],
        treatment: [
            "Monitor the crop closely around heading and flowering.",
            "Use an appropriate locally recommended fungicide when treatment is justified.",
            "Apply treatment according to the recommended crop stage and product label.",
            "Manage heavily infected crop material appropriately after harvest.",
            "Continue monitoring the crop for further disease development."
        ]
    },

    "wheat_brown_rust": {
        prevention: [
            "Use wheat varieties with resistance to brown rust where available.",
            "Use healthy planting material.",
            "Monitor the crop regularly for rust symptoms.",
            "Maintain good field and crop management.",
            "Monitor disease development during favorable weather conditions."
        ],
        treatment: [
            "Monitor the crop regularly for further rust development.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Follow local disease-management recommendations and product labels.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_common_root_rot": {
        prevention: [
            "Rotate wheat with suitable non-host crops where practical.",
            "Use healthy and certified seed.",
            "Use an appropriate seed treatment before planting when recommended.",
            "Avoid prolonged plant stress and unfavorable soil conditions.",
            "Maintain good soil and field management.",
            "Monitor affected areas regularly."
        ],
        treatment: [
            "Severely damaged plants may not recover after root infection is established.",
            "Maintain suitable soil moisture and crop conditions.",
            "Reduce plant stress through proper crop management.",
            "Use appropriate seed treatment for subsequent planting.",
            "Use crop rotation to reduce disease pressure in future seasons."
        ]
    },

    "wheat_fusarium_head_blight": {
        prevention: [
            "Use wheat varieties with improved resistance to Fusarium head blight where available.",
            "Rotate wheat with suitable non-host crops where practical.",
            "Manage infected crop residue appropriately.",
            "Use healthy and certified seed.",
            "Monitor disease risk carefully around flowering.",
            "Maintain appropriate crop management during wet and humid conditions."
        ],
        treatment: [
            "Monitor the crop carefully around flowering.",
            "Use an appropriate locally recommended fungicide when disease risk and crop stage justify treatment.",
            "Apply treatment at the locally recommended flowering stage.",
            "Follow the product label and local disease-management recommendations.",
            "Monitor harvested grain for quality problems where relevant."
        ]
    },

    "wheat_healthy": {
        prevention: [
            "Continue regular crop monitoring.",
            "Maintain proper irrigation and balanced crop nutrition.",
            "Maintain good field hygiene.",
            "Use healthy planting material.",
            "Follow recommended crop-management practices."
        ],
        treatment: [
            "No disease treatment is required.",
            "Continue normal crop management and regular monitoring."
        ]
    },

    "wheat_leaf_blight": {
        prevention: [
            "Use wheat varieties with improved resistance where available.",
            "Use healthy and certified seed.",
            "Maintain good field hygiene and crop-residue management.",
            "Rotate crops where practical.",
            "Monitor the crop regularly for early symptoms."
        ],
        treatment: [
            "Monitor disease development regularly.",
            "Manage infected crop residue appropriately.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Follow the product label and local disease-management recommendations.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_mildew": {
        prevention: [
            "Use wheat varieties with resistance to powdery mildew where available.",
            "Avoid excessive nitrogen fertilizer.",
            "Avoid unnecessarily dense crop growth.",
            "Maintain good crop ventilation where possible.",
            "Monitor the crop regularly for early symptoms."
        ],
        treatment: [
            "Monitor disease development regularly.",
            "Improve crop ventilation where practical.",
            "Use an appropriate locally recommended fungicide when disease severity justifies treatment.",
            "Follow the product label and local disease-management recommendations.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_mite": {
        prevention: [
            "Monitor the crop regularly for mite populations.",
            "Inspect plants regularly for early signs of mite damage.",
            "Maintain proper crop management and plant health.",
            "Avoid unnecessary pesticide applications.",
            "Monitor fields more closely when conditions favor mite populations."
        ],
        treatment: [
            "Confirm the pest before applying treatment.",
            "Monitor mite populations and crop damage regularly.",
            "Use an appropriate locally recommended pest-control product when treatment is justified.",
            "Follow the product label and local pest-management recommendations.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_septoria": {
        prevention: [
            "Use wheat varieties with improved resistance to Septoria where available.",
            "Rotate wheat with suitable non-host crops where practical.",
            "Manage infected crop residue appropriately.",
            "Use healthy and certified seed.",
            "Monitor the lower leaves regularly for early symptoms.",
            "Maintain good crop management."
        ],
        treatment: [
            "Monitor disease development in the lower and upper canopy.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Protect important upper leaves during critical crop-development stages.",
            "Follow the product label and local disease-management recommendations.",
            "Continue monitoring the crop after treatment."
        ]
    },

    "wheat_smut": {
        prevention: [
            "Use certified and disease-free seed.",
            "Use an appropriate fungicide seed treatment before planting.",
            "Use resistant varieties where available.",
            "Maintain good field hygiene.",
            "Monitor the crop regularly for smut symptoms."
        ],
        treatment: [
            "Established systemic smut infections generally cannot be cured after infection occurs.",
            "Remove or manage infected plants or heads where practical to reduce contamination.",
            "Use properly treated seed for the next planting.",
            "Maintain good field hygiene.",
            "Follow local disease-management recommendations."
        ]
    },

    "wheat_stem_fly": {
        prevention: [
            "Monitor the crop regularly for stem-fly damage.",
            "Inspect plants regularly for early signs of stem damage.",
            "Use recommended varieties where available.",
            "Maintain appropriate crop rotation.",
            "Follow local pest-management recommendations."
        ],
        treatment: [
            "Manage heavily damaged plants where practical.",
            "Use appropriate cultural and crop-management practices for the identified stem-fly species.",
            "Consider crop rotation and appropriate harvest-management practices.",
            "Do not apply insecticide without confirming that it is appropriate for the identified pest.",
            "Continue monitoring the crop for further damage."
        ]
    },

    "wheat_tan_spot": {
        prevention: [
            "Rotate wheat with suitable non-host crops where practical.",
            "Manage infected crop residue appropriately.",
            "Use wheat varieties with improved tan spot resistance where available.",
            "Use healthy and certified seed.",
            "Monitor the lower canopy regularly for early symptoms."
        ],
        treatment: [
            "Monitor disease development in the lower and upper canopy.",
            "Manage infected crop residue appropriately.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Protect important upper leaves during grain-filling stages where appropriate.",
            "Follow the product label and local disease-management recommendations."
        ]
    },

    "wheat_yellow_rust": {
        prevention: [
            "Use wheat varieties with resistance to yellow rust where available.",
            "Use healthy planting material.",
            "Monitor the crop regularly for yellow rust symptoms.",
            "Maintain good crop and field management.",
            "Monitor weather conditions that may favor rust development."
        ],
        treatment: [
            "Monitor the crop closely when conditions favor yellow rust development.",
            "Use an appropriate locally recommended fungicide when disease severity and crop stage justify treatment.",
            "Follow local disease-management recommendations and product labels.",
            "Continue monitoring the crop after treatment."
        ]
    }
};



// GET DISEASE TREATMENT
export const getDiseaseTreatment = (
    diseaseName: string
): DiseaseTreatment => {

    return (
        diseaseTreatments[diseaseName] ?? {
            prevention: [
                "No prevention information is currently available."
            ],
            treatment: [
                "No treatment information is currently available."
            ]
        }
    );
};

