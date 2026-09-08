"""
CareFlow AI — Intelligent Clinical Case-Taking & Healthcare Backend
FastAPI Python Application
"""

from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

app = FastAPI(
    title="CareFlow AI Clinical API",
    description="Intelligent, Multilingual, Voice-Enabled, Offline-First Case Taking Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "doctor"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    token: str

class PatientCreate(BaseModel):
    name: str
    dob: str
    age: int
    gender: str
    phone: str
    email: Optional[str] = ""
    address: str
    blood_group: str
    allergies: List[str] = []
    existing_conditions: List[str] = []
    current_medications: List[str] = []
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    referring_doctor: Optional[str] = None

class PatientResponse(PatientCreate):
    id: str
    registration_date: str
    last_visit: str
    status: str

class VitalSigns(BaseModel):
    temperature: str
    blood_pressure: str
    pulse: str
    respiratory_rate: str
    spo2: str
    height: str
    weight: str
    bmi: str

class MedicationItem(BaseModel):
    name: str
    strength: str
    dosage: str
    frequency: str
    route: str
    duration: str
    instructions: str
    confidence: Optional[float] = 1.0
    needs_verification: Optional[bool] = False
    allergy_warning: Optional[str] = None

class CaseCreate(BaseModel):
    patient_id: str
    doctor_name: str
    specialty: str
    chief_complaint: str
    history_of_present_illness: str
    duration: str
    symptoms: List[str]
    vitals: VitalSigns
    primary_diagnosis: str
    differential_diagnosis: List[str] = []
    prescriptions: List[MedicationItem] = []
    clinical_notes: str = ""

class AISummarizeRequest(BaseModel):
    patient_id: str
    chief_complaint: str
    history: str
    vitals: Dict[str, str]
    allergies: List[str]

class AITranslateRequest(BaseModel):
    text: str
    source_language: str
    target_language: str = "en"

class AIDigitizeRxRequest(BaseModel):
    image_url: Optional[str] = None
    patient_id: Optional[str] = None

class SyncPayload(BaseModel):
    batch_id: str
    records: List[Dict[str, Any]]

# --- API Endpoints ---

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareFlow AI Backend (FastAPI)",
        "offline_sync_ready": True,
        "supported_languages": ["en", "hi", "te", "ta", "kn", "ml", "mr", "bn", "ur"]
    }

@app.post("/api/auth/login", response_model=UserResponse)
def login(creds: LoginRequest):
    return {
        "id": "USR-001",
        "name": f"Dr. {creds.email.split('@')[0].capitalize()}",
        "email": creds.email,
        "role": creds.role,
        "token": "careflow_jwt_simulated_token_xyz"
    }

@app.get("/api/patients")
def get_patients(query: Optional[str] = None):
    return {"status": "success", "count": 6, "filter": query}

@app.post("/api/patients")
def create_patient(patient: PatientCreate):
    new_id = f"CF-{int(datetime.utcnow().timestamp())}"
    return {"status": "created", "patient_id": new_id, "data": patient.dict()}

@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    return {"patient_id": patient_id, "status": "Active"}

@app.put("/api/patients/{patient_id}")
def update_patient(patient_id: str, patient: PatientCreate):
    return {"status": "updated", "patient_id": patient_id}

@app.get("/api/patients/{patient_id}/history")
def get_patient_history(patient_id: str):
    return {"patient_id": patient_id, "timeline_events": [], "cases": []}

@app.post("/api/cases")
def create_case(case_data: CaseCreate):
    case_id = f"CF-CASE-{int(datetime.utcnow().timestamp())}"
    return {"status": "created", "case_id": case_id}

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    return {"case_id": case_id, "status": "completed"}

@app.put("/api/cases/{case_id}")
def update_case(case_id: str, case_data: CaseCreate):
    return {"status": "updated", "case_id": case_id}

@app.post("/api/ai/summarize")
def ai_summarize(payload: AISummarizeRequest):
    return {
        "patient_overview": "Patient presenting with acute symptoms. Chronic conditions evaluated.",
        "chief_complaint_summary": payload.chief_complaint,
        "history_summary": payload.history,
        "critical_flags": [f"Allergy Alert: {a}" for a in payload.allergies],
        "disclaimer": "AI-generated summary. Verify before clinical use."
    }

@app.post("/api/ai/insights")
def ai_insights(payload: Dict[str, Any]):
    return {
        "insights": [
            {
                "type": "possible_condition",
                "title": "Possible Condition: Acute Viral Upper Respiratory Infection",
                "description": "Evaluate seasonal viral prodrome vs bacterial etiology.",
                "severity": "medium",
                "disclaimer": "AI Decision Support — Clinician verification required."
            }
        ]
    }

@app.post("/api/ai/translate")
def ai_translate(payload: AITranslateRequest):
    return {
        "source_text": payload.text,
        "source_language": payload.source_language,
        "translated_text": "I have had fever for three days with cough and headache.",
        "structured": {
            "complaint": "Fever",
            "duration": "3 days",
            "associated_symptoms": ["Cough", "Headache"]
        }
    }

@app.post("/api/ai/structure-transcript")
def ai_structure_transcript(payload: Dict[str, Any]):
    return {
        "status": "structured",
        "chief_complaint": "Fever with chills",
        "duration": "3 days",
        "associated_symptoms": ["Cough", "Headache"]
    }

@app.post("/api/ai/digitize-prescription")
def ai_digitize_prescription(payload: AIDigitizeRxRequest):
    return {
        "overall_confidence": 92.5,
        "extracted_medications": [
            {
                "name": "Amoxicillin",
                "strength": "500 mg",
                "dosage": "1 tablet",
                "frequency": "Twice daily",
                "duration": "5 days",
                "confidence": 0.96,
                "needs_verification": False
            },
            {
                "name": "Unclear Handwriting Script",
                "strength": "Unclear",
                "dosage": "1 cap",
                "frequency": "OD",
                "duration": "Unclear",
                "confidence": 0.45,
                "needs_verification": True,
                "allergy_warning": "⚠ Unclear information — Doctor verification required"
            }
        ]
    }

@app.post("/api/prescriptions")
def save_prescription(payload: Dict[str, Any]):
    return {"status": "saved", "rx_id": f"RX-{int(datetime.utcnow().timestamp())}"}

@app.get("/api/prescriptions")
def get_prescriptions(patient_id: Optional[str] = None):
    return {"prescriptions": []}

@app.post("/api/followups")
def create_followup(payload: Dict[str, Any]):
    return {"status": "scheduled", "id": f"FU-{int(datetime.utcnow().timestamp())}"}

@app.get("/api/followups")
def get_followups():
    return {"followups": []}

@app.get("/api/templates")
def get_templates():
    return {"templates": []}

@app.post("/api/templates")
def create_template(payload: Dict[str, Any]):
    return {"status": "saved"}

@app.post("/api/sync")
def sync_records(payload: SyncPayload):
    return {
        "status": "synchronized",
        "batch_id": payload.batch_id,
        "processed_count": len(payload.records),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/sync/status")
def get_sync_status():
    return {
        "queue_length": 0,
        "last_sync": datetime.utcnow().isoformat(),
        "status": "Online"
    }

@app.get("/api/audit-log")
def get_audit_log(limit: int = 50):
    return {"logs": [], "limit": limit}
