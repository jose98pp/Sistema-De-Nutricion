#!/bin/bash

# ============================================
# Script de Verificación Post-Despliegue
# NutriSystem - Producción
# ============================================

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║          🔍 VERIFICACIÓN DE PRODUCCIÓN - NUTRISYSTEM 🔍             ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Función para verificar
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ $2${NC}"
        ((FAILED++))
    fi
}

check_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

# ============================================
# 1. VERIFICAR CONFIGURACIÓN
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "1. CONFIGURACIÓN"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar .env
if [ -f ".env" ]; then
    check 0 ".env existe"
    
    # Verificar APP_DEBUG
    if grep -q "APP_DEBUG=false" .env; then
        check 0 "APP_DEBUG está en false"
    else
        check 1 "APP_DEBUG debe estar en false"
    fi
    
    # Verificar APP_ENV
    if grep -q "APP_ENV=production" .env; then
        check 0 "APP_ENV está en production"
    else
        check 1 "APP_ENV debe estar en production"
    fi
    
    # Verificar APP_KEY
    if grep -q "APP_KEY=base64:" .env; then
        check 0 "APP_KEY está configurado"
    else
        check 1 "APP_KEY no está configurado"
    fi
else
    check 1 ".env no existe"
fi
echo ""

# ============================================
# 2. VERIFICAR BASE DE DATOS
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "2. BASE DE DATOS"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar conexión
php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';" > /dev/null 2>&1
check $? "Conexión a base de datos"

# Verificar migraciones
PENDING=$(php artisan migrate:status 2>/dev/null | grep -c "Pending" || echo 0)
if [ "$PENDING" -eq 0 ]; then
    check 0 "Todas las migraciones ejecutadas"
else
    check 1 "$PENDING migraciones pendientes"
fi

# Verificar tablas principales
TABLES=("users" "nutricionistas" "pacientes" "alimentos" "servicios" "contratos" "planes_alimentacion")
for table in "${TABLES[@]}"; do
    php artisan tinker --execute="DB::table('$table')->count();" > /dev/null 2>&1
    check $? "Tabla $table existe"
done
echo ""

# ============================================
# 3. VERIFICAR PERMISOS
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "3. PERMISOS DE ARCHIVOS"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar storage
if [ -w "storage" ]; then
    check 0 "storage es escribible"
else
    check 1 "storage no es escribible"
fi

# Verificar bootstrap/cache
if [ -w "bootstrap/cache" ]; then
    check 0 "bootstrap/cache es escribible"
else
    check 1 "bootstrap/cache no es escribible"
fi

# Verificar .env
ENV_PERMS=$(stat -c %a .env 2>/dev/null || stat -f %A .env 2>/dev/null)
if [ "$ENV_PERMS" == "600" ]; then
    check 0 ".env tiene permisos correctos (600)"
else
    check_warning ".env tiene permisos $ENV_PERMS (recomendado: 600)"
fi
echo ""

# ============================================
# 4. VERIFICAR CACHÉS
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "4. CACHÉS"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar config cache
if [ -f "bootstrap/cache/config.php" ]; then
    check 0 "Configuración cacheada"
else
    check_warning "Configuración no está cacheada"
fi

# Verificar route cache
if [ -f "bootstrap/cache/routes-v7.php" ]; then
    check 0 "Rutas cacheadas"
else
    check_warning "Rutas no están cacheadas"
fi

# Verificar view cache
if [ -d "storage/framework/views" ] && [ "$(ls -A storage/framework/views)" ]; then
    check 0 "Vistas cacheadas"
else
    check_warning "Vistas no están cacheadas"
fi
echo ""

# ============================================
# 5. VERIFICAR ASSETS
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "5. ASSETS COMPILADOS"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar build
if [ -d "public/build" ]; then
    check 0 "Directorio build existe"
    
    # Verificar manifest
    if [ -f "public/build/manifest.json" ]; then
        check 0 "Manifest.json existe"
    else
        check 1 "Manifest.json no existe"
    fi
else
    check 1 "Directorio build no existe"
fi

# Verificar storage link
if [ -L "public/storage" ]; then
    check 0 "Enlace simbólico de storage existe"
