
-- Lock down SECURITY DEFINER pgmq wrappers: only the service role should call these.
DO $$
DECLARE
  fn text;
  sig text;
BEGIN
  FOREACH sig IN ARRAY ARRAY[
    'public.read_email_batch(text, integer, integer)',
    'public.delete_email(text, bigint)',
    'public.enqueue_email(text, jsonb)',
    'public.move_to_dlq(text, text, bigint, jsonb)'
  ]
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
  END LOOP;
END $$;
