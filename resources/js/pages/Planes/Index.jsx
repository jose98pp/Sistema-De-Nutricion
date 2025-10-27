import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const PlanesIndex = () => {
    const { user, isPaciente } = useAuth();
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pacienteId, setPacienteId] = useState('');
    const [soloActivos, setSoloActivos] = useState(false);

    useEffect(() => {
        fetchPlanes();
    }, [pacienteId, soloActivos]);

    const fetchPlanes = async () => {
        try {
            const params = {};
            if (pacienteId) params.paciente_id = pacienteId;
            if (soloActivos) params.activo = 1;

            const response = await api.get('/planes', { params });
            setPlanes(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar planes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este plan?')) return;

        try {
            await api.delete(`/planes/${id}`);
            setPlanes(planes.filter(p => p.id_plan !== id));
        } catch (error) {
            alert('Error al eliminar plan');
        }
    };

    const isActivo = (plan) => {
        const hoy = new Date();
        const inicio = new Date(plan.fecha_inicio);
        const fin = new Date(plan.fecha_fin);
        return hoy >= inicio && hoy <= fin;
    };

    const getDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Planes de Alimentación</h2>
                        <p className="text-gray-600 mt-1">Gestión de planes nutricionales</p>
                    </div>
                    {!isPaciente() && (
                        <Link to="/planes/nuevo" className="btn-primary">
                            + Crear Plan
                        </Link>
                    )}
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por Paciente ID
                            </label>
                            <input
                                type="number"
                                value={pacienteId}
                                onChange={(e) => setPacienteId(e.target.value)}
                                className="input-field"
                                placeholder="ID del paciente..."
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={soloActivos}
                                    onChange={(e) => setSoloActivos(e.target.checked)}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Solo planes activos
                                </span>
                            </label>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : planes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron planes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {planes.map((plan) => (
                                <div key={plan.id_plan} className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800">{plan.nombre}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {plan.paciente?.nombre} {plan.paciente?.apellido}
                                            </p>
                                        </div>
                                        {isActivo(plan) && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                Activo
                                            </span>
                                        )}
                                    </div>

                                    {plan.descripcion && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {plan.descripcion}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Inicio:</span>
                                            <span className="font-medium">
                                                {new Date(plan.fecha_inicio).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fin:</span>
                                            <span className="font-medium">
                                                {new Date(plan.fecha_fin).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        {isActivo(plan) && (
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="text-gray-600">Días restantes:</span>
                                                <span className="font-bold text-primary-600">
                                                    {getDiasRestantes(plan.fecha_fin)} días
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/planes/${plan.id_plan}`}
                                            className="flex-1 text-center btn-primary text-sm py-2"
                                        >
                                            Ver Detalle
                                        </Link>
                                        {!isPaciente() && (
                                            <button
                                                onClick={() => handleDelete(plan.id_plan)}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PlanesIndex;
