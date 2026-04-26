-- NOTE: Task 7 must land in the same release as this migration.
-- The tightened RLS below rejects direct INSERTs into `responses`, so any
-- client still calling `supabase.from('responses').insert(...)` will fail.
-- Task 7 switches the client over to `supabase.rpc('join_post', ...)`.

-- 1. Tighten responses INSERT: only allow joining open posts where the
--    user is not the author. Combined with the RPC below this gives us
--    defence-in-depth against direct PostgREST inserts.
DROP POLICY IF EXISTS "Responses insert own" ON responses;
CREATE POLICY "Responses insert own" ON responses
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_id
        AND p.status = 'open'::post_status
        AND p.author_id <> auth.uid()
    )
  );

-- 2. Race-safe join. Locks the post row, re-checks state, inserts the
--    response, and lets the existing trigger bump players_joined.
CREATE OR REPLACE FUNCTION join_post(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post posts%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_post FROM posts WHERE id = p_post_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_post.author_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot join your own post' USING ERRCODE = '23514';
  END IF;

  IF v_post.status <> 'open'::post_status THEN
    RAISE EXCEPTION 'Post is not open' USING ERRCODE = '23514';
  END IF;

  IF v_post.players_joined >= v_post.players_needed THEN
    RAISE EXCEPTION 'Post is full' USING ERRCODE = '23514';
  END IF;

  INSERT INTO responses (post_id, user_id) VALUES (p_post_id, auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION join_post(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION join_post(UUID) TO authenticated;

-- 3. Mark stale open / full posts as expired. Idempotent.
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE posts
     SET status = 'expired'::post_status,
         updated_at = NOW()
   WHERE status IN ('open', 'full')
     AND play_date < (NOW() AT TIME ZONE 'Europe/Dublin')::date;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION expire_old_posts() TO service_role;
