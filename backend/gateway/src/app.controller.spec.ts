import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';



import { describe, it, expect, beforeEach } from '@jest/globals';

describe('AppController', () => {

  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],

    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
  it('should be defined', () => {
      expect(appController).toBeDefined();
    });


  });
});
