
CREATE TABLE public.product_click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('add_to_cart', 'buy_now')),
  product_id text NOT NULL,
  variant_id text,
  session_id text NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_click_events_session_product_idx
  ON public.product_click_events (session_id, product_id, created_at DESC);
CREATE INDEX product_click_events_created_at_idx
  ON public.product_click_events (created_at DESC);

GRANT INSERT ON public.product_click_events TO anon, authenticated;
GRANT SELECT ON public.product_click_events TO authenticated;
GRANT ALL ON public.product_click_events TO service_role;

ALTER TABLE public.product_click_events ENABLE ROW LEVEL SECURITY;

-- Anyone may insert a click event (telemetry).
CREATE POLICY "Anyone can log a click event"
  ON public.product_click_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IN ('add_to_cart', 'buy_now')
    AND length(session_id) BETWEEN 1 AND 64
    AND length(product_id) BETWEEN 1 AND 200
    AND (variant_id IS NULL OR length(variant_id) <= 200)
  );

-- Only admins can read the log.
CREATE POLICY "Admins can read click events"
  ON public.product_click_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
