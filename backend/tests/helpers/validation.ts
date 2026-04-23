import request from 'supertest';
import app from '../../src/server';

export const validateErrorFormat = (res: request.Response) => {
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('message', 'Erro de validação');
  expect(res.body).toHaveProperty('errors');
};
