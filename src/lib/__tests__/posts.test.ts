import { describe, it, expect } from "vitest";
import { flattenPostRow, type JoinedRow } from "@/lib/posts";

const baseRow: JoinedRow = {
  id: "post-1",
  author_id: "user-1",
  court_id: "court-1",
  court_name_override: null,
  play_date: "2026-04-25",
  play_time: "18:00",
  skill_level: "intermediate",
  players_needed: 2,
  players_joined: 1,
  message: "Looking for two more.",
  status: "open",
  created_at: "2026-04-24T10:00:00Z",
  author: {
    name: "Maria",
    skill_level: "intermediate",
    avatar_url: "https://example.com/m.jpg",
  },
  court: {
    name: "House of Padel",
    slug: "house-of-padel",
    latitude: 53.3498,
    longitude: -6.2603,
  },
};

describe("flattenPostRow", () => {
  it("flattens nested author + court into top-level fields", () => {
    const post = flattenPostRow(baseRow);
    expect(post.id).toBe("post-1");
    expect(post.author_name).toBe("Maria");
    expect(post.author_skill_level).toBe("intermediate");
    expect(post.author_avatar_url).toBe("https://example.com/m.jpg");
    expect(post.court_name).toBe("House of Padel");
    expect(post.court_slug).toBe("house-of-padel");
  });

  it("falls back to court_name_override when court relation is null", () => {
    const post = flattenPostRow({
      ...baseRow,
      court_id: null,
      court: null,
      court_name_override: "My Garage Court",
    });
    expect(post.court_name).toBe("My Garage Court");
    expect(post.court_slug).toBeUndefined();
  });

  it("prefers the court relation name over the override", () => {
    const post = flattenPostRow({
      ...baseRow,
      court_name_override: "Should be ignored",
    });
    expect(post.court_name).toBe("House of Padel");
  });

  it("treats missing author as undefined fields, not crashes", () => {
    const post = flattenPostRow({ ...baseRow, author: null });
    expect(post.author_name).toBeUndefined();
    expect(post.author_skill_level).toBeUndefined();
    expect(post.author_avatar_url).toBeNull();
  });
});
