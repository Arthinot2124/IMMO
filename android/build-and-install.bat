@echo off
echo ========== Build APK (Debug) ==========
cd /d %~dp0

REM Lance la compilation avec Gradle
gradlew.bat assembleDebug

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur pendant le build.
    pause
    exit /b %ERRORLEVEL%
)

echo ✅ Build terminé.

REM Localisation de l'APK
set APK_PATH=app\build\outputs\apk\debug\app-debug.apk

IF NOT EXIST %APK_PATH% (
    echo ❌ APK non trouvé : %APK_PATH%
    pause
    exit /b 1
)

echo ========== Installation de l'APK sur l'appareil ==========
adb install -r %APK_PATH%

IF %ERRORLEVEL% EQU 0 (
    echo ✅ APK installé avec succès !
) ELSE (
    echo ❌ Erreur pendant l'installation. Vérifie que ton téléphone est connecté en USB et que le débogage USB est activé.
)

pause
