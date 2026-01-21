CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id text;
    diff_old jsonb;
    diff_new jsonb;
    old_jsonb jsonb;
    new_jsonb jsonb;
		excluded_fields text[] := ARRAY['updated_at', 'created_at'];
BEGIN
    current_user_id := current_setting('app.current_user_id', true);

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, current_user_id);
        RETURN OLD;

    ELSIF (TG_OP = 'UPDATE') THEN
        old_jsonb := to_jsonb(OLD) - excluded_fields;
        new_jsonb := to_jsonb(NEW) - excluded_fields;
        
        SELECT 
            jsonb_object_agg(key, new_jsonb->key) FILTER (WHERE new_jsonb->key IS DISTINCT FROM old_jsonb->key),
            jsonb_object_agg(key, old_jsonb->key) FILTER (WHERE new_jsonb->key IS DISTINCT FROM old_jsonb->key)
        INTO diff_new, diff_old
        FROM jsonb_object_keys(new_jsonb) AS key;

        IF diff_new IS NOT NULL THEN
            INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
            VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', diff_old, diff_new, current_user_id);
        END IF;
        
        RETURN NEW;
    
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_user_id);
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_audit_trigger
AFTER UPDATE OR DELETE ON public.user
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER profile_audit_trigger
AFTER UPDATE OR DELETE ON public.profile
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER clinic_audit_trigger
AFTER UPDATE OR DELETE ON public.clinics
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER organization_audit_trigger
AFTER UPDATE OR DELETE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
