import { Router } from 'express';
import { login, refresh, logout } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate-body.middleware';
import { LoginSchema } from '../dtos/login.dto';
import { RefreshTokenSchema } from '../dtos/refresh-token.dto';

const router = Router();

router.post('/login', validateBody(LoginSchema), login);
router.post('/refresh', validateBody(RefreshTokenSchema), refresh);
router.post('/logout', validateBody(RefreshTokenSchema), logout);

export default router;