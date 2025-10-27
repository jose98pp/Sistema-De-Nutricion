import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const IngestasIndex = () => {
    const { user, isPaciente } = useAuth();
    const [ingestas, setIngestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [pacienteId, setPacienteId] = useState('');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        // Establecer fecha por defecto: últimos 7 días
        const hoy = new Date();
        const hace7dias = new Date();
        hace7dias.setDate(hace7dias.getDate() - 7);
        
        setFechaFin(hoy.toISOString().split('T')[0]);
        setFechaInicio(hace7dias.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (fechaInicio && fechaFin) {
            fetchIngestas();
        }
    }, [fechaInicio, fechaFin, pacienteId]);

    const fetchIngestas = async () => {
        try {
            const params = {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            };
            if (pacienteId) params.paciente_id = pacienteId;

            const response = await api.get('/ingestas', { params });
            setIngestas(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar ingestas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Eliminar Ingesta',
            message: '¿Estás seguro de que deseas eliminar esta ingesta? Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/ingestas/${id}`);
            setIngestas(ingestas.filter(i => i.id_ingesta !== id));
            toast.success('Ingesta eliminada exitosamente');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar ingesta';
            toast.error(errorMessage);
        }
    };

    // Memoizar el cálculo de totales para evitar recálculos innecesarios
    const calcularTotales = useMemo(() => {
        return (ingesta) => {
            if (!ingesta.alimentos) return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

            return ingesta.alimentos.reduce((totales, alimento) => {
                const cantidad = alimento.pivot?.cantidad_gramos || 0;
                return {
                    calorias: totales.calorias + (alimento.calorias_por_100g * cantidad / 100),
                    proteinas: totales.proteinas + (alimento.proteinas_por_100g * cantidad / 100),
                    carbohidratos: totales.carbohidratos + (alimento.carbohidratos_por_100g * cantidad / 100),
                    grasas: totales.grasas + (alimento.grasas_por_100g * cantidad / 100),
                };
            }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
        };
    }, []);

    // Memoizar el agrupamiento por día
    const ingestasPorDia = useMemo(() => {
        return ingestas.reduce((grupos, ingesta) => {
            const fecha = new Date(ingesta.fecha_hora).toLocaleDateString('es-ES');
            if (!grupos[fecha]) {
                grupos[fecha] = [];
            }
            grupos[fecha].push(ingesta);
            return grupos;
        }, {});
    }, [ingestas]);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Registro de Ingestas</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Historial de comidas y nutrición</p>
                        {isPaciente() && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                💡 Tip: Usa <Link to="/mis-comidas-hoy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">Mis Comidas de Hoy</Link> para registro rápido desde tu plan
                            </p>
                        )}
                    </div>
                    <Link to="/ingestas/nueva" className="btn-primary">
                        + Registrar Ingesta
                    </Link>
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        {!isPaciente() && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ID Paciente
                                </label>
                                <input
                                    type="number"
                                    value={pacienteId}
                                    onChange={(e) => setPacienteId(e.target.value)}
                                    className="input-field"
                                    placeholder="Opcional..."
                                />
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : Object.keys(ingestasPorDia).length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron ingestas en este periodo</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(ingestasPorDia).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([fecha, ingestasDelDia]) => {
                                // Calcular totales del día
                                const totalesDia = ingestasDelDia.reduce((acc, ingesta) => {
                                    const totales = calcularTotales(ingesta);
                                    return {
                                        calorias: acc.calorias + totales.calorias,
                                        proteinas: acc.proteinas + totales.proteinas,
                                        carbohidratos: acc.carbohidratos + totales.carbohidratos,
                                        grasas: acc.grasas + totales.grasas,
                                    };
                                }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });

                                return (
                                    <div key={fecha} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-gray-800">{fecha}</h3>
                                            <div className="flex gap-4 text-sm">
                                                <span className="font-medium">
                                                    Total: <span className="text-primary-600">{totalesDia.calorias.toFixed(0)} kcal</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {ingestasDelDia.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)).map((ingesta) => {
                                                const totales = calcularTotales(ingesta);
                                                return (
                                                    <div key={ingesta.id_ingesta} className="bg-white rounded-lg p-4 border">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <p className="font-medium text-gray-800">
                                                                    {new Date(ingesta.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {ingesta.paciente?.nombre} {ingesta.paciente?.apellido}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(ingesta.id_ingesta)}
                                                                className="text-red-600 hover:text-red-700 text-sm"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>

                                                        {ingesta.alimentos && ingesta.alimentos.length > 0 && (
                                                            <div className="space-y-2 mb-3">
                                                                {ingesta.alimentos.map((alimento) => (
                                                                    <div key={alimento.id_alimento} className="flex justify-between text-sm">
                                                                        <span className="text-gray-700">{alimento.nombre}</span>
                                                                        <span className="text-gray-500">{alimento.pivot?.cantidad_gramos}g</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="pt-3 border-t grid grid-cols-4 gap-4 text-center text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Calorías</p>
                                                                <p className="font-bold text-gray-800">{totales.calorias.toFixed(0)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Proteínas</p>
                                                                <p className="font-bold text-blue-600">{totales.proteinas.toFixed(1)}g</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Carbos</p>
                                                                <p className="font-bold text-yellow-600">{totales.carbohidratos.toFixed(1)}g</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Grasas</p>
                                                                <p className="font-bold text-orange-600">{totales.grasas.toFixed(1)}g</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Totales del día */}
                                        <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                                            <div className="grid grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <p className="text-sm text-primary-700">Total Calorías</p>
                                                    <p className="text-2xl font-bold text-primary-900">{totalesDia.calorias.toFixed(0)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-700">Total Proteínas</p>
                                                    <p className="text-2xl font-bold text-blue-900">{totalesDia.proteinas.toFixed(1)}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-yellow-700">Total Carbos</p>
                                                    <p className="text-2xl font-bold text-yellow-900">{totalesDia.carbohidratos.toFixed(1)}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-orange-700">Total Grasas</p>
                                                    <p className="text-2xl font-bold text-orange-900">{totalesDia.grasas.toFixed(1)}g</p>
                                                </div>
                                            </div>
                                        </div>
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

export default IngestasIndex;
