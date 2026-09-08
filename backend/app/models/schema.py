"""
CareFlow AI — Database Models (SQLAlchemy for SQLite/PostgreSQL)
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class PatientModel(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    dob = Column(String(50), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone = Column(String(50), nullable=False, index=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=False)
    blood_group = Column(String(10), nullable=False)
    allergies = Column(JSON, default=[])
    existing_conditions = Column(JSON, default=[])
    current_medications = Column(JSON, default=[])
    insurance_provider = Column(String(200), nullable=True)
    insurance_number = Column(String(100), nullable=True)
    referring_doctor = Column(String(200), nullable=True)
    registration_date = Column(DateTime, default=datetime.utcnow)
    last_visit = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="Active")

    cases = relationship("ClinicalCaseModel", back_populates="patient")
    prescriptions = relationship("PrescriptionModel", back_populates="patient")

class ClinicalCaseModel(Base):
    __tablename__ = "clinical_cases"

    id = Column(String(50), primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    doctor_name = Column(String(200), nullable=False)
    specialty = Column(String(100), nullable=False)
    case_date = Column(DateTime, default=datetime.utcnow)
    chief_complaint = Column(Text, nullable=False)
    history_of_present_illness = Column(Text, nullable=True)
    duration = Column(String(100), nullable=True)
    symptoms = Column(JSON, default=[])
    vitals = Column(JSON, default={})
    examination = Column(JSON, default={})
    investigations = Column(JSON, default=[])
    ai_summary = Column(JSON, nullable=True)
    ai_insights = Column(JSON, default=[])
    primary_diagnosis = Column(String(200), nullable=False)
    differential_diagnosis = Column(JSON, default=[])
    clinical_notes = Column(Text, nullable=True)
    status = Column(String(50), default="Completed")

    patient = relationship("PatientModel", back_populates="cases")

class PrescriptionModel(Base):
    __tablename__ = "prescriptions"

    id = Column(String(50), primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    case_id = Column(String(50), nullable=True)
    doctor_name = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    medications = Column(JSON, default=[])
    scanned_image_url = Column(String(500), nullable=True)
    is_ocr_digitized = Column(Boolean, default=False)
    doctor_verified = Column(Boolean, default=True)

    patient = relationship("PatientModel", back_populates="prescriptions")

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_name = Column(String(150), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(200), nullable=False)
    record = Column(String(200), nullable=False)
    ip_address = Column(String(100), default="127.0.0.1")
    status = Column(String(50), default="Success")
    details = Column(Text, nullable=True)
