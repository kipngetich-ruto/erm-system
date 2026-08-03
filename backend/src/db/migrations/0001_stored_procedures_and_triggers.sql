-- ==========================================
-- STORED PROCEDURES & TRIGGERS
-- ==========================================

-- 1. Stored Procedure: Create medical record with audit logging
CREATE OR REPLACE PROCEDURE sp_create_medical_record(
  p_patient_id UUID,
  p_doctor_id UUID,
  p_diagnosis TEXT,
  p_treatment TEXT,
  p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO medical_records (
    patient_id, doctor_id, encrypted_diagnosis, encrypted_treatment, encrypted_notes
  )
  VALUES (
    p_patient_id, p_doctor_id, p_diagnosis, p_treatment, p_notes
  );
  
  INSERT INTO audit_logs (user_id, action, resource, details)
  VALUES (
    p_doctor_id,
    'CREATE_RECORD',
    '/medical-records',
    json_build_object('patient_id', p_patient_id)::text
  );
END;
$$;

-- 2. Trigger Function: Audit patient changes
CREATE OR REPLACE FUNCTION fn_audit_patients()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user from session (set by application)
  v_user_id := COALESCE(
    current_setting('app.current_user_id', TRUE)::UUID,
    NULL
  );
  
  INSERT INTO audit_logs (user_id, action, resource, details)
  VALUES (
    v_user_id,
    TG_OP,
    '/patients',
    json_build_object(
      'patient_id', COALESCE(NEW.id, OLD.id),
      'full_name', COALESCE(NEW.full_name, OLD.full_name)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_audit_patients ON patients;

-- 4. Create trigger on patients table
CREATE TRIGGER trg_audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION fn_audit_patients();

-- 5. Grant usage to application user (if needed)
GRANT EXECUTE ON PROCEDURE sp_create_medical_record(UUID, UUID, TEXT, TEXT, TEXT) TO admin;