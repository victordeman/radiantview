export interface ReportTemplate {
  name: string;
  modality: string;
  sections: { label: string; placeholder: string }[];
}

export const reportTemplates: ReportTemplate[] = [
  {
    name: "CT Chest",
    modality: "CT",
    sections: [
      {
        label: "Findings",
        placeholder:
          "Lungs: No focal consolidation, pleural effusion, or pneumothorax.\nMediastinum: Heart size normal. No mediastinal lymphadenopathy.\nBones: No acute osseous abnormality.\nOther: No significant abnormality identified.",
      },
      {
        label: "Impression",
        placeholder: "No acute cardiopulmonary process.",
      },
      {
        label: "Recommendation",
        placeholder: "No further imaging recommended at this time.",
      },
    ],
  },
  {
    name: "MRI Brain",
    modality: "MR",
    sections: [
      {
        label: "Findings",
        placeholder:
          "Brain parenchyma: Normal gray-white matter differentiation. No acute infarct, hemorrhage, or mass.\nVentricles: Normal in size and configuration.\nExtra-axial spaces: No extra-axial collection.\nMidline structures: No midline shift.\nPosterior fossa: Cerebellum and brainstem are unremarkable.",
      },
      {
        label: "Impression",
        placeholder: "No acute intracranial abnormality.",
      },
      {
        label: "Recommendation",
        placeholder: "Clinical correlation recommended.",
      },
    ],
  },
  {
    name: "Ultrasound Abdomen",
    modality: "US",
    sections: [
      {
        label: "Findings",
        placeholder:
          "Liver: Normal in size and echotexture. No focal lesion.\nGallbladder: No stones, wall thickening, or pericholecystic fluid.\nBile ducts: Not dilated.\nPancreas: Visualized portions are unremarkable.\nSpleen: Normal in size.\nKidneys: Normal in size and echogenicity bilaterally. No hydronephrosis or stones.\nAorta: Normal caliber.",
      },
      {
        label: "Impression",
        placeholder: "Normal abdominal ultrasound.",
      },
      {
        label: "Recommendation",
        placeholder: "No further imaging recommended.",
      },
    ],
  },
  {
    name: "X-Ray Chest",
    modality: "CR",
    sections: [
      {
        label: "Findings",
        placeholder:
          "Heart: Normal size.\nLungs: Clear bilaterally. No focal airspace opacity.\nPleura: No pleural effusion or pneumothorax.\nMediastinum: Normal mediastinal contour.\nBones: No acute osseous abnormality.",
      },
      {
        label: "Impression",
        placeholder: "No acute cardiopulmonary abnormality.",
      },
      {
        label: "Recommendation",
        placeholder: "None.",
      },
    ],
  },
  {
    name: "CT Abdomen/Pelvis",
    modality: "CT",
    sections: [
      {
        label: "Findings",
        placeholder:
          "Liver: Normal in size and attenuation. No focal lesion.\nGallbladder: Unremarkable.\nPancreas: Normal.\nSpleen: Normal in size.\nAdrenal glands: Normal.\nKidneys: Normal bilaterally. No hydronephrosis or stones.\nBowel: No obstruction or wall thickening.\nLymph nodes: No pathologically enlarged lymph nodes.\nPelvis: Unremarkable.\nBones: No acute osseous abnormality.",
      },
      {
        label: "Impression",
        placeholder: "No acute abdominal or pelvic abnormality.",
      },
      {
        label: "Recommendation",
        placeholder: "Clinical correlation recommended.",
      },
    ],
  },
  {
    name: "General",
    modality: "",
    sections: [
      {
        label: "Findings",
        placeholder: "Describe the findings here...",
      },
      {
        label: "Impression",
        placeholder: "Summarize the impression here...",
      },
      {
        label: "Recommendation",
        placeholder: "Provide recommendations here...",
      },
    ],
  },
];
