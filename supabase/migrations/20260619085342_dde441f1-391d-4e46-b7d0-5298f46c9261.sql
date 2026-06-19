-- has_role and is_admin are only meant to be used inside RLS policies
-- (which evaluate with the definer's privileges). Remove direct EXECUTE
-- so they cannot be probed by anon or authenticated callers.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;

-- claim_first_admin must remain callable by signed-in users (that's the
-- whole point — bootstrap the first admin). Just make sure anon cannot.
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;