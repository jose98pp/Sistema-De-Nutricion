import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const IngestaForm = () => {
    const navigate = useNavigate();
    const { user, isPaciente } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pacienteId, setPacienteId] = useState('');
    const [fechaHora, setFechaHora] = useState('');
    const [alimentos, setAlimentos] = useState([]);
    const [alimentosSeleccionados, setAlimentosSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        // Establecer fecha y hora actual
        const ahora = new Date();
        const offset = ahora.getTimezoneOffset() * 60000;
        const fechaLocal = new Date(ahora - offset);
        setFechaHora(fechaLocal.toISOString().slice(0, 16));

        fetchAlimentos();
    }, []);

    const fetchAlimentos = async () => {
        try {
            const response = await api.get('/alimentos');
            setAlimentos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar alimentos:', error);
        }
    };

    const alimentosFiltrados = alimentos.filter(a => 
        a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const agregarAlimento = (alimento) => {
        if (alimentosSeleccionados.find(a => a.id_alimento === alimento.id_alimento)) {
            alert('Este alimento ya está agregado');
            return;
        }

        setAlimentosSeleccionados([...alimentosSeleccionados, {
            ...alimento,
            cantidad_gramos: 100
        }]);
        setBusqueda('');
    };

    const actualizarCantidad = (id, cantidad) => {
        setAlimentosSeleccionados(alimentosSeleccionados.map(a => 
            a.id_alimento === id ? { ...a, cantidad_gramos: parseFloat(cantidad) || 0 } : a
        ));
    };

    const eliminarAlimento = (id) => {
        setAlimentosSeleccionados(alimentosSeleccionados.filter(a => a.id_alimento !== id));
    };

    const calcularTotales = () => {
        return alimentosSeleccionados.reduce((totales, alimento) => {
            const factor = alimento.cantidad_gramos / 100;
            return {
                calorias: totales.calorias + (alimento.calorias_por_100g * factor),
                proteinas: totales.proteinas + (alimento.proteinas_por_100g * factor),
                carbohidratos: totales.carbohidratos + (alimento.carbohidratos_por_100g * factor),
                grasas: totales.grasas + (alimento.grasas_por_100g * factor),
            };
        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (alimentosSeleccionados.length === 0) {
            alert('Debes agregar al menos un alimento');
            return;
        }

        // Obtener id_paciente
        let idPaciente;
        if (isPaciente) {
            // Si es paciente, obtener su id_paciente
            idPaciente = user.paciente?.id_paciente || user.id_paciente;
            if (!idPaciente) {
                alert('Error: No se pudo obtener tu ID de paciente. Por favor contacta al administrador.');
                return;
            }
        } else {
            // Si es nutricionista/admin, debe seleccionar un paciente
            if (!pacienteId) {
                alert('Debes seleccionar un paciente');
                return;
            }
            idPaciente = pacienteId;
        }

        setLoading(true);

        try {
            const data = {
                fecha_hora: fechaHora,
                id_paciente: idPaciente,
                alimentos: alimentosSeleccionados.map(a => ({
                    id_alimento: a.id_alimento,
                    cantidad_gramos: a.cantidad_gramos
                }))
            };

            console.log('Enviando datos:', data); // Para debug

            await api.post('/ingestas', data);
            alert('Ingesta registrada exitosamente');
            navigate('/ingestas');
        } catch (error) {
            console.error('Error completo:', error);
            if (error.response?.data?.errors) {
                const errores = Object.values(error.response.data.errors).flat().join('\n');
                alert('Errores de validación:\n' + errores);
            } else if (error.response?.data?.message) {
                alert('Error: ' + error.response.data.message);
            } else {
                alert('Error al registrar ingesta. Por favor intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const totales = calcularTotales();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/ingestas')}
                        className="text-primary-600 hover:text-primary-700 mb-2"
                    >
                        ← Volver
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">Registrar Ingesta</h2>
                    <p className="text-gray-600 mt-1">Registra lo que comiste</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Información Básica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha y Hora *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={fechaHora}
                                    onChange={(e) => setFechaHora(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {!isPaciente() && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ID Paciente *
                                    </label>
                                    <input
                                        type="number"
                                        value={pacienteId}
                                        onChange={(e) => setPacienteId(e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Agregar Alimentos</h3>
                        
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar alimento..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {busqueda && (
                            <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
                                {alimentosFiltrados.length === 0 ? (
                                    <p className="p-4 text-gray-500">No se encontraron alimentos</p>
                                ) : (
                                    alimentosFiltrados.map((alimento) => (
                                        <button
                                            key={alimento.id_alimento}
                                            type="button"
                                            onClick={() => agregarAlimento(alimento)}
                                            className="w-full text-left p-3 hover:bg-gray-50 border-b"
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-medium">{alimento.nombre}</span>
                                                <span className="text-sm text-gray-500 capitalize">{alimento.categoria}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {alimento.calorias_por_100g} kcal/100g
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {alimentosSeleccionados.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Busca y agrega alimentos a tu ingesta
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alimentosSeleccionados.map((alimento) => (
                                    <div key={alimento.id_alimento} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{alimento.nombre}</p>
                                            <p className="text-sm text-gray-600">
                                                {((alimento.calorias_por_100g * alimento.cantidad_gramos) / 100).toFixed(0)} kcal
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={alimento.cantidad_gramos}
                                                onChange={(e) => actualizarCantidad(alimento.id_alimento, e.target.value)}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                                min="1"
                                            />
                                            <span className="text-sm text-gray-600">gramos</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => eliminarAlimento(alimento.id_alimento)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {alimentosSeleccionados.length > 0 && (
                        <div className="card bg-primary-50 border-2 border-primary-200">
                            <h3 className="text-xl font-bold text-primary-800 mb-4">Totales Nutricionales</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <p className="text-sm text-primary-700 mb-1">Calorías</p>
                                    <p className="text-3xl font-bold text-primary-900">{totales.calorias.toFixed(0)}</p>
                                    <p className="text-xs text-primary-600">kcal</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-blue-700 mb-1">Proteínas</p>
                                    <p className="text-3xl font-bold text-blue-900">{totales.proteinas.toFixed(1)}</p>
                                    <p className="text-xs text-blue-600">gramos</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-yellow-700 mb-1">Carbohidratos</p>
                                    <p className="text-3xl font-bold text-yellow-900">{totales.carbohidratos.toFixed(1)}</p>
                                    <p className="text-xs text-yellow-600">gramos</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-orange-700 mb-1">Grasas</p>
                                    <p className="text-3xl font-bold text-orange-900">{totales.grasas.toFixed(1)}</p>
                                    <p className="text-xs text-orange-600">gramos</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || alimentosSeleccionados.length === 0}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Registrar Ingesta'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/ingestas')}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default IngestaForm;
