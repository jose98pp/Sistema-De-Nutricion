@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cls

echo ╔════════════════════════════════════════════════════════╗
echo ║   🔧 SOLUCIONADOR AUTOMÁTICO - APP MÓVIL              ║
echo ╚════════════════════════════════════════════════════════╝
echo.

:: Paso 1: Detectar IP
echo [1/5] 📍 Detectando IP actual...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP_DETECTADA=%%a
    set IP_DETECTADA=!IP_DETECTADA: =!
)

if "!IP_DETECTADA!"=="" (
    echo ❌ No se pudo detectar la IP
    echo 💡 Verifica tu conexión WiFi
    pause
    exit /b 1
)

echo    ✅ IP detectada: !IP_DETECTADA!
echo.

:: Paso 2: Verificar servidor Laravel
echo [2/5] 🌐 Verificando servidor Laravel...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Servidor Laravel está corriendo
    set SERVIDOR_CORRIENDO=1
) else (
    echo    ⚠️  Servidor Laravel NO está corriendo
    set SERVIDOR_CORRIENDO=0
)
echo.

:: Paso 3: Leer configuración actual
echo [3/5] 📋 Verificando configuración actual...
if exist "nutrisystem-app\.env" (
    for /f "tokens=1,2 delims==" %%a in ('findstr "API_URL" nutrisystem-app\.env') do (
        set CONFIG_ACTUAL=%%b
    )
    echo    Configuración actual: !CONFIG_ACTUAL!
    
    :: Extraer IP de la configuración
    for /f "tokens=3 delims=:/" %%a in ("!CONFIG_ACTUAL!") do (
        set IP_CONFIG=%%a
    )
    
    if "!IP_CONFIG!"=="!IP_DETECTADA!" (
        echo    ✅ La IP en la configuración es correcta
        set NECESITA_ACTUALIZAR=0
    ) else (
        echo    ⚠️  La IP en la configuración es diferente
        echo    💡 Se actualizará de !IP_CONFIG! a !IP_DETECTADA!
        set NECESITA_ACTUALIZAR=1
    )
) else (
    echo    ❌ Archivo .env no encontrado
    set NECESITA_ACTUALIZAR=1
)
echo.

:: Paso 4: Actualizar configuración si es necesario
if !NECESITA_ACTUALIZAR! equ 1 (
    echo [4/5] 📝 Actualizando configuración...
    (
    echo API_URL=http://!IP_DETECTADA!:8000/api
    echo ENVIRONMENT=development
    echo.
    echo # Pusher/Reverb WebSocket Configuration
    echo PUSHER_KEY=7b5sxmaaowzskckuk50f
    echo PUSHER_CLUSTER=mt1
    echo PUSHER_HOST=!IP_DETECTADA!
    echo PUSHER_PORT=8080
    echo PUSHER_SCHEME=http
    echo.
    ) > nutrisystem-app\.env
    echo    ✅ Configuración actualizada
) else (
    echo [4/5] ✅ Configuración correcta, no requiere cambios
)
echo.

:: Paso 5: Probar conexión
echo [5/5] 🔌 Probando conexión...
if !SERVIDOR_CORRIENDO! equ 1 (
    curl -s -o nul -w "%%{http_code}" http://!IP_DETECTADA!:8000/api/dashboard >temp_status.txt 2>nul
    set /p HTTP_STATUS=<temp_status.txt
    del temp_status.txt 2>nul
    
    if "!HTTP_STATUS!"=="200" (
        echo    ✅ Conexión exitosa (HTTP 200)
        set TODO_OK=1
    ) else if "!HTTP_STATUS!"=="401" (
        echo    ⚠️  Servidor responde pero requiere autenticación (HTTP 401)
        echo    💡 Esto es normal, la app funcionará correctamente
        set TODO_OK=1
    ) else (
        echo    ⚠️  Servidor responde con código: !HTTP_STATUS!
        set TODO_OK=0
    )
) else (
    echo    ⚠️  No se puede probar, servidor no está corriendo
    set TODO_OK=0
)
echo.

:: Resumen y recomendaciones
echo ╔════════════════════════════════════════════════════════╗
echo ║   📊 RESUMEN                                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo IP detectada:        !IP_DETECTADA!
echo Servidor Laravel:    !SERVIDOR_CORRIENDO! (1=corriendo, 0=detenido)
echo Config actualizada:  !NECESITA_ACTUALIZAR! (1=sí, 0=no)
echo.

if !TODO_OK! equ 1 (
    echo ╔════════════════════════════════════════════════════════╗
    echo ║   ✅ TODO LISTO                                       ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    echo La configuración está correcta y el servidor responde.
    echo.
    if !NECESITA_ACTUALIZAR! equ 1 (
        echo ⚠️  IMPORTANTE: Reinicia la app móvil
        echo.
        echo En la terminal de Expo:
        echo 1. Presiona Ctrl+C para detener
        echo 2. Ejecuta: npx expo start -c
        echo 3. Escanea el QR nuevamente
    ) else (
        echo La app debería funcionar correctamente.
        echo Si no carga datos, reinicia la app con: npx expo start -c
    )
) else (
    echo ╔════════════════════════════════════════════════════════╗
    echo ║   ⚠️  ACCIÓN REQUERIDA                                ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    
    if !SERVIDOR_CORRIENDO! equ 0 (
        echo 1️⃣  Inicia el servidor Laravel:
        echo    iniciar-servidor-correcto.bat
        echo.
    )
    
    echo 2️⃣  Inicia la app móvil:
    echo    cd nutrisystem-app
    echo    npx expo start -c
    echo.
    
    echo 3️⃣  Verifica que tu teléfono esté en la misma WiFi
    echo.
    
    echo 4️⃣  Prueba en el navegador del teléfono:
    echo    http://!IP_DETECTADA!:8000/api/dashboard
    echo.
)

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   📚 DOCUMENTACIÓN                                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Para más ayuda, consulta:
echo - GUIA_VISUAL_SOLUCION_APP.md
echo - SOLUCION_RAPIDA_APP_NO_CARGA.md
echo - DIAGNOSTICO_CONEXION_APP.md
echo.

pause
