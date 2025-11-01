# Script de Despliegue para Windows - NutriSystem
# Versión: 1.2
# Fecha: 31 de Octubre, 2025

# Configurar codificación UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Funciones de utilidad
function Write-TaskSuccess {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-TaskWarning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

function Write-TaskError {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-TaskInfo {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Cyan
}

# Funciones de utilidad
function Write-Success($message) {
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "ℹ $message" -ForegroundColor Cyan
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "artisan")) {
    Write-Error "Error: No se encontró el archivo artisan. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
}

Write-Host "╔══════════════════════════════════════════════════════════════════════╗"
Write-Host "║                                                                      ║"
Write-Host "║          🚀 DESPLIEGUE DE NUTRISYSTEM EN PRODUCCIÓN 🚀              ║"
Write-Host "║                                                                      ║"
Write-Host "╚══════════════════════════════════════════════════════════════════════╝"

# PASO 1: Modo de Mantenimiento
Write-Host "`nPASO 1: Activando modo de mantenimiento"
php artisan down --message="Actualizando sistema. Volveremos pronto." --retry=60
Write-Success "Modo de mantenimiento activado"

# PASO 2: Actualizar Código
Write-Host "`nPASO 2: Actualizando código desde repositorio"
if (Test-Path ".git") {
    git pull origin main
    Write-Success "Código actualizado desde Git"
} else {
    Write-Warning "No es un repositorio Git. Saltando este paso."
}

# PASO 3: Instalar Dependencias
Write-Host "`nPASO 3: Instalando dependencias"
Write-Info "Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev --no-interaction
Write-Success "Dependencias de Composer instaladas"

Write-Info "Instalando dependencias de NPM..."
npm ci --production
Write-Success "Dependencias de NPM instaladas"

# PASO 4: Compilar Assets
Write-Host "`nPASO 4: Compilando assets para producción"
npm run build
Write-Success "Assets compilados"

# PASO 5: Ejecutar Migraciones
Write-Host "`nPASO 5: Ejecutando migraciones de base de datos"
$confirmation = Read-Host "¿Deseas ejecutar las migraciones? (s/n)"
if ($confirmation -eq 's') {
    php artisan migrate --force
    Write-Success "Migraciones ejecutadas"
} else {
    Write-Warning "Migraciones omitidas"
}

# PASO 6: Limpiar Cachés
Write-Host "`nPASO 6: Limpiando cachés"
php artisan cache:clear
Write-Success "Caché de aplicación limpiado"

php artisan config:clear
Write-Success "Caché de configuración limpiado"

php artisan route:clear
Write-Success "Caché de rutas limpiado"

php artisan view:clear
Write-Success "Caché de vistas limpiado"

# PASO 7: Optimizar Aplicación
Write-Host "`nPASO 7: Optimizando aplicación"
php artisan config:cache
Write-Success "Configuración cacheada"

php artisan route:cache
Write-Success "Rutas cacheadas"

php artisan view:cache
Write-Success "Vistas cacheadas"

php artisan event:cache
Write-Success "Eventos cacheados"

php artisan optimize
Write-Success "Aplicación optimizada"

# PASO 8: Crear Enlace Simbólico de Storage
Write-Host "`nPASO 8: Configurando storage"
php artisan storage:link
Write-Success "Enlace simbólico de storage creado"

# PASO 9: Verificar Permisos (adaptado para Windows)
Write-Host "`nPASO 9: Verificando permisos de archivos"
icacls "storage" /grant "Everyone:(OI)(CI)F" /T
icacls "bootstrap/cache" /grant "Everyone:(OI)(CI)F" /T
Write-Success "Permisos configurados para Windows"

# PASO 10: Reiniciar Servicios
Write-Host "`nPASO 10: Reiniciando servicios"
net stop mysql
net start mysql
Write-Success "MySQL reiniciado"

net stop apache2.4
net start apache2.4
Write-Success "Apache reiniciado"

# PASO 11: Desactivar Modo de Mantenimiento
Write-Host "`nPASO 11: Desactivando modo de mantenimiento"
php artisan up
Write-Success "Modo de mantenimiento desactivado"

# PASO 12: Verificación Final
Write-Host "`nPASO 12: Verificación final"
if (Test-Path "storage/logs/laravel.log") {
    $errorCount = (Select-String -Path "storage/logs/laravel.log" -Pattern "ERROR").Count
    if ($errorCount -eq 0) {
        Write-Success "No se encontraron errores en los logs"
    } else {
        Write-Warning "Se encontraron $errorCount errores en los logs"
    }
}

# Resumen Final
Write-Host "`n╔══════════════════════════════════════════════════════════════════════╗"
Write-Host "║                                                                      ║"
Write-Host "║                  ✅ DESPLIEGUE COMPLETADO ✅                         ║"
Write-Host "║                                                                      ║"
Write-Host "╚══════════════════════════════════════════════════════════════════════╝"

Write-Success "`nDespliegue completado exitosamente"
Write-Info "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info "Sistema desplegado localmente en http://localhost/Nutricion"

Write-Warning "`nRecuerda:"
Write-Host "  • Verificar que la aplicación funcione correctamente"
Write-Host "  • Monitorear los logs en las próximas horas"
Write-Host "  • Verificar que los backups estén funcionando"

Write-Info "`nPara ver los logs:"
Write-Host "  Get-Content storage/logs/laravel.log -Wait"