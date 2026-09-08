import { User, UserRole } from '../types';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export class PermissionService {
  /**
   * Can view patient demographic list and directory
   */
  public canViewPatient(user: User | null): boolean {
    if (!user) return false;
    return ['doctor', 'nurse', 'reception'].includes(user.role);
  }

  /**
   * Can register a new patient or edit administrative demographic info (phone, address, emergency contact)
   */
  public canEditPatient(user: User | null): boolean {
    if (!user) return false;
    return ['doctor', 'nurse', 'reception'].includes(user.role);
  }

  /**
   * Can edit clinical data (symptoms, complaints, vitals, examinations)
   * Reception is strictly VIEW ONLY.
   */
  public canEditClinicalData(user: User | null): boolean {
    if (!user) return false;
    return ['doctor', 'nurse'].includes(user.role);
  }

  /**
   * Can add, modify, or confirm medical diagnoses (ICD-10, primary/differential)
   * Doctor exclusive.
   */
  public canEditDiagnosis(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'doctor';
  }

  /**
   * Can create, edit, or sign prescriptions
   * Doctor exclusive.
   */
  public canEditPrescription(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'doctor';
  }

  /**
   * Can finalize/complete a clinical encounter (moves into 30-day retention)
   * Doctor exclusive.
   */
  public canCompleteCase(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'doctor';
  }

  /**
   * Can move a case to the Recycle Bin (soft delete)
   * Doctor exclusive.
   */
  public canDeleteCase(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'doctor';
  }

  /**
   * Can restore a soft-deleted or completed case from the Recycle Bin
   * Doctor has full restore; Nurse if permitted. Reception CANNOT restore.
   */
  public canRestoreCase(user: User | null): boolean {
    if (!user) return false;
    return ['doctor', 'nurse'].includes(user.role);
  }

  /**
   * Can permanently purge a case after expiration
   * Doctor exclusive.
   */
  public canPermanentlyDeleteCase(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'doctor';
  }

  /**
   * Generic permission check that returns a human-readable rejection message
   */
  public checkPermission(action: string, user: User | null): PermissionCheckResult {
    if (!user) {
      return { allowed: false, reason: "You must be authenticated to perform this action." };
    }

    switch (action) {
      case 'view_patient':
        return this.canViewPatient(user)
          ? { allowed: true }
          : { allowed: false, reason: "You don't have permission to view patient records." };

      case 'edit_patient':
        return this.canEditPatient(user)
          ? { allowed: true }
          : { allowed: false, reason: "You don't have permission to edit patient demographic data." };

      case 'edit_clinical_data':
      case 'edit_examination':
      case 'edit_vitals':
        return this.canEditClinicalData(user)
          ? { allowed: true }
          : { allowed: false, reason: "You don't have permission to modify clinical findings. Reception staff have View-Only access." };

      case 'edit_diagnosis':
        return this.canEditDiagnosis(user)
          ? { allowed: true }
          : { allowed: false, reason: "Only attending physicians (Doctors) have permission to alter diagnostic assessments." };

      case 'edit_prescription':
        return this.canEditPrescription(user)
          ? { allowed: true }
          : { allowed: false, reason: "Only authorized medical doctors can prescribe or edit medications." };

      case 'complete_case':
        return this.canCompleteCase(user)
          ? { allowed: true }
          : { allowed: false, reason: "Only attending physicians can complete and close clinical encounters." };

      case 'delete_case':
        return this.canDeleteCase(user)
          ? { allowed: true }
          : { allowed: false, reason: "You don't have permission to move clinical cases to the Recycle Bin." };

      case 'restore_case':
        return this.canRestoreCase(user)
          ? { allowed: true }
          : { allowed: false, reason: "You don't have permission to restore cases from the Recycle Bin." };

      case 'permanently_delete_case':
        return this.canPermanentlyDeleteCase(user)
          ? { allowed: true }
          : { allowed: false, reason: "Permanent case erasure is restricted strictly to authorized Medical Directors/Doctors." };

      default:
        return { allowed: true };
    }
  }
}

export const permissionService = new PermissionService();
