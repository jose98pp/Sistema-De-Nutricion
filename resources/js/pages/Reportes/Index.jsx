import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReportesIndex = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pacienteId, setPacienteId] = useState('');
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [ingestas, setIngestas] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [paciente, setPaciente] = useState(null);
    const [rangoFechas, setRangoFechas] = useState(30); // días

    useEffect(() => {
        if (pacienteId) {
            fetchReportes();
        }
    }, [pacienteId, rangoFechas]);

    const fetchReportes = async () => {
        setLoading(true);
        try {
            // Obtener datos del paciente
            const pacienteRes = await api.get(`/pacientes/${pacienteId}`);
            setPaciente(pacienteRes.data);

            // Obtener evaluaciones
            const evalRes = await api.get('/evaluaciones', {
                params: { paciente_id: pacienteId }
            });
            setEvaluaciones(evalRes.data.data || evalRes.data);

            // Obtener ingestas de los últimos días
            const hoy = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - rangoFechas);

            const ingestasRes = await api.get('/ingestas', {
                params: {
                    paciente_id: pacienteId,
                    fecha_inicio: inicio.toISOString().split('T')[0],
                    fecha_fin: hoy.toISOString().split('T')[0]
                }
            });
            setIngestas(ingestasRes.data.data || ingestasRes.data);

            // Obtener planes
            const planesRes = await api.get('/planes', {
                params: { paciente_id: pacienteId }
            });
            setPlanes(planesRes.data.data || planesRes.data);

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            alert('Error al cargar los datos del paciente');
        } finally {
            setLoading(false);
        }
    };

    // Preparar datos para gráfico de evolución de peso
    const dataPeso = evaluaciones
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(evaluacion => ({
            fecha: format(new Date(evaluacion.fecha), 'dd/MM', { locale: es }),
            peso: evaluacion.medicion?.peso_kg || 0,
            imc: evaluacion.medicion?.peso_kg && evaluacion.medicion?.altura_m 
                ? (evaluacion.medicion.peso_kg / (evaluacion.medicion.altura_m ** 2)).toFixed(2)
                : 0
        }));

    // Calcular adherencia al plan
    const calcularAdherencia = () => {
        if (planes.length === 0 || ingestas.length === 0) return 0;
        
        const planActivo = planes.find(p => {
            const hoy = new Date();
            const inicio = new Date(p.fecha_inicio);
            const fin = new Date(p.fecha_fin);
            return hoy >= inicio && hoy <= fin;
        });

        if (!planActivo) return 0;

        // Calcular días con ingestas vs días del plan
        const diasConIngesta = new Set(
            ingestas.map(i => new Date(i.fecha_hora).toDateString())
        ).size;

        const diasTranscurridos = Math.min(
            Math.ceil((new Date() - new Date(planActivo.fecha_inicio)) / (1000 * 60 * 60 * 24)),
            rangoFechas
        );

        return diasTranscurridos > 0 ? Math.round((diasConIngesta / diasTranscurridos) * 100) : 0;
    };

    // Preparar datos para gráfico de calorías diarias
    const dataIngestas = ingestas
        .reduce((acc, ingesta) => {
            const fecha = format(new Date(ingesta.fecha_hora), 'dd/MM', { locale: es });
            const calorias = ingesta.alimentos?.reduce((sum, a) => 
                sum + (a.calorias_por_100g * (a.pivot?.cantidad_gramos || 0) / 100), 0
            ) || 0;

            const existing = acc.find(d => d.fecha === fecha);
            if (existing) {
                existing.calorias += calorias;
            } else {
                acc.push({ fecha, calorias });
            }
            return acc;
        }, [])
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Distribución de macronutrientes
    const macronutrientes = ingestas.reduce((acc, ingesta) => {
        ingesta.alimentos?.forEach(alimento => {
            const factor = (alimento.pivot?.cantidad_gramos || 0) / 100;
            acc.proteinas += alimento.proteinas_por_100g * factor;
            acc.carbohidratos += alimento.carbohidratos_por_100g * factor;
            acc.grasas += alimento.grasas_por_100g * factor;
        });
        return acc;
    }, { proteinas: 0, carbohidratos: 0, grasas: 0 });

    const dataMacros = [
        { name: 'Proteínas', value: Math.round(macronutrientes.proteinas), color: '#3b82f6' },
        { name: 'Carbohidratos', value: Math.round(macronutrientes.carbohidratos), color: '#eab308' },
        { name: 'Grasas', value: Math.round(macronutrientes.grasas), color: '#f97316' }
    ];

    const adherencia = calcularAdherencia();

    if (!pacienteId) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Reportes y Progreso</h2>
                    <p className="text-gray-600 mb-6">Ingresa el ID del paciente para ver sus reportes</p>
                    <div className="card max-w-md mx-auto">
                        <input
                            type="number"
                            value={pacienteId}
                            onChange={(e) => setPacienteId(e.target.value)}
                            placeholder="ID del paciente..."
                            className="input-field mb-4"
                        />
                        <button
                            onClick={() => pacienteId && fetchReportes()}
                            className="btn-primary w-full"
                        >
                            Ver Reportes
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Reportes y Progreso</h2>
                        {paciente && (
                            <p className="text-gray-600 mt-1">
                                {paciente.nombre} {paciente.apellido}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={rangoFechas}
                            onChange={(e) => setRangoFechas(Number(e.target.value))}
                            className="input-field"
                        >
                            <option value={7}>Últimos 7 días</option>
                            <option value={15}>Últimos 15 días</option>
                            <option value={30}>Últimos 30 días</option>
                            <option value={90}>Últimos 90 días</option>
                        </select>
                        <button
                            onClick={() => setPacienteId('')}
                            className="btn-secondary"
                        >
                            Cambiar Paciente
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Tarjetas de Resumen */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="card bg-blue-50 border-2 border-blue-200">
                                <p className="text-sm text-blue-700 mb-1">Evaluaciones</p>
                                <p className="text-4xl font-bold text-blue-900">{evaluaciones.length}</p>
                                <p className="text-xs text-blue-600 mt-1">Registradas</p>
                            </div>

                            <div className="card bg-green-50 border-2 border-green-200">
                                <p className="text-sm text-green-700 mb-1">Ingestas</p>
                                <p className="text-4xl font-bold text-green-900">{ingestas.length}</p>
                                <p className="text-xs text-green-600 mt-1">Últimos {rangoFechas} días</p>
                            </div>

                            <div className="card bg-purple-50 border-2 border-purple-200">
                                <p className="text-sm text-purple-700 mb-1">Adherencia</p>
                                <p className="text-4xl font-bold text-purple-900">{adherencia}%</p>
                                <p className="text-xs text-purple-600 mt-1">Al plan actual</p>
                            </div>

                            <div className="card bg-orange-50 border-2 border-orange-200">
                                <p className="text-sm text-orange-700 mb-1">Planes</p>
                                <p className="text-4xl font-bold text-orange-900">{planes.length}</p>
                                <p className="text-xs text-orange-600 mt-1">Asignados</p>
                            </div>
                        </div>

                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Evolución de Peso */}
                            {dataPeso.length > 0 && (
                                <div className="card">
                                    <h3 className="text-xl font-bold mb-4">Evolución de Peso e IMC</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={dataPeso}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={2} name="Peso (kg)" />
                                            <Line yAxisId="right" type="monotone" dataKey="imc" stroke="#22c55e" strokeWidth={2} name="IMC" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Calorías Diarias */}
                            {dataIngestas.length > 0 && (
                                <div className="card">
                                    <h3 className="text-xl font-bold mb-4">Calorías Diarias</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dataIngestas}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="calorias" fill="#22c55e" name="Calorías (kcal)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Distribución de Macronutrientes */}
                            {dataMacros.some(d => d.value > 0) && (
                                <div className="card">
                                    <h3 className="text-xl font-bold mb-4">Distribución de Macronutrientes (g)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={dataMacros}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}g`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {dataMacros.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Indicador de Adherencia */}
                            <div className="card">
                                <h3 className="text-xl font-bold mb-4">Adherencia al Plan</h3>
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="relative w-48 h-48">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle
                                                className="text-gray-200 stroke-current"
                                                strokeWidth="10"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                            />
                                            <circle
                                                className="text-primary-600 stroke-current"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                strokeDasharray={`${adherencia * 2.51}, 251`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-5xl font-bold text-primary-600">{adherencia}%</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-4 text-center">
                                        Días con registro en los últimos {rangoFechas} días
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mensajes de estado */}
                        {evaluaciones.length === 0 && (
                            <div className="card bg-yellow-50 border-yellow-200">
                                <p className="text-yellow-800">⚠️ No hay evaluaciones registradas para este paciente</p>
                            </div>
                        )}

                        {ingestas.length === 0 && (
                            <div className="card bg-yellow-50 border-yellow-200">
                                <p className="text-yellow-800">⚠️ No hay ingestas registradas en el período seleccionado</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ReportesIndex;
