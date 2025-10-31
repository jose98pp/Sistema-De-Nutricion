#!/bin/bash

# ============================================
# Script de Despliegue - NutriSystem
# Versión: 1.0
# Fecha: 28 de Octubre, 2025
# ============================================

set -e  # Detener en caso de error

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║          🚀 DESPLIEGUE DE NUTRISYSTEM EN PRODUCCIÓN 🚀              ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "artisan" ]; then
    print_error "Error: No se encontró el archivo artisan. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_info "Iniciando proceso de despliegue..."
echo ""

# ============================================
# PASO 1: Modo de Mantenimiento
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 1: Activando modo de mantenimiento"
echo "═══════════════════════════════════════════════════════════════════════"

php artisan down --message="Actualizando sistema. Volveremos pronto." --retry=60
print_success "Modo de mantenimiento activado"
echo ""

# ============================================
# PASO 2: Actualizar Código
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 2: Actualizando código desde repositorio"
echo "═══════════════════════════════════════════════════════════════════════"

if [ -d ".git" ]; then
    git pull origin main
    print_success "Código actualizado desde Git"
else
    print_warning "No es un repositorio Git. Saltando este paso."
fi
echo ""

# ============================================
# PASO 3: Instalar Dependencias
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 3: Instalando dependencias"
echo "═══════════════════════════════════════════════════════════════════════"

print_info "Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev --no-interaction
print_success "Dependencias de Composer instaladas"

print_info "Instalando dependencias de NPM..."
npm ci --production
print_success "Dependencias de NPM instaladas"
echo ""

# ============================================
# PASO 4: Compilar Assets
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 4: Compilando assets para producción"
echo "═══════════════════════════════════════════════════════════════════════"

npm run build
print_success "Assets compilados"
echo ""

# ============================================
# PASO 5: Ejecutar Migraciones
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 5: Ejecutando migraciones de base de datos"
echo "═══════════════════════════════════════════════════════════════════════"

read -p "¿Deseas ejecutar las migraciones? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    php artisan migrate --force
    print_success "Migraciones ejecutadas"
else
    print_warning "Migraciones omitidas"
fi
echo ""

# ============================================
# PASO 6: Limpiar Cachés
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 6: Limpiando cachés"
echo "═══════════════════════════════════════════════════════════════════════"

php artisan cache:clear
print_success "Caché de aplicación limpiado"

php artisan config:clear
print_success "Caché de configuración limpiado"

php artisan route:clear
print_success "Caché de rutas limpiado"

php artisan view:clear
print_success "Caché de vistas limpiado"
echo ""

# ============================================
# PASO 7: Optimizar Aplicación
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 7: Optimizando aplicación"
echo "═══════════════════════════════════════════════════════════════════════"

php artisan config:cache
print_success "Configuración cacheada"

php artisan route:cache
print_success "Rutas cacheadas"

php artisan view:cache
print_success "Vistas cacheadas"

php artisan event:cache
print_success "Eventos cacheados"

php artisan optimize
print_success "Aplicación optimizada"
echo ""

# ============================================
# PASO 8: Crear Enlace Simbólico de Storage
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 8: Configurando storage"
echo "═══════════════════════════════════════════════════════════════════════"

php artisan storage:link
print_success "Enlace simbólico de storage creado"
echo ""

# ============================================
# PASO 9: Verificar Permisos
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 9: Verificando permisos de archivos"
echo "═══════════════════════════════════════════════════════════════════════"

chmod -R 775 storage bootstrap/cache
print_success "Permisos de storage y cache configurados"

chmod 600 .env
print_success "Permisos de .env configurados"
echo ""

# ============================================
# PASO 10: Reiniciar Servicios
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 10: Reiniciando servicios"
echo "═══════════════════════════════════════════════════════════════════════"

# Reiniciar PHP-FPM si está disponible
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet php-fpm; then
        sudo systemctl reload php-fpm
        print_success "PHP-FPM reiniciado"
    fi
fi

# Reiniciar queue workers si están corriendo
if pgrep -f "queue:work" > /dev/null; then
    php artisan queue:restart
    print_success "Queue workers reiniciados"
fi
echo ""

# ============================================
# PASO 11: Desactivar Modo de Mantenimiento
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 11: Desactivando modo de mantenimiento"
echo "═══════════════════════════════════════════════════════════════════════"

php artisan up
print_success "Modo de mantenimiento desactivado"
echo ""

# ============================================
# PASO 12: Verificación Final
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "PASO 12: Verificación final"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar que la aplicación responde
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nutrisystem.ultimahora-tv.com)
    if [ "$HTTP_CODE" == "200" ]; then
        print_success "Aplicación respondiendo correctamente (HTTP $HTTP_CODE)"
    else
        print_warning "Aplicación respondió con código HTTP $HTTP_CODE"
    fi
fi

# Verificar logs
if [ -f "storage/logs/laravel.log" ]; then
    ERROR_COUNT=$(grep -c "ERROR" storage/logs/laravel.log 2>/dev/null || echo 0)
    if [ "$ERROR_COUNT" -eq 0 ]; then
        print_success "No se encontraron errores en los logs"
    else
        print_warning "Se encontraron $ERROR_COUNT errores en los logs"
    fi
fi
echo ""

# ============================================
# RESUMEN
# ============================================
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                  ✅ DESPLIEGUE COMPLETADO ✅                         ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Despliegue completado exitosamente"
print_info "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
print_info "URL: https://nutrisystem.ultimahora-tv.com"
echo ""
print_warning "Recuerda:"
echo "  • Verificar que la aplicación funcione correctamente"
echo "  • Monitorear los logs en las próximas horas"
echo "  • Verificar que los backups estén funcionando"
echo ""
print_info "Para ver los logs en tiempo real:"
echo "  tail -f storage/logs/laravel.log"
echo ""

exit 0
