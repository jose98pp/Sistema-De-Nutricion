import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showDropdown) {
            fetchNotifications();
        }
    }, [showDropdown]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notificaciones/no-leidas/contar');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error al obtener contador de notificaciones:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notificaciones?per_page=10');
            setNotifications(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    const getNotificationIcon = (tipo) => {
        const icons = {
            info: '📢',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[tipo] || '📢';
    };

    const getNotificationColor = (tipo) => {
        const colors = {
            info: 'bg-blue-50 border-blue-200',
            success: 'bg-green-50 border-green-200',
            warning: 'bg-yellow-50 border-yellow-200',
            error: 'bg-red-50 border-red-200'
        };
        return colors[tipo] || 'bg-gray-50 border-gray-200';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de Campana */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    {/* Lista de Notificaciones */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="text-4xl mb-2 block">📭</span>
                                <p>No tienes notificaciones</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id_notificacion}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                        !notif.leida ? 'bg-primary-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notif.tipo)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-gray-800 text-sm">
                                                    {notif.titulo}
                                                </p>
                                                {!notif.leida && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id_notificacion)}
                                                        className="text-xs text-primary-600 hover:text-primary-700 ml-2"
                                                        title="Marcar como leída"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {notif.mensaje}
                                            </p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(notif.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {notif.link && (
                                                    <Link
                                                        to={notif.link}
                                                        onClick={() => {
                                                            setShowDropdown(false);
                                                            if (!notif.leida) markAsRead(notif.id_notificacion);
                                                        }}
                                                        className="text-xs text-primary-600 hover:text-primary-700"
                                                    >
                                                        Ver →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <Link
                                to="/notificaciones"
                                onClick={() => setShowDropdown(false)}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Ver todas las notificaciones
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
