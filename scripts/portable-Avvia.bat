@echo off
setlocal EnableDelayedExpansion
title 3DPrintSW - non chiudere questa finestra mentre usi il programma

set "APPDIR=%~dp0"
set "SERVERDIR=%APPDIR%app-server"
set "DATADIR=%APPDIR%data"
set "UPLOADSDIR=%DATADIR%\uploads"
set "DBPATH=%DATADIR%\app.db"
set PORT=3131

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    taskkill /PID %%P /F >nul 2>&1
)

if not exist "%DATADIR%" mkdir "%DATADIR%"
if not exist "%UPLOADSDIR%" mkdir "%UPLOADSDIR%"

if not exist "%DBPATH%" (
    echo Preparazione del database, attendere...
    copy /Y "%APPDIR%template\app-template.db" "%DBPATH%" >nul
)

if exist "%SERVERDIR%\public\uploads" (
    rmdir /S /Q "%SERVERDIR%\public\uploads" 2>nul
    if exist "%SERVERDIR%\public\uploads" rmdir "%SERVERDIR%\public\uploads" 2>nul
)
if not exist "%SERVERDIR%\public" mkdir "%SERVERDIR%\public"
mklink /J "%SERVERDIR%\public\uploads" "%UPLOADSDIR%" >nul 2>&1

set HOSTNAME=127.0.0.1
set NODE_ENV=production
set DATABASE_URL=file:%DBPATH%

echo.
echo Avvio 3DPrintSW...
if exist "%APPDIR%VERSION.txt" type "%APPDIR%VERSION.txt"
echo.
echo Il browser si aprira' automaticamente tra qualche secondo.
echo NON CHIUDERE questa finestra mentre usi il programma.
echo Per uscire: chiudi semplicemente questa finestra.
echo.

start "" /min cmd /c "timeout /t 4 /nobreak >nul & start http://127.0.0.1:%PORT%/?v=portable"

cd /d "%SERVERDIR%"
"%APPDIR%node\node.exe" server.js

pause
