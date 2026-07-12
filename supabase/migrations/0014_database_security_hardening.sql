-- 0014_database_security_hardening.sql
-- Hardens database function execution permissions to fix Supabase Security Advisor warnings.

-- 1. Hardening for rls_auto_enable() if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
        WHERE proname = 'rls_auto_enable' AND nspname = 'public'
    ) THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;';
    END IF;
END $$;

-- 2. Hardening for handle_new_user() trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
