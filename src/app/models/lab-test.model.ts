export interface LabTest {
  code: string;
  name: string;
  category: string;
  turnaroundTime: string;
  parameters: LabTestParameter[];
}

export interface LabTestParameter {
  name: string;
  unit: string;
  normalRange: string;
  normalRangeMale?: string;
  normalRangeFemale?: string;
  type: 'numeric' | 'text' | 'qualitative';
}
