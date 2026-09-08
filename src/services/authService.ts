import { User, UserRole } from '../types';
import { storageService } from './storage';

export interface AuthUser extends User {
  pin: string;
  department: string;
}

export const DEMO_DOCTORS: User[] = [
  {
    id: 'DOC-1001',
    name: 'Sarah Fatima',
    email: 'sarah.fatima@careflow.ai',
    role: 'doctor',
    specialty: 'Internal & General Medicine',
    clinicName: 'CareFlow Metro Healthcare',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-1002',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@careflow.ai',
    role: 'doctor',
    specialty: 'Cardiology',
    clinicName: 'CareFlow Metro Healthcare',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-1003',
    name: 'Priya Nair',
    email: 'priya.nair@careflow.ai',
    role: 'doctor',
    specialty: 'Pediatrics',
    clinicName: 'CareFlow Children’s Wing',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-1004',
    name: 'Kabir Shah',
    email: 'kabir.shah@careflow.ai',
    role: 'doctor',
    specialty: 'Orthopedics',
    clinicName: 'CareFlow Metro Healthcare',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-1005',
    name: 'Ananya Rao',
    email: 'ananya.rao@careflow.ai',
    role: 'doctor',
    specialty: 'Dermatology',
    clinicName: 'CareFlow Metro Healthcare',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813689-cf749c95b452?w=150&auto=format&fit=crop&q=80'
  }
];

export const DEMO_STAFF_ACCOUNTS: AuthUser[] = [
  {
    id: 'DOC-1001',
    name: 'Sarah Fatima',
    email: 'sarah.fatima@careflow.ai',
    role: 'doctor',
    pin: '1234',
    specialty: 'Internal & General Medicine',
    clinicName: 'CareFlow Metro Healthcare',
    department: 'Outpatient Clinical Department',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'NUR-1001',
    name: 'Nurse Sunita Verma, RN',
    email: 'sunita.verma@careflow.ai',
    role: 'nurse',
    pin: '1234',
    specialty: 'Clinical Triage & Vitals',
    clinicName: 'CareFlow Metro Healthcare',
    department: 'Triage & Nursing Station',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813689-cf749c95b452?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'REC-1001',
    name: 'Pooja Nair (Front Desk)',
    email: 'pooja.nair@careflow.ai',
    role: 'reception',
    pin: '1234',
    specialty: 'Patient Admissions & Scheduling',
    clinicName: 'CareFlow Metro Healthcare',
    department: 'Front Desk Admissions',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'DOC-1002',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@careflow.ai',
    role: 'doctor',
    pin: '1234',
    specialty: 'Cardiology',
    clinicName: 'CareFlow Metro Healthcare',
    department: 'Cardiology Department',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  }
];

const AUTH_SESSION_KEY = 'careflow_auth_session_v1';

export class AuthService {
  private activeUser: User | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        this.activeUser = JSON.parse(stored);
      } else {
        // Default to Sarah Fatima for testing convenience if none stored
        this.activeUser = DEMO_STAFF_ACCOUNTS[0];
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.activeUser));
      }
    } catch {
      this.activeUser = DEMO_STAFF_ACCOUNTS[0];
    }
  }

  public getCurrentUser(): User | null {
    if (!this.activeUser) {
      this.restoreSession();
    }
    return this.activeUser;
  }

  public login(staffId: string, pin: string): { success: boolean; user?: User; error?: string } {
    const trimmedId = (staffId || '').trim().toUpperCase();
    const trimmedPin = (pin || '').trim();

    const account = DEMO_STAFF_ACCOUNTS.find(
      u => u.id.toUpperCase() === trimmedId || u.email.toLowerCase() === trimmedId.toLowerCase()
    );

    if (!account) {
      storageService.addAuditLog({
        userName: trimmedId || 'Unknown User',
        userRole: 'patient',
        action: 'Failed Doctor Mode Login',
        record: `Attempted ID: ${trimmedId}`,
        status: 'Warning',
        details: 'Unauthorized entry attempt to clinical mode with unrecognized Staff ID.'
      });
      return { success: false, error: 'Invalid credentials: Staff ID not found in clinic registry.' };
    }

    // Accepts either standard PIN ('1234') or role-specific passwords ('doctor123', 'nurse123', 'rec123')
    const validPins = [account.pin, '1234', `${account.role}123`];
    if (!validPins.includes(trimmedPin)) {
      storageService.addAuditLog({
        userName: account.name,
        userRole: account.role,
        action: 'Failed Doctor Mode Login',
        record: `${account.name} (${account.id})`,
        status: 'Warning',
        details: 'Incorrect PIN/password entered.'
      });
      return { success: false, error: 'Invalid credentials: Incorrect security PIN.' };
    }

    // Success
    const authenticatedUser: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      specialty: account.specialty,
      clinicName: account.clinicName,
      avatarUrl: account.avatarUrl
    };

    this.activeUser = authenticatedUser;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authenticatedUser));

    storageService.addAuditLog({
      userName: authenticatedUser.name,
      userRole: authenticatedUser.role,
      action: 'Doctor Mode Authenticated',
      record: `${authenticatedUser.name} (${authenticatedUser.id})`,
      status: 'Success',
      details: `Successful sign-in with role: ${authenticatedUser.role.toUpperCase()}`
    });

    return { success: true, user: authenticatedUser };
  }

  public logout(): void {
    if (this.activeUser) {
      storageService.addAuditLog({
        userName: this.activeUser.name,
        userRole: this.activeUser.role,
        action: 'Doctor Mode Logout',
        record: `${this.activeUser.name} (${this.activeUser.id})`,
        status: 'Success',
        details: 'Session terminated.'
      });
    }
    this.activeUser = null;
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  public switchRole(role: UserRole): User {
    const matchedAccount = DEMO_STAFF_ACCOUNTS.find(a => a.role === role) || DEMO_STAFF_ACCOUNTS[0];
    const user: User = {
      id: matchedAccount.id,
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: role,
      specialty: matchedAccount.specialty,
      clinicName: matchedAccount.clinicName,
      avatarUrl: matchedAccount.avatarUrl
    };
    this.activeUser = user;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    return user;
  }
}

export const authService = new AuthService();
