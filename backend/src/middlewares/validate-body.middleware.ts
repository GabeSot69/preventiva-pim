import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sanitizeObject } from '../config/sanitization';

export const validateBody = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validacao = schema.safeParse(req.body);
    if (!validacao.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validacao.error.format() 
      });
    }

    // Sanitiza os dados já validados
    req.body = sanitizeObject(validacao.data);
    return next();
  };
};
