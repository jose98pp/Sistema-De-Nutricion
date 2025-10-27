import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Trash2, Edit, Plus, Search } from 'lucide-react';

const ServiciosIndex = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await api.get('/servicios');
            setServicios(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
            try {
                await api.delete(`/servicios/${id}`);
                fetchServicios();
            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                alert('Error al eliminar el servicio');
            }
        }
    };

    const filteredServicios = servicios.filter(servicio => {
        const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filterTipo === '' || servicio.tipo_servicio === filterTipo;
        return matchesSearch && matchesTipo;
    });

    const getTipoLabel = (tipo) => {
        const tipos = {
            'plan_alimenticio': 'Plan Alimenticio',
            'asesoramiento': 'Asesoramiento',
            'catering': 'Catering'
        };
        return tipos[tipo] || tipo;
    };

    const getTipoBadgeClass = (tipo) => {
        const classes = {
            'plan_alimenticio': 'bg-blue-100 text-blue-800',
            'asesoramiento': 'bg-green-100 text-green-800',
            'catering': 'bg-purple-100 text-purple-800'
        };
        return classes[tipo] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Servicios</h1>
                        <p className="text-gray-600 mt-1">Gestiona los servicios ofrecidos</p>
                    </div>
                    <Link
                        to="/servicios/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Servicio
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar servicios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="plan_alimenticio">Plan Alimenticio</option>
                            <option value="asesoramiento">Asesoramiento</option>
                            <option value="catering">Catering</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Cargando servicios...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duración
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Costo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredServicios.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron servicios
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredServicios.map((servicio) => (
                                            <tr key={servicio.id_servicio} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {servicio.nombre}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoBadgeClass(servicio.tipo_servicio)}`}>
                                                        {getTipoLabel(servicio.tipo_servicio)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {servicio.duracion_dias} días
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    ${parseFloat(servicio.costo).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {servicio.descripcion || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/servicios/${servicio.id_servicio}/editar`}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(servicio.id_servicio)}
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
                {!loading && servicios.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {filteredServicios.length} de {servicios.length} servicios
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ServiciosIndex;
