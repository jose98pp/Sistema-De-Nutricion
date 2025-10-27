import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Trash2, Edit, Plus, Search, Mail, Phone, Briefcase, Users, Eye } from 'lucide-react';

const NutricionistasIndex = () => {
    const [nutricionistas, setNutricionistas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNutricionistas();
    }, []);

    const fetchNutricionistas = async () => {
        try {
            const response = await axios.get('/api/nutricionistas');
            setNutricionistas(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar nutricionistas:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este nutricionista?')) {
            try {
                await axios.delete(`/api/nutricionistas/${id}`);
                fetchNutricionistas();
            } catch (error) {
                console.error('Error al eliminar nutricionista:', error);
                alert('Error al eliminar el nutricionista');
            }
        }
    };

    const filteredNutricionistas = nutricionistas.filter(nutricionista => {
        const searchLower = searchTerm.toLowerCase();
        return (
            nutricionista.nombre?.toLowerCase().includes(searchLower) ||
            nutricionista.apellido?.toLowerCase().includes(searchLower) ||
            nutricionista.email?.toLowerCase().includes(searchLower) ||
            nutricionista.especialidad?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Nutricionistas</h1>
                        <p className="text-gray-600 mt-1">Gestiona el equipo de nutricionistas</p>
                    </div>
                    <Link
                        to="/nutricionistas/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Nutricionista
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Nutricionistas</p>
                                <p className="text-3xl font-bold text-gray-800">{nutricionistas.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Users className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pacientes Asignados</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {nutricionistas.reduce((sum, n) => sum + (n.pacientes_count || 0), 0)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <Briefcase className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Especialidades</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {new Set(nutricionistas.map(n => n.especialidad).filter(Boolean)).size}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Briefcase className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o especialidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Cargando nutricionistas...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nutricionista
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Especialidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pacientes
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredNutricionistas.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron nutricionistas
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredNutricionistas.map((nutricionista) => (
                                            <tr key={nutricionista.id_nutricionista} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-bold text-lg">
                                                                {nutricionista.nombre?.charAt(0)}{nutricionista.apellido?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {nutricionista.nombre} {nutricionista.apellido}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {nutricionista.email}
                                                    </div>
                                                    {nutricionista.telefono && (
                                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {nutricionista.telefono}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        {nutricionista.especialidad || 'Sin especialidad'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Users size={16} className="text-gray-400" />
                                                        {nutricionista.pacientes_count || 0} pacientes
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/nutricionistas/${nutricionista.id_nutricionista}/pacientes`}
                                                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                                            title="Ver Pacientes"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <Link
                                                            to={`/nutricionistas/${nutricionista.id_nutricionista}/editar`}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(nutricionista.id_nutricionista)}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats */}
                {!loading && nutricionistas.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {filteredNutricionistas.length} de {nutricionistas.length} nutricionistas
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NutricionistasIndex;
