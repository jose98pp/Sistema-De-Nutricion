import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const EvaluacionesIndex = () => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchNombre, setSearchNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);

    useEffect(() => {
        fetchEvaluaciones();
    }, [tipo]);

    useEffect(() => {
        filtrarPorNombre();
    }, [searchNombre, todasEvaluaciones]);

    const fetchEvaluaciones = async () => {
        try {
            const params = {};
            if (tipo) params.tipo = tipo;

            const response = await api.get('/evaluaciones', { params });
            const data = response.data.data || response.data;
            setTodasEvaluaciones(data);
            setEvaluaciones(data);
        } catch (error) {
            console.error('Error al cargar evaluaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarPorNombre = () => {
        if (!searchNombre.trim()) {
            setEvaluaciones(todasEvaluaciones);
            return;
        }

        const search = searchNombre.toLowerCase();
        const filtradas = todasEvaluaciones.filter(evaluacion => {
            const nombreCompleto = `${evaluacion.paciente?.nombre || ''} ${evaluacion.paciente?.apellido || ''}`.toLowerCase();
            const email = (evaluacion.paciente?.email || '').toLowerCase();
            
            return nombreCompleto.includes(search) || email.includes(search);
        });

        setEvaluaciones(filtradas);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta evaluación?')) return;

        try {
            await api.delete(`/evaluaciones/${id}`);
            setEvaluaciones(evaluaciones.filter(e => e.id_evaluacion !== id));
            setTodasEvaluaciones(todasEvaluaciones.filter(e => e.id_evaluacion !== id));
        } catch (error) {
            alert('Error al eliminar evaluación');
        }
    };

    const calcularIMC = (peso, altura) => {
        if (!peso || !altura) return 'N/A';
        return (peso / (altura ** 2)).toFixed(2);
    };

    const getClasificacionIMC = (imc) => {
        if (!imc || imc === 'N/A') return { texto: 'N/A', color: 'gray' };
        const imcNum = parseFloat(imc);
        if (imcNum < 18.5) return { texto: 'Bajo peso', color: 'blue' };
        if (imcNum < 25) return { texto: 'Normal', color: 'green' };
        if (imcNum < 30) return { texto: 'Sobrepeso', color: 'yellow' };
        return { texto: 'Obesidad', color: 'red' };
    };

    const getTipoBadgeColor = (tipoEval) => {
        const colores = {
            'INICIAL': 'bg-blue-100 text-blue-700',
            'PERIODICA': 'bg-yellow-100 text-yellow-700',
            'FINAL': 'bg-green-100 text-green-700'
        };
        return colores[tipoEval] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Evaluaciones</h2>
                        <p className="text-gray-600 mt-1">Evaluaciones y mediciones antropométricas</p>
                    </div>
                    <Link to="/evaluaciones/nueva" className="btn-primary">
                        + Nueva Evaluación
                    </Link>
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🔍 Buscar Paciente
                            </label>
                            <input
                                type="text"
                                value={searchNombre}
                                onChange={(e) => setSearchNombre(e.target.value)}
                                className="input-field"
                                placeholder="Buscar por nombre, apellido o email..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Evaluación
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Todas</option>
                                <option value="INICIAL">Inicial</option>
                                <option value="PERIODICA">Periódica</option>
                                <option value="FINAL">Final</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : evaluaciones.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron evaluaciones</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {evaluaciones.map((evaluacion) => {
                                const imc = calcularIMC(
                                    evaluacion.medicion?.peso_kg,
                                    evaluacion.medicion?.altura_m
                                );
                                const clasificacion = getClasificacionIMC(imc);

                                return (
                                    <div key={evaluacion.id_evaluacion} className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {evaluacion.paciente?.nombre} {evaluacion.paciente?.apellido}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(evaluacion.tipo)}`}>
                                                        {evaluacion.tipo}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Nutricionista: {evaluacion.nutricionista?.nombre} {evaluacion.nutricionista?.apellido}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Fecha: {new Date(evaluacion.fecha).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(evaluacion.id_evaluacion)}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </div>

                                        {evaluacion.medicion && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 mb-1">Peso</p>
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {evaluacion.medicion.peso_kg}
                                                    </p>
                                                    <p className="text-xs text-gray-500">kg</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 mb-1">Altura</p>
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {evaluacion.medicion.altura_m}
                                                    </p>
                                                    <p className="text-xs text-gray-500">metros</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 mb-1">IMC</p>
                                                    <p className={`text-2xl font-bold text-${clasificacion.color}-600`}>
                                                        {imc}
                                                    </p>
                                                    <p className={`text-xs text-${clasificacion.color}-600`}>
                                                        {clasificacion.texto}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 mb-1">% Grasa</p>
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {evaluacion.medicion.porc_grasa || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">porcentaje</p>
                                                </div>
                                            </div>
                                        )}

                                        {evaluacion.observaciones && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-medium text-blue-800 mb-1">Observaciones:</p>
                                                <p className="text-sm text-blue-700">{evaluacion.observaciones}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default EvaluacionesIndex;
