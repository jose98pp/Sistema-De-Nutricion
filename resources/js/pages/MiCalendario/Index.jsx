import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const MiCalendarioIndex = () => {
    const [calendario, setCalendario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        fetchCalendario();
    }, []);

    const fetchCalendario = async () => {
        try {
            const response = await api.get('/mi-calendario');
            setCalendario(response.data.data);
            if (response.data.message) {
                setMensaje(response.data.message);
            }
        } catch (error) {
            console.error('Error al cargar calendario:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDiasRestantes = () => {
        if (!calendario) return 0;
        const hoy = new Date();
        const fin = new Date(calendario.fecha_fin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const getEstadoEntregas = () => {
        if (!calendario || !calendario.entregas) return { total: 0, entregadas: 0, pendientes: 0 };
        
        const total = calendario.entregas.length;
        const entregadas = calendario.entregas.filter(e => e.estado === 'ENTREGADA').length;
        const pendientes = calendario.entregas.filter(e => e.estado === 'PROGRAMADA' || e.estado === 'PENDIENTE').length;
        
        return { total, entregadas, pendientes };
    };

    const proximasEntregas = calendario?.entregas
        ?.filter(e => new Date(e.fecha) >= new Date() && (e.estado === 'PROGRAMADA' || e.estado === 'PENDIENTE'))
        ?.slice(0, 5) || [];

    const stats = getEstadoEntregas();

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Mi Calendario de Entregas</h2>
                        <p className="text-gray-600 mt-1">Programación de tus entregas de catering</p>
                    </div>
                    <Link to="/mis-entregas" className="btn-primary">
                        📦 Ver Todas las Entregas
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : !calendario ? (
                    <div className="card text-center py-12 text-gray-500">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-lg font-medium">{mensaje || 'No tienes un calendario activo'}</p>
                        <p className="text-sm mt-2">Solicita a tu nutricionista que configure tu calendario de entregas</p>
                    </div>
                ) : (
                    <>
                        {/* Resumen del Calendario */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90">Días Restantes</p>
                                        <p className="text-2xl font-bold">{getDiasRestantes()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90">Entregadas</p>
                                        <p className="text-2xl font-bold">{stats.entregadas}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90">Pendientes</p>
                                        <p className="text-2xl font-bold">{stats.pendientes}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90">Total Entregas</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información del Calendario */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Calendario</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Fecha de Inicio</p>
                                    <p className="font-medium text-gray-900">{formatDate(calendario.fecha_inicio)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Fecha de Fin</p>
                                    <p className="font-medium text-gray-900">{formatDate(calendario.fecha_fin)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Próximas Entregas */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Próximas 5 Entregas</h3>
                                <Link to="/mis-entregas" className="text-primary-600 text-sm hover:underline">
                                    Ver todas →
                                </Link>
                            </div>
                            
                            {proximasEntregas.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay entregas próximas programadas</p>
                            ) : (
                                <div className="space-y-3">
                                    {proximasEntregas.map((entrega) => (
                                        <div key={entrega.id_entrega} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <div className="text-2xl font-bold text-primary-600">
                                                    {new Date(entrega.fecha).getDate()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', { weekday: 'long' })}
                                                </p>
                                                {entrega.direccion && (
                                                    <p className="text-sm text-gray-600">📍 {entrega.direccion.alias}</p>
                                                )}
                                            </div>
                                            <div>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    {entrega.estado}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default MiCalendarioIndex;
