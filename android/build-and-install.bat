@echo off
echo.
echo === [1/5] Building React (Vite) app...
npm run build

echo.
echo === [2/5] Copying files to Android with Capacitor...
npx cap copy android

echo.
echo === [3/5] Building APK with Gradle...
cd android
call gradlew assembleDebug
cd ..

echo.
echo === [4/5] Installing APK on connected Android device...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo ✅ APK installed successfully!
pause