else
    check_warning "Enlace simbólico de storage no existe"
fi
echo ""

# ============================================
# 6. VERIFICAR SEGURIDAD
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "6. SEGURIDAD"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar HTTPS
if grep -q "SESSION_SECURE_COOKIE=true" .env; then
    check 0 "Cookies seguras habilitadas"
else
    check_warning "Cookies seguras no habilitadas"
fi

# Verificar encriptación de sesiones
if grep -q "SESSION_ENCRYPT=true" .env; then
    check 0 "Encriptación de sesiones habilitada"
else
    check_warning "Encriptación de sesiones no habilitada"
fi

# Verificar .htaccess
if [ -f "public/.htaccess" ]; then
    check 0 ".htaccess existe"
else
    check_warning ".htaccess no existe"
fi
echo ""

# ============================================
# 7. VERIFICAR LOGS
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "7. LOGS"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar directorio de logs
if [ -d "storage/logs" ]; then
    check 0 "Directorio de logs existe"
    
    # Verificar errores recientes
    if [ -f "storage/logs/laravel.log" ]; then
        ERROR_COUNT=$(grep -c "ERROR" storage/logs/laravel.log 2>/dev/null || echo 0)
        if [ "$ERROR_COUNT" -eq 0 ]; then
            check 0 "No hay errores en los logs"
        else
            check_warning "Se encontraron $ERROR_COUNT errores en los logs"
        fi
    fi
else
    check 1 "Directorio de logs no existe"
fi
echo ""

# ============================================
# 8. VERIFICAR CONECTIVIDAD
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "8. CONECTIVIDAD"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar URL
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nutrisystem.ultimahora-tv.com)
    if [ "$HTTP_CODE" == "200" ]; then
        check 0 "Aplicación responde (HTTP $HTTP_CODE)"
    else
        check 1 "Aplicación responde con HTTP $HTTP_CODE"
    fi
    
    # Verificar API
    API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nutrisystem.ultimahora-tv.com/api/health 2>/dev/null || echo "000")
    if [ "$API_CODE" == "200" ] || [ "$API_CODE" == "404" ]; then
        check 0 "API accesible"
    else
        check_warning "API responde con HTTP $API_CODE"
    fi
else
    check_warning "curl no disponible, saltando verificación de conectividad"
fi
echo ""

# ============================================
# 9. VERIFICAR ESPACIO EN DISCO
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "9. RECURSOS DEL SISTEMA"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar espacio en disco
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check 0 "Espacio en disco: ${DISK_USAGE}% usado"
else
    check_warning "Espacio en disco: ${DISK_USAGE}% usado (crítico)"
fi

# Verificar memoria
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$MEM_USAGE" -lt 90 ]; then
        check 0 "Memoria: ${MEM_USAGE}% usado"
    else
        check_warning "Memoria: ${MEM_USAGE}% usado (alto)"
    fi
fi
echo ""

# ============================================
# 10. VERIFICAR BACKUPS
# ============================================
echo "═══════════════════════════════════════════════════════════════════════"
echo "10. BACKUPS"
echo "═══════════════════════════════════════════════════════════════════════"

# Verificar script de backup
if [ -f "/usr/local/bin/backup_nutrisystem.sh" ]; then
    check 0 "Script de backup existe"
else
    check_warning "Script de backup no encontrado"
fi

# Verificar crontab
if crontab -l 2>/dev/null | grep -q "backup_nutrisystem"; then
    check 0 "Backup automático configurado"
else
    check_warning "Backup automático no configurado"
fi
echo ""

# ============================================
# RESUMEN
# ============================================
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                        📊 RESUMEN                                    ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Verificaciones exitosas: $PASSED${NC}"
echo -e "${YELLOW}⚠ Advertencias: $WARNINGS${NC}"
echo -e "${RED}✗ Verificaciones fallidas: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Porcentaje de éxito: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Sistema listo para producción${NC}"
    exit 0
elif [ $FAILED -lt 3 ]; then
    echo -e "${YELLOW}⚠️  Sistema funcional con advertencias${NC}"
    exit 0
else
    echo -e "${RED}❌ Sistema requiere atención antes de producción${NC}"
    exit 1
fi
