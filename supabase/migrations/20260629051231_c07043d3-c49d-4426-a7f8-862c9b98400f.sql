
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  recipient_name TEXT,
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;
GRANT ALL ON public.user_addresses TO service_role;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_addresses_owner_all" ON public.user_addresses;
CREATE POLICY "user_addresses_owner_all" ON public.user_addresses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS user_addresses_user_id_idx ON public.user_addresses(user_id);
DROP TRIGGER IF EXISTS user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER user_addresses_updated_at BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_handle TEXT NOT NULL,
  title TEXT,
  image_url TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'INR',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_handle)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlist_owner_all" ON public.wishlist_items;
CREATE POLICY "wishlist_owner_all" ON public.wishlist_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON public.wishlist_items(user_id);
