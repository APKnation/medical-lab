export interface Staff {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'Admin' | 'Lab Technician';
  designation: string;
}
