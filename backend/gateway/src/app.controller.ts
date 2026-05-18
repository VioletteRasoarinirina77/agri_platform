import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import axios, { AxiosError } from 'axios';

@Controller('api')
export class AppController {
  // 💰 Prix des produits agricoles – public
  @Get('prix')
  async obtenirPrix() {
    try {
      const base = process.env.PRICE_SERVICE_BASE_URL ?? 'http://price-service:8003';
      const res = await axios.get(`${base}/prix`);

      return res.data;
    } catch (err) {
      const e = err as AxiosError<any>;
      const upstreamStatus = e.response?.status;
      const upstreamData = e.response?.data;

      // eslint-disable-next-line no-console
      console.error('[gateway] GET /api/prix upstream error', {
        upstreamStatus,
        upstreamData,
        message: e.message,
      });

      throw new HttpException(
        {
          message: 'Erreur lors de la récupération des prix',
          upstreamStatus,
          upstreamData,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🌦️ Météo par région – public
  @Get('meteo/:region')
  async obtenirMeteo(@Param('region') region: string) {
    try {
      const weatherBase = process.env.WEATHER_SERVICE_BASE_URL ?? 'http://weather-service:8002';
      const res = await axios.get(`${weatherBase}/meteo/${region}`);

      return res.data;
    } catch (err) {
      const e = err as AxiosError<any>;
      const upstreamStatus = e.response?.status;
      const upstreamData = e.response?.data;

      // eslint-disable-next-line no-console
      console.error('[gateway] GET /api/meteo upstream error', {
        region,
        upstreamStatus,
        upstreamData,
        message: e.message,
      });

      throw new HttpException(
        {
          message: 'Erreur lors de la récupération de la météo',
          region,
          upstreamStatus,
          upstreamData,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🌾 Liste des agriculteurs – public (lecture seule)
  @Get('agriculteurs')
  async obtenirAgriculteurs() {
    try {
      const farmerBase = process.env.FARMER_SERVICE_BASE_URL ?? 'http://farmer-service:8001';
      const res = await axios.get(`${farmerBase}/agriculteurs`);

      return res.data;
    } catch (err) {
      const e = err as AxiosError<any>;
      const upstreamStatus = e.response?.status;
      const upstreamData = e.response?.data;

      // eslint-disable-next-line no-console
      console.error('[gateway] GET /api/agriculteurs upstream error', {
        upstreamStatus,
        upstreamData,
        message: e.message,
      });

      throw new HttpException(
        {
          message: 'Erreur lors de la récupération des agriculteurs',
          upstreamStatus,
          upstreamData,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ➕ Ajouter un agriculteur – PROTÉGÉ par JWT
  // ➕ Ajouter un agriculteur – protection JWT désactivée pour les tests
  @Post('agriculteurs')
  @UseGuards(AuthGuard('jwt'))
  async ajouterAgriculteur(@Body() body: any) {
    try {
      const farmerBase = process.env.FARMER_SERVICE_BASE_URL ?? 'http://farmer-service:8001';
      const res = await axios.post(`${farmerBase}/agriculteurs`, body);

      return {
        message: 'Agriculteur ajouté avec succès',
        donnees: res.data,
      };
    } catch (err) {
      const e = err as AxiosError<any>;
      const upstreamStatus = e.response?.status;
      const upstreamData = e.response?.data;

      // eslint-disable-next-line no-console
      console.error('[gateway] POST /api/agriculteurs upstream error', {
        upstreamStatus,
        upstreamData,
        message: e.message,
      });

      throw new HttpException(
        {
          message: 'Erreur lors de l’ajout de l’agriculteur',
          upstreamStatus,
          upstreamData,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

