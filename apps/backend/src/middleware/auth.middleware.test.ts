import { authMiddleware } from "./auth.middleware";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

const JWT_SECRET = "testsecret";
process.env.JWT_SECRET = JWT_SECRET;

const mockNext = jest.fn();

import type { Context } from "hono";

const createMockContext = (authHeader?: string): Context => {
  return {
    req: {
      header: jest.fn().mockReturnValue(authHeader),
    },
    json: jest.fn(),
    set: jest.fn(),
    env: {},
    finalized: false,
    error: undefined,
    event: undefined,
    res: {} as Response,
    var: {},
    get: jest.fn(),
    status: 200,
    header: jest.fn(),
    body: undefined,
    headers: {},
    path: "",
    query: {},
    param: jest.fn(),
    url: "",
    method: "GET",
    runtime: "node",
    executionCtx: undefined,
    notFound: jest.fn(),
    redirect: jest.fn(),
    text: jest.fn(),
    html: jest.fn(),
    newResponse: jest.fn(),
    render: jest.fn(),
    onError: jest.fn(),
    onNotFound: jest.fn(),
    cookie: jest.fn(),
    raw: {} as Record<string, unknown>,
  } as unknown as Context;
};

describe("authMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if Authorization header is missing", async () => {
    const c = createMockContext(undefined);
    await authMiddleware(c, mockNext);
    expect(c.json).toHaveBeenCalledWith(
      { error: "Missing or invalid Authorization header" },
      401,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header is invalid", async () => {
    const c = createMockContext("InvalidToken");
    await authMiddleware(c, mockNext);
    expect(c.json).toHaveBeenCalledWith(
      { error: "Missing or invalid Authorization header" },
      401,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 if JWT verification fails", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });
    const c = createMockContext("Bearer faketoken");
    await authMiddleware(c, mockNext);
    expect(c.json).toHaveBeenCalledWith(
      { error: "Invalid or expired token" },
      401,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should set user and call next if token is valid", async () => {
    const decoded = { id: "user1", email: "test@example.com" };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);
    const c = createMockContext("Bearer validtoken");
    await authMiddleware(c, mockNext);
    expect(c.set).toHaveBeenCalledWith("user", decoded);
    expect(mockNext).toHaveBeenCalled();
    expect(c.json).not.toHaveBeenCalled();
  });
});
