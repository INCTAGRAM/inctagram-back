import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: Partial<User>, token: string) {
    const url = `https://inctagram-m9ju.vercel.app/registration/confirmation?code=${token}&email=${user.email}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to INCTAGRAM! Confirm your Email',
      template: 'confirmation',
      context: {
        name: 'stranger',
        url,
      },
    });
  }

  async sendPasswordRecovery(user: User, token: string) {
    const url = `https://inctagram-m9ju.vercel.app/recovery/new-password?code=${token}&email=${user.email}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to INCTAGRAM! Recover your password',
      template: 'recovery',
      context: {
        name: 'stranger',
        url,
      },
    });
  }
}
