@echo off
title PLUME - Lancement
echo [1/2] Lancement du serveur PowerShell...

:: Lance PowerShell en mode cache avec bypass de politique d'execution
start powershell.exe -ExecutionPolicy Bypass -File "%~dp0server.ps1"

:: Attente de 2 secondes pour laisser le temps au serveur de démarrer
timeout /t 2 /nobreak >nul

echo [2/2] Ouverture de PLUME dans votre navigateur...
start http://localhost:8080
exit
