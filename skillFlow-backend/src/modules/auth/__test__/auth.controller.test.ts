import { describe, it, expect, vi } from 'vitest';
import {
  loginController,
  logoutController,
  getCurrentUserController,
} from '../controllers/auth.controller.js';

describe('AuthController (Unit Tests)', () => {
  function createMockResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.cookie = vi.fn().mockReturnValue(res);
    res.clearCookie = vi.fn().mockReturnValue(res);
    return res;
  }

  it('loginController - should authenticate user, set session cookie, and return 200 status', async () => {
    const req: any = {
      body: {
        email: 'sneha@gmail.com',
        password: 'abc123',
      },
    };
    const res = createMockResponse();

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith('session_token', expect.any(String), expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: expect.any(String) }));
  });

  it('logoutController - should revoke session, clear cookie, and return 200 status', async () => {
    const req: any = {
      cookies: { session_token: 'valid_session_token' },
    };
    const res = createMockResponse();

    await logoutController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.clearCookie).toHaveBeenCalledWith('session_token');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('getCurrentUserController - should return authenticated user profile and 200 status', async () => {
    const req: any = {
      user: { userId: 'usr_sneha' },
    };
    const res = createMockResponse();

    await getCurrentUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.any(Object) }));
  });
});
