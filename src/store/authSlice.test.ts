import authReducer, {
  login,
  logout,
  updatePersona,
  selectUserRole,
  selectIsAdmin,
  selectUserName,
} from "./authSlice";

const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: "admin" as const,
  persona: "student" as const,
};

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial state with null user and token", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  describe("login", () => {
    it("should set user and token", () => {
      const state = authReducer(
        undefined,
        login({ user: mockUser, token: "jwt-token" }),
      );
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("jwt-token");
    });

    it("should persist to localStorage", () => {
      authReducer(undefined, login({ user: mockUser, token: "jwt-token" }));
      expect(localStorage.getItem("token")).toBe("jwt-token");
      expect(JSON.parse(localStorage.getItem("user") || "null")).toEqual(
        mockUser,
      );
    });
  });

  describe("logout", () => {
    it("should clear user and token", () => {
      const loggedIn = authReducer(
        undefined,
        login({ user: mockUser, token: "jwt-token" }),
      );
      const state = authReducer(loggedIn, logout());
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it("should remove from localStorage", () => {
      authReducer(undefined, login({ user: mockUser, token: "jwt-token" }));
      authReducer(undefined, logout());
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("updatePersona", () => {
    it("should update persona on logged-in user", () => {
      const loggedIn = authReducer(
        undefined,
        login({ user: mockUser, token: "jwt-token" }),
      );
      const state = authReducer(loggedIn, updatePersona("researcher"));
      expect(state.user?.persona).toBe("researcher");
    });

    it("should persist updated persona to localStorage", () => {
      const loggedIn = authReducer(
        undefined,
        login({ user: mockUser, token: "jwt-token" }),
      );
      authReducer(loggedIn, updatePersona("teacher"));
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      expect(stored.persona).toBe("teacher");
    });

    it("should do nothing when no user is logged in", () => {
      const state = authReducer(undefined, updatePersona("researcher"));
      expect(state.user).toBeNull();
    });
  });

  describe("selectors", () => {
    it("selectUserRole should return guest when no user", () => {
      expect(selectUserRole({ auth: { user: null, token: null } })).toBe(
        "guest",
      );
    });

    it("selectUserRole should return persona even for admin users", () => {
      expect(selectUserRole({ auth: { user: mockUser, token: "x" } })).toBe(
        "student",
      );
    });

    it("selectUserRole should return persona for regular users", () => {
      const regularUser = {
        ...mockUser,
        role: "user" as const,
        persona: "researcher" as const,
      };
      expect(selectUserRole({ auth: { user: regularUser, token: "x" } })).toBe(
        "researcher",
      );
    });

    it("selectIsAdmin should return true for admin users", () => {
      expect(selectIsAdmin({ auth: { user: mockUser, token: "x" } })).toBe(
        true,
      );
    });

    it("selectIsAdmin should return false for regular users", () => {
      const regularUser = {
        ...mockUser,
        role: "user" as const,
      };
      expect(selectIsAdmin({ auth: { user: regularUser, token: "x" } })).toBe(
        false,
      );
    });

    it("selectIsAdmin should return false when no user", () => {
      expect(selectIsAdmin({ auth: { user: null, token: null } })).toBe(false);
    });

    it("selectUserName should return username when logged in", () => {
      expect(selectUserName({ auth: { user: mockUser, token: "x" } })).toBe(
        "testuser",
      );
    });

    it("selectUserName should return undefined when no user", () => {
      expect(
        selectUserName({ auth: { user: null, token: null } }),
      ).toBeUndefined();
    });
  });
});
