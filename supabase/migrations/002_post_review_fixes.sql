-- 1. Cancel-safe player-count trigger.
--    On DELETE: only re-open if the post is currently 'full'.
--    Cancelled / expired posts stay in their terminal state.
CREATE OR REPLACE FUNCTION update_players_joined()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET
      players_joined = players_joined + 1,
      status = CASE
        WHEN status = 'open'::post_status
         AND players_joined + 1 >= players_needed
          THEN 'full'::post_status
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET
      players_joined = GREATEST(players_joined - 1, 0),
      status = CASE
        WHEN status = 'full'::post_status
         AND GREATEST(players_joined - 1, 0) < players_needed
          THEN 'open'::post_status
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Let post authors cancel (UPDATE status='cancelled') and delete their own posts.
CREATE POLICY "Posts delete own" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- 3. Generic updated_at trigger for tables that need it.
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS touch_courts_updated_at ON courts;
CREATE TRIGGER touch_courts_updated_at
  BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_users_updated_at ON users;
CREATE TRIGGER touch_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
