import {
  Request,
  Response,
} from 'express';

import {
  AuthService,
} from '../services/auth.service.js';

import {
  AuthRepository,
} from '../repositories/auth.repository.js';

import {
  AuthenticatedRequest,
} from '../../../middlewares/auth.middleware.js';


const authRepository =
  new AuthRepository();

const authService =
  new AuthService(authRepository);


const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:
    7 * 24 * 60 * 60 * 1000,
};


// ==================================================
// REGISTER
// ==================================================

export async function registerController(
  req: Request,
  res: Response
): Promise<void> {

  const {
    responsePayload,
    sessionToken,
  } = await authService.register(
    req.body
  );


  res.cookie(
    'session_token',
    sessionToken,
    COOKIE_OPTIONS
  );


  res.status(201).json({
    success: true,
    message: responsePayload.message || 'Registration successful',
    data: responsePayload,
    ...responsePayload,
  });
}


// ==================================================
// LOGIN
// ==================================================

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {

  const {
    responsePayload,
    sessionToken,
  } = await authService.login(
    req.body
  );


  res.cookie(
    'session_token',
    sessionToken,
    COOKIE_OPTIONS
  );


  res.status(200).json({
    success: true,
    message: responsePayload.message || 'Login successful',
    data: responsePayload,
    ...responsePayload,
  });
}


export const signinController =
  loginController;


// ==================================================
// REFRESH TOKEN
// ==================================================

export async function refreshTokenController(
  req: Request,
  res: Response
): Promise<void> {

  const sessionToken =
    req.cookies?.session_token ||
    req.body?.refreshToken;


  const result =
    await authService.refreshTokens(
      sessionToken
    );


  if (result.newSessionToken) {

    res.cookie(
      'session_token',
      result.newSessionToken,
      COOKIE_OPTIONS
    );
  }


  res.status(200).json({
    success: true,

    message:
      'Access token refreshed successfully.',

    data: {
      accessToken:
        result.accessToken,

      accessTokenExpiresIn:
        result.accessTokenExpiresIn,
    },
  });
}


// ==================================================
// LOGOUT
// ==================================================

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {

  const sessionToken =
    req.cookies?.session_token ||
    req.body?.refreshToken;


  await authService.logout(
    sessionToken
  );


  res.clearCookie(
    'session_token'
  );


  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}


// ==================================================
// CURRENT USER
// ==================================================

export async function getCurrentUserController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {

  const userId =
    req.user!.userId;


  const user =
    await authService.getCurrentUser(
      userId
    );


  res.status(200).json({
    success: true,
    user,
    data: user,
  });
}

// ==================================================
// GOOGLE LOGIN / SIGN UP
// ==================================================

export async function googleLoginController(
  req: Request,
  res: Response
): Promise<void> {
  const { responsePayload, sessionToken } = await authService.googleLogin(req.body);

  res.cookie('session_token', sessionToken, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: responsePayload.message || 'Google authentication successful',
    data: responsePayload,
    ...responsePayload,
  });
}

// ==================================================
// FORGOT PASSWORD
// ==================================================

export async function forgotPasswordController(
  req: Request,
  res: Response
): Promise<void> {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    ...result,
  });
}

// ==================================================
// RESET PASSWORD
// ==================================================

export async function resetPasswordController(
  req: Request,
  res: Response
): Promise<void> {
  const result = await authService.resetPassword(req.body.token, req.body.newPassword);

  res.status(200).json({
    success: true,
    ...result,
  });
}
