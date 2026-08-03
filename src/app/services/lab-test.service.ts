import { Injectable } from '@angular/core';
import { LabTest, LabTestParameter } from '../models/lab-test.model';
import { TestResultParameter } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class LabTestService {
  private catalog: LabTest[] = [
    {
      code: 'CBC',
      name: 'Complete Blood Count',
      category: 'Hematology',
      turnaroundTime: '2 hours',
      parameters: [
        { name: 'Hemoglobin', unit: 'g/dL', normalRange: '13.5 – 17.5', normalRangeMale: '13.5 – 17.5', normalRangeFemale: '12.0 – 15.5', type: 'numeric' },
        { name: 'WBC', unit: 'x10³/μL', normalRange: '4.5 – 11.0', type: 'numeric' },
        { name: 'RBC', unit: 'x10⁶/μL', normalRange: '4.5 – 5.9', normalRangeMale: '4.5 – 5.9', normalRangeFemale: '4.1 – 5.1', type: 'numeric' },
        { name: 'Platelets', unit: 'x10³/μL', normalRange: '150 – 400', type: 'numeric' },
        { name: 'Hematocrit', unit: '%', normalRange: '41 – 53', normalRangeMale: '41 – 53', normalRangeFemale: '36 – 46', type: 'numeric' },
        { name: 'MCV', unit: 'fL', normalRange: '80 – 100', type: 'numeric' },
        { name: 'MCH', unit: 'pg', normalRange: '27 – 33', type: 'numeric' },
        { name: 'MCHC', unit: 'g/dL', normalRange: '32 – 36', type: 'numeric' },
        { name: 'Neutrophils', unit: '%', normalRange: '50 – 70', type: 'numeric' },
        { name: 'Lymphocytes', unit: '%', normalRange: '20 – 40', type: 'numeric' },
        { name: 'Monocytes', unit: '%', normalRange: '2 – 8', type: 'numeric' },
        { name: 'Eosinophils', unit: '%', normalRange: '1 – 4', type: 'numeric' },
        { name: 'Basophils', unit: '%', normalRange: '0 – 1', type: 'numeric' },
      ],
    },
    {
      code: 'BG-F',
      name: 'Blood Glucose (Fasting)',
      category: 'Clinical Chemistry',
      turnaroundTime: '1 hour',
      parameters: [
        { name: 'Fasting Blood Glucose', unit: 'mg/dL', normalRange: '70 – 100', type: 'numeric' },
      ],
    },
    {
      code: 'BG-R',
      name: 'Blood Glucose (Random)',
      category: 'Clinical Chemistry',
      turnaroundTime: '1 hour',
      parameters: [
        { name: 'Random Blood Glucose', unit: 'mg/dL', normalRange: '< 140', type: 'numeric' },
      ],
    },
    {
      code: 'LP',
      name: 'Lipid Profile',
      category: 'Clinical Chemistry',
      turnaroundTime: '2 hours',
      parameters: [
        { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '< 200', type: 'numeric' },
        { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '< 130', type: 'numeric' },
        { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '> 40', normalRangeMale: '> 40', normalRangeFemale: '> 50', type: 'numeric' },
        { name: 'Triglycerides', unit: 'mg/dL', normalRange: '< 150', type: 'numeric' },
        { name: 'VLDL', unit: 'mg/dL', normalRange: '2 – 30', type: 'numeric' },
      ],
    },
    {
      code: 'LFT',
      name: 'Liver Function Tests',
      category: 'Clinical Chemistry',
      turnaroundTime: '3 hours',
      parameters: [
        { name: 'ALT (SGPT)', unit: 'U/L', normalRange: '7 – 56', type: 'numeric' },
        { name: 'AST (SGOT)', unit: 'U/L', normalRange: '10 – 40', type: 'numeric' },
        { name: 'Alkaline Phosphatase', unit: 'U/L', normalRange: '44 – 147', type: 'numeric' },
        { name: 'Total Bilirubin', unit: 'mg/dL', normalRange: '0.2 – 1.2', type: 'numeric' },
        { name: 'Direct Bilirubin', unit: 'mg/dL', normalRange: '0.0 – 0.3', type: 'numeric' },
        { name: 'Indirect Bilirubin', unit: 'mg/dL', normalRange: '0.1 – 0.8', type: 'numeric' },
        { name: 'Total Protein', unit: 'g/dL', normalRange: '6.0 – 8.3', type: 'numeric' },
        { name: 'Albumin', unit: 'g/dL', normalRange: '3.5 – 5.0', type: 'numeric' },
        { name: 'Globulin', unit: 'g/dL', normalRange: '2.0 – 3.5', type: 'numeric' },
      ],
    },
    {
      code: 'KFT',
      name: 'Kidney Function Tests',
      category: 'Clinical Chemistry',
      turnaroundTime: '3 hours',
      parameters: [
        { name: 'Creatinine', unit: 'mg/dL', normalRange: '0.7 – 1.3', normalRangeMale: '0.7 – 1.3', normalRangeFemale: '0.6 – 1.1', type: 'numeric' },
        { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', normalRange: '7 – 20', type: 'numeric' },
        { name: 'Uric Acid', unit: 'mg/dL', normalRange: '3.4 – 7.0', normalRangeMale: '3.4 – 7.0', normalRangeFemale: '2.4 – 6.0', type: 'numeric' },
        { name: 'eGFR', unit: 'mL/min/1.73m²', normalRange: '> 60', type: 'numeric' },
        { name: 'Sodium (Na)', unit: 'mEq/L', normalRange: '136 – 145', type: 'numeric' },
        { name: 'Potassium (K)', unit: 'mEq/L', normalRange: '3.5 – 5.0', type: 'numeric' },
        { name: 'Chloride (Cl)', unit: 'mEq/L', normalRange: '98 – 106', type: 'numeric' },
      ],
    },
    {
      code: 'TFT',
      name: 'Thyroid Function Tests',
      category: 'Endocrinology',
      turnaroundTime: '4 hours',
      parameters: [
        { name: 'TSH', unit: 'mIU/L', normalRange: '0.4 – 4.0', type: 'numeric' },
        { name: 'Free T4 (fT4)', unit: 'ng/dL', normalRange: '0.8 – 1.8', type: 'numeric' },
        { name: 'Free T3 (fT3)', unit: 'pg/mL', normalRange: '2.3 – 4.2', type: 'numeric' },
      ],
    },
    {
      code: 'UA',
      name: 'Urinalysis',
      category: 'Urinalysis',
      turnaroundTime: '1 hour',
      parameters: [
        { name: 'Color', unit: '', normalRange: 'Yellow', type: 'text' },
        { name: 'Clarity', unit: '', normalRange: 'Clear', type: 'text' },
        { name: 'pH', unit: '', normalRange: '4.5 – 8.0', type: 'numeric' },
        { name: 'Specific Gravity', unit: '', normalRange: '1.001 – 1.035', type: 'numeric' },
        { name: 'Protein', unit: '', normalRange: 'Negative', type: 'qualitative' },
        { name: 'Glucose', unit: '', normalRange: 'Negative', type: 'qualitative' },
        { name: 'Ketones', unit: '', normalRange: 'Negative', type: 'qualitative' },
        { name: 'Blood', unit: '', normalRange: 'Negative', type: 'qualitative' },
        { name: 'Nitrites', unit: '', normalRange: 'Negative', type: 'qualitative' },
        { name: 'Leukocyte Esterase', unit: '', normalRange: 'Negative', type: 'qualitative' },
        { name: 'Urobilinogen', unit: 'mg/dL', normalRange: '0.2 – 1.0', type: 'numeric' },
        { name: 'WBC (Microscopy)', unit: '/HPF', normalRange: '0 – 5', type: 'numeric' },
        { name: 'RBC (Microscopy)', unit: '/HPF', normalRange: '0 – 2', type: 'numeric' },
      ],
    },
    {
      code: 'MAL',
      name: 'Malaria RDT',
      category: 'Parasitology',
      turnaroundTime: '30 minutes',
      parameters: [
        { name: 'P. falciparum Antigen', unit: '', normalRange: 'Non-Reactive', type: 'qualitative' },
        { name: 'P. vivax Antigen', unit: '', normalRange: 'Non-Reactive', type: 'qualitative' },
      ],
    },
    {
      code: 'WID',
      name: 'Widal Test',
      category: 'Serology',
      turnaroundTime: '2 hours',
      parameters: [
        { name: 'S. typhi O', unit: 'titre', normalRange: '< 1:80', type: 'text' },
        { name: 'S. typhi H', unit: 'titre', normalRange: '< 1:80', type: 'text' },
        { name: 'S. paratyphi AO', unit: 'titre', normalRange: '< 1:80', type: 'text' },
        { name: 'S. paratyphi AH', unit: 'titre', normalRange: '< 1:80', type: 'text' },
      ],
    },
    {
      code: 'HIV',
      name: 'HIV 1&2 Screening',
      category: 'Serology',
      turnaroundTime: '1 hour',
      parameters: [
        { name: 'HIV 1/2 Antibody', unit: '', normalRange: 'Non-Reactive', type: 'qualitative' },
      ],
    },
    {
      code: 'HBsAg',
      name: 'Hepatitis B Surface Antigen',
      category: 'Serology',
      turnaroundTime: '1 hour',
      parameters: [
        { name: 'HBsAg', unit: '', normalRange: 'Non-Reactive', type: 'qualitative' },
      ],
    },
    {
      code: 'HCV',
      name: 'Hepatitis C Antibody',
      category: 'Serology',
      turnaroundTime: '1 hour',
      parameters: [
        { name: 'HCV Antibody', unit: '', normalRange: 'Non-Reactive', type: 'qualitative' },
      ],
    },
  ];

  getAll(): LabTest[] {
    return this.catalog;
  }

  getByCode(code: string): LabTest | undefined {
    return this.catalog.find((t) => t.code === code);
  }

  getCategories(): string[] {
    return [...new Set(this.catalog.map((t) => t.category))];
  }

  getDefaultParameters(testCode: string, gender?: string): TestResultParameter[] {
    const test = this.getByCode(testCode);
    if (!test) return [];
    return test.parameters.map((p) => {
      let normalRange = p.normalRange;
      if (gender === 'Male' && p.normalRangeMale) normalRange = p.normalRangeMale;
      if (gender === 'Female' && p.normalRangeFemale) normalRange = p.normalRangeFemale;
      return { name: p.name, value: '', unit: p.unit, normalRange, flag: '' };
    });
  }

  calculateFlag(
    value: string,
    normalRange: string
  ): 'Normal' | 'High' | 'Low' | 'Positive' | 'Negative' | 'Abnormal' | '' {
    if (!value || !normalRange) return '';

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      const lv = value.toLowerCase().trim();
      const lr = normalRange.toLowerCase().trim();

      if (lr.includes('negative') || lr.includes('non-reactive')) {
        if (lv.includes('positive') || lv.includes('reactive')) return 'Positive';
        if (lv.includes('negative') || lv.includes('non-reactive')) return 'Negative';
        return 'Abnormal';
      }

      if (lv === lr) return 'Normal';
      return 'Abnormal';
    }

    // Range: "70 – 100" or "70 - 100"
    const dashMatch = normalRange.match(/(\d+\.?\d*)\s*[–-]\s*(\d+\.?\d*)/);
    if (dashMatch) {
      const min = parseFloat(dashMatch[1]);
      const max = parseFloat(dashMatch[2]);
      if (numValue < min) return 'Low';
      if (numValue > max) return 'High';
      return 'Normal';
    }

    // Greater than: "> 40"
    const gtMatch = normalRange.match(/[>≥]\s*(\d+\.?\d*)/);
    if (gtMatch) {
      const min = parseFloat(gtMatch[1]);
      return numValue < min ? 'Low' : 'Normal';
    }

    // Less than: "< 200"
    const ltMatch = normalRange.match(/[<≤]\s*(\d+\.?\d*)/);
    if (ltMatch) {
      const max = parseFloat(ltMatch[1]);
      return numValue > max ? 'High' : 'Normal';
    }

    return 'Normal';
  }
}
