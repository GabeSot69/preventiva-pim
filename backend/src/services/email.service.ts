import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: env.MAIL_USER && env.MAIL_PASS ? {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      } : undefined,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: env.MAIL_FROM,
      to: email,
      subject: 'Redefinição de Senha - Preventiva PIM',
      html: `
        <h1>Redefinição de Senha</h1>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      `,
    };

    try {
      if (env.NODE_ENV === 'development' && !env.MAIL_HOST) {
        logger.info(`[Email Fake] Link de reset para ${email}: ${resetUrl}`);
        return;
      }
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Erro ao enviar e-mail de redefinição de senha:', error);
      throw new Error('Falha ao enviar e-mail de redefinição de senha');
    }
  }
}
