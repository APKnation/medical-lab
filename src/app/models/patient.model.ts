export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  doctorName: string;
  doctorContact: string;
  referredFrom: string;
  tests: PatientTest[];
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Normal' | 'Urgent';
  dateRegistered: string;
  dateCompleted?: string;
  notes: string;
  createdBy: string;
}

export interface PatientTest {
  id: string;
  testCode: string;
  testName: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  parameters: TestResultParameter[];
  completedAt?: string;
  completedBy?: string;
}

export interface TestResultParameter {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Positive' | 'Negative' | 'Abnormal' | '';
}
