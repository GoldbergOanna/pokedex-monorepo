import { MAX_PAGE_SIZE, pokemonIdSchema, pokemonListQuerySchema } from "./validation";

describe("pokemonListQuerySchema", () => {
  it("applies defaults when page and limit are missing", () => {
    expect(pokemonListQuerySchema.parse({})).toMatchObject({ page: 1, limit: 20 });
  });

  it.each([
    [{ page: "0" }],
    [{ page: "-1" }],
    [{ page: "abc" }],
    [{ limit: "0" }],
    [{ limit: String(MAX_PAGE_SIZE + 1) }],
  ])("rejects %j", (query) => {
    expect(pokemonListQuerySchema.safeParse(query).success).toBe(false);
  });
});

describe("pokemonIdSchema", () => {
  it("accepts a positive integer string", () => {
    expect(pokemonIdSchema.parse("6")).toBe(6);
  });

  it.each(["abc", "0", "-3", "1.5"])("rejects %s", (id) => {
    expect(pokemonIdSchema.safeParse(id).success).toBe(false);
  });
});
