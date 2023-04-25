import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { getApp } from '../testing-connection';

describe('UserController', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    app = await getApp();
    prisma = await app.resolve(PrismaService);
    jwtService = await app.resolve(JwtService);
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe('As an authorized user, I want to be able to check and update my profile', () => {
    describe('The user successfully updates his profile', () => {
      it('should prepare the data');
    });
  });
});
