import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const NotificacionesIndex = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todas'); // todas, leidas, no_leidas

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = filter !== 'todas' ? { leida: filter === 'leidas' ? 1 : 0 } : {};
            const response = await api.get('/notificaciones', { params });
            setNotifications(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            alert('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            fetchNotifications();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
            alert('Error al actualizar notificación');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            fetchNotifications();
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
            alert('Error al actualizar notificaciones');
        }
    };

    const deleteNotification = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

        try {
            await api.delete(`/notificaciones/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar notificación');
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
            info: 'border-l-4 border-blue-500 bg-blue-50',
            success: 'border-l-4 border-green-500 bg-green-50',
            warning: 'border-l-4 border-yellow-500 bg-yellow-50',
            error: 'border-l-4 border-red-500 bg-red-50'
        };
        return colors[tipo] || 'border-l-4 border-gray-500 bg-gray-50';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Notificaciones</h2>
                        <p className="text-gray-600 mt-1">Gestiona tus notificaciones</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="btn-primary"
                    >
                        Marcar Todas como Leídas
                    </button>
                </div>

                {/* Filtros */}
                <div className="card">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setFilter('todas')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'todas'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('no_leidas')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'no_leidas'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            No Leídas
                        </button>
                        <button
                            onClick={() => setFilter('leidas')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'leidas'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Leídas
                        </button>
                    </div>
                </div>

                {/* Lista de Notificaciones */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="card text-center py-12">
                        <span className="text-6xl mb-4 block">📭</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay notificaciones</h3>
                        <p className="text-gray-600">
                            {filter === 'no_leidas' && 'No tienes notificaciones sin leer'}
                            {filter === 'leidas' && 'No tienes notificaciones leídas'}
                            {filter === 'todas' && 'No tienes notificaciones'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id_notificacion}
                                className={`card ${getNotificationColor(notif.tipo)} ${
                                    !notif.leida ? 'ring-2 ring-primary-200' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icono */}
                                    <span className="text-4xl flex-shrink-0">
                                        {getNotificationIcon(notif.tipo)}
                                    </span>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {notif.titulo}
                                                {!notif.leida && (
                                                    <span className="ml-2 px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                                                        Nueva
                                                    </span>
                                                )}
                                            </h3>
                                            <span className="text-sm text-gray-500 flex-shrink-0 ml-4">
                                                {new Date(notif.created_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mb-3">{notif.mensaje}</p>

                                        {/* Acciones */}
                                        <div className="flex gap-3">
                                            {!notif.leida && (
                                                <button
                                                    onClick={() => markAsRead(notif.id_notificacion)}
                                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    ✓ Marcar como leída
                                                </button>
                                            )}
                                            {notif.link && (
                                                <a
                                                    href={notif.link}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Ver más →
                                                </a>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notif.id_notificacion)}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NotificacionesIndex;
