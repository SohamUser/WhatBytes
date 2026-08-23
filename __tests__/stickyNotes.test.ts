import {
  buildStickyTaskInput,
  getStickyAppearance,
  getStickyCardTitle,
  restoreStickyDraft,
} from "@/utils/stickyNotes";

describe("sticky note utilities", () => {
  it("maps a multiline draft to the existing task schema", () => {
    const parsed = buildStickyTaskInput("Ship photos", "Use the final selects");

    expect(parsed).toMatchObject({
      title: "Ship photos",
      description: "Use the final selects",
      priority: "medium",
    });
    expect(parsed?.dueDate).toBeInstanceOf(Date);
  });

  it("trims title and description and respects limits", () => {
    const parsed = buildStickyTaskInput(`  ${"a".repeat(125)}  `, `  ${"b".repeat(1100)}  `);

    expect(parsed?.title).toHaveLength(120);
    expect(parsed?.description).toHaveLength(1000);
  });

  it("rejects empty drafts", () => {
    expect(buildStickyTaskInput("   ", "Description without a title")).toBeNull();
  });

  it("restores title and description as independent fields", () => {
    expect(restoreStickyDraft({ title: "Ship photos", description: "Final selects" })).toEqual({
      title: "Ship photos",
      description: "Final selects",
    });
  });

  it("exposes only the title as sticky-card content", () => {
    expect(getStickyCardTitle({ title: "Visible title" })).toBe("Visible title");
  });

  it("keeps paper presentation stable for a task ID", () => {
    const first = getStickyAppearance("task-42");
    const second = getStickyAppearance("task-42");

    expect(second).toEqual(first);
    expect(first.rotation).toBeGreaterThanOrEqual(-2);
    expect(first.rotation).toBeLessThanOrEqual(2);
  });
});
