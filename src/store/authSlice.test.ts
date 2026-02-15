import authReducer, { login, logout, selectUserRole, selectUserName } from './authSlice';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  role: 'admin' as const,
};

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial state with null user and token', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  describe('login', () => {
    it('should set user and token', () => {
      const state = authReducer(undefined, login({ user: mockUser, token: 'jwt-token' }));
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('jwt-token');
    });

    it('should persist to localStorage', () => {
      authReducer(undefined, login({ user: mockUser, token: 'jwt-token' }));
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(JSON.parse(localStorage.getItem('user') || 'null')).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear user and token', () => {
      const loggedIn = authReducer(undefined, login({ user: mockUser, token: 'jwt-token' }));
      const state = authReducer(loggedIn, logout());
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it('should remove from localStorage', () => {
      authReducer(undefined, login({ user: mockUser, token: 'jwt-token' }));
      authReducer(undefined, logout());
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectUserRole should return guest when no user', () => {
      expect(selectUserRole({ auth: { user: null, token: null } })).toBe('guest');
    });

    it('selectUserRole should return user role when logged in', () => {
      expect(selectUserRole({ auth: { user: mockUser, token: 'x' } })).toBe('admin');
    });

    it('selectUserName should return username when logged in', () => {
      expect(selectUserName({ auth: { user: mockUser, token: 'x' } })).toBe('testuser');
    });

    it('selectUserName should return undefined when no user', () => {
      expect(selectUserName({ auth: { user: null, token: null } })).toBeUndefined();
    });
  });
});
