@echo off
title AGRI PLATFORM STARTER

echo ==========================================
echo   DEMARRAGE DE LA PLATEFORME AGRICOLE
echo ==========================================

:: ==========================================
:: 1. Nettoyage des ports conflictuels
:: ==========================================
echo [1/7] Liberation des ports (3000,3001,8001,8002,8003)...
for %%p in (3000 3001 8001 8002 8003) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        echo    Tuer le processus %%a sur le port %%p
        taskkill /PID %%a /F >nul 2>&1
    )
)
timeout /t 2 >nul

:: ==========================================
:: 2. Lancement de l'infrastructure Docker
:: ==========================================
echo [2/7] Demarrage de l'infrastructure (Postgres, Kafka, Spark, Temporal)...
cd /d %~dp0
docker compose up -d
timeout /t 5 >nul

:: ==========================================
:: 3. Creation du topic Kafka
:: ==========================================
echo [3/7] Creation du topic agriculteurs-topic si inexistant...
docker exec -it kafka kafka-topics --create --topic agriculteurs-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 2>nul
echo    Topic pret.

:: ==========================================
:: 4. Services lancés via Docker (recommandé)
:: ==========================================
:: En mode A, on évite de lancer Python/NestJS/worker sur Windows host.
:: On ne lance que le frontend React (optionnel) côté host.

:: ==========================================
:: 5. Lancement du frontend React
:: ==========================================
echo [4/4] Lancement du FRONTEND REACT (port 5173)...
start cmd /k "cd /d frontend\agri-ui && npm run dev"

echo.
echo ==========================================
echo   TOUS LES SERVICES SONT LANCES (mode Docker)
echo ==========================================
echo.
echo   Infra Docker      : PostgreSQL, Kafka, Spark, Temporal
echo   Farmer Service    : http://localhost:8001
echo   Weather Service   : http://localhost:8002
echo   Price Service     : http://localhost:8003
echo   Gateway           : http://localhost:3000
echo   Auth Service      : http://localhost:3001
echo   Frontend          : http://localhost:5173
echo.
echo   Pour arreter : docker compose down && fermez la fenetre frontend.
pause
