import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const MisEntregasIndex = () => {
    const [entregas, setEntregas] = useState([]);
    const [proximasEntregas, setProximasEntregas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('proximas'); // 'proximas' o 'todas'

    useEffect(() => {
        fetchProximasEntregas();
        fetchTodasEntregas();
    }, []);

    const fetchProximasEntregas = async () => {
        try {
            const response = await api.get('/mis-entregas/proximas');
            setProximasEntregas(response.data.data);
        } catch (error) {
            console.error('Error al cargar próximas entregas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodasEntregas = async () => {
        try {
            const response = await api.get('/mis-entregas');
            setEntregas(response.data.data);
        } catch (error) {
            console.error('Error al cargar todas las entregas:', error);
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

    const getDiasHasta = (fecha) => {
        const hoy = new Date();
        const fechaEntrega = new Date(fecha);
        const diff = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Mañana';
        if (diff > 1) return `En ${diff} días`;
        if (diff === -1) return 'Ayer';
        return `Hace ${Math.abs(diff)} días`;
    };

    const getEstadoColor = (estado) => {
        const colors = {
            'PROGRAMADA': 'bg-blue-100 text-blue-700 border-blue-200',
            'PENDIENTE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'ENTREGADA': 'bg-green-100 text-green-700 border-green-200',
            'OMITIDA': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            'PROGRAMADA': '📅',
            'PENDIENTE': '⏳',
            'ENTREGADA': '✅',
            'OMITIDA': '❌',
        };
        return icons[estado] || '📦';
    };

    const entregasAMostrar = view === 'proximas' ? proximasEntregas : entregas;
    const esHoy = (fecha) => {
        const hoy = new Date().toDateString();
        const fechaEntrega = new Date(fecha).toDateString();
        return hoy === fechaEntrega;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Mis Entregas</h2>
                        <p className="text-gray-600 mt-1">Programación de tus entregas de catering</p>
                    </div>
                    <Link to="/mi-calendario" className="btn-secondary">
                        📆 Ver Calendario
                    </Link>
                </div>

                {/* Selector de Vista */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('proximas')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            view === 'proximas' 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Próximas ({proximasEntregas.length})
                    </button>
                    <button
                        onClick={() => setView('todas')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            view === 'todas' 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Todas ({entregas.length})
                    </button>
                </div>

                <div className="card">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : entregasAMostrar.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="mt-4 text-lg font-medium">
                                {view === 'proximas' ? 'No tienes entregas próximas' : 'No tienes entregas registradas'}
                            </p>
                            <p className="text-sm mt-2">Consulta con tu nutricionista para configurar tu calendario</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {entregasAMostrar.map((entrega) => (
                                <div 
                                    key={entrega.id_entrega} 
                                    className={`border-2 rounded-lg p-5 transition-all ${
                                        esHoy(entrega.fecha) 
                                            ? 'border-primary-500 bg-primary-50 shadow-lg' 
                                            : 'border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Fecha e Icono */}
                                        <div className="flex-shrink-0 text-center">
                                            <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center ${
                                                esHoy(entrega.fecha) 
                                                    ? 'bg-primary-500 text-white' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                <div className="text-3xl font-bold">
                                                    {new Date(entrega.fecha).getDate()}
                                                </div>
                                                <div className="text-xs uppercase">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                                </div>
                                            </div>
                                            {esHoy(entrega.fecha) && (
                                                <div className="mt-2">
                                                    <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                                        HOY
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Información */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {formatDate(entrega.fecha)}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {getDiasHasta(entrega.fecha)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(entrega.estado)}`}>
                                                        {getEstadoIcon(entrega.estado)} {entrega.estado}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {entrega.direccion && (
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs text-gray-600 font-medium">Dirección</p>
                                                            <p className="text-sm text-gray-900">{entrega.direccion.alias}</p>
                                                            <p className="text-xs text-gray-500">{entrega.direccion.descripcion}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {entrega.comida && (
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs text-gray-600 font-medium">Comida</p>
                                                            <p className="text-sm text-gray-900">{entrega.comida.tipo_comida}</p>
                                                            <p className="text-xs text-gray-500">#{entrega.comida.id_comida}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {view === 'proximas' && proximasEntregas.length > 0 && (
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-500 p-4 rounded">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-primary-800">
                                    <strong>Recordatorio:</strong> Estas son tus próximas 7 entregas programadas. Asegúrate de estar disponible en la dirección indicada.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MisEntregasIndex;
