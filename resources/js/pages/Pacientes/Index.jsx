import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../config/api';

const PacientesIndex = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchPacientes();
    }, [search, page]);

    const fetchPacientes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/pacientes', {
                params: { search, page }
            });
            if (response.data && Array.isArray(response.data.data)) {
                setPacientes(response.data.data);
                setTotalPages(response.data.last_page || 1);
            } else {
                throw new Error('Respuesta de la API inesperada');
            }
        } catch (error) {
            console.error('Error al cargar pacientes:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
            setError(`Error al cargar los pacientes: ${errorMessage}. Verifica tu conexión o intenta de nuevo.`);
            toast.error(`Error al cargar pacientes: ${errorMessage}`);
            setPacientes([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombrePaciente) => {
        const confirmed = await confirm({
            title: 'Eliminar Paciente',
            message: `¿Estás seguro de que deseas eliminar al paciente "${nombrePaciente}"? Esta acción no se puede deshacer y eliminará todos los datos asociados.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/pacientes/${id}`);
            setPacientes(pacientes.filter(p => p.id_paciente !== id));
            toast.success(`Paciente "${nombrePaciente}" eliminado exitosamente`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar paciente';
            toast.error(errorMessage);
        }
    };

    const calcularIMC = (peso, estatura) => {
        if (!peso || !estatura) return 'N/A';
        return (peso / (estatura ** 2)).toFixed(2);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Pacientes</h2>
                        <p className="text-gray-600 mt-1">Gestión de pacientes del sistema</p>
                    </div>
                    <Link to="/pacientes/nuevo" className="btn-primary">
                        + Nuevo Paciente
                    </Link>
                </div>

                <div className="card">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={fetchPacientes}
                                className="mt-2 btn-primary"
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    ) : pacientes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron pacientes</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IMC</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nutricionista</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {pacientes.map((paciente) => (
                                            <tr key={paciente.id_paciente} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {paciente.nombre} {paciente.apellido}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{paciente.genero}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{paciente.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{paciente.telefono || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{paciente.peso_inicial} kg</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {calcularIMC(paciente.peso_inicial, paciente.estatura)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {paciente.nutricionista?.nombre || 'Sin asignar'}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Link
                                                        to={`/pacientes/${paciente.id_paciente}/editar`}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(paciente.id_paciente, `${paciente.nombre} ${paciente.apellido}`)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <span>Página {page} de {totalPages}</span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PacientesIndex;