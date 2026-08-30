import {
  Router,
  Request,
  Response,
  NextFunction,
} from 'express';


import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  googleLoginController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/auth.controller.js';


import {
  loginSchema,
  registerSchema,
} from '../schemas/auth.schema.js';


import {
  authGuard,
} from '../../../middlewares/auth.middleware.js';


import {
  authRateLimiter,
} from '../../../middlewares/rate-limiter.middleware.js';


export const authRouter =
  Router();


function validateBody(
  schema: any
) {

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    req.body =
      schema.parse(req.body);

    next();
  };
}


// ==================================================
// REGISTER
// ==================================================

authRouter.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  registerController
);


// ==================================================
// LOGIN
// ==================================================

authRouter.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  loginController
);


// ==================================================
// REFRESH
// ==================================================

authRouter.post(
  '/refresh',
  refreshTokenController
);


// ==================================================
// LOGOUT
// ==================================================

authRouter.post(
  '/logout',
  authGuard,
  logoutController
);


// ==================================================
// GET CURRENT USER
// ==================================================

authRouter.get(
  '/me',
  authGuard,
  getCurrentUserController
);

// ==================================================
// GOOGLE OAUTH
// ==================================================

authRouter.post(
  '/google',
  authRateLimiter,
  googleLoginController
);

// ==================================================
// FORGOT & RESET PASSWORD
// ==================================================

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  forgotPasswordController
);

authRouter.post(
  '/reset-password',
  authRateLimiter,
  resetPasswordController
);

 