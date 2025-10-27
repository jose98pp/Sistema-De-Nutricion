import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Eye, Edit, Plus, Search, Calendar, DollarSign } from 'lucide-react';

const ContratosIndex = () => {
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    useEffect(() => {
        fetchContratos();
    }, []);

    const fetchContratos = async () => {
        try {
            const response = await api.get('/contratos');
            const data = response.data.data || response.data;
            console.log('Contratos cargados:', data); // Debug
            setContratos(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar contratos:', error);
            setContratos([]);
            setLoading(false);
        }
    };

    const filteredContratos = contratos.filter(contrato => {
        if (!searchTerm && !filterEstado) return true;
        
        const pacienteNombre = contrato.paciente?.nombre || '';
        const pacienteApellido = contrato.paciente?.apellido || '';
        const pacienteEmail = contrato.paciente?.email || '';
        const servicioNombre = contrato.servicio?.nombre || '';
        const servicioDescripcion = contrato.servicio?.descripcion || '';
        
        const searchLower = searchTerm.toLowerCase().trim();
        
        const matchesSearch = !searchTerm || (
            pacienteNombre.toLowerCase().includes(searchLower) ||
            pacienteApellido.toLowerCase().includes(searchLower) ||
            pacienteEmail.toLowerCase().includes(searchLower) ||
            servicioNombre.toLowerCase().includes(searchLower) ||
            servicioDescripcion.toLowerCase().includes(searchLower) ||
            `${pacienteNombre} ${pacienteApellido}`.toLowerCase().includes(searchLower)
        );
        
        const matchesEstado = !filterEstado || contrato.estado === filterEstado;
        
        return matchesSearch && matchesEstado;
    });

    const getEstadoBadgeClass = (estado) => {
        const classes = {
            'PENDIENTE': 'bg-yellow-100 text-yellow-800',
            'ACTIVO': 'bg-green-100 text-green-800',
            'FINALIZADO': 'bg-gray-100 text-gray-800',
            'CANCELADO': 'bg-red-100 text-red-800'
        };
        return classes[estado] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Contratos</h1>
                        <p className="text-gray-600 mt-1">Gestiona los contratos de servicios con pacientes</p>
                    </div>
                    <Link
                        to="/contratos/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Contrato
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {['PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO'].map(estado => {
                        const count = contratos.filter(c => c.estado === estado).length;
                        return (
                            <div key={estado} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{estado}</p>
                                        <p className="text-2xl font-bold text-gray-800">{count}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full ${getEstadoBadgeClass(estado)} flex items-center justify-center`}>
                                        <Calendar size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="🔍 Buscar por paciente, email o servicio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:w-64"
                        >
                            <option value="">Todos los estados</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="ACTIVO">Activo</option>
                            <option value="FINALIZADO">Finalizado</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                        {(searchTerm || filterEstado) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterEstado('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    {(searchTerm || filterEstado) && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Filtros activos:</span>
                            {searchTerm && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    Búsqueda: "{searchTerm}"
                                </span>
                            )}
                            {filterEstado && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    Estado: {filterEstado}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Cargando contratos...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paciente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Servicio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Inicio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Fin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Costo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContratos.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron contratos
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContratos.map((contrato) => (
                                            <tr key={contrato.id_contrato} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {contrato.paciente?.nombre} {contrato.paciente?.apellido}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contrato.paciente?.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {contrato.servicio?.nombre}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contrato.servicio?.duracion_dias} días
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(contrato.fecha_inicio)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(contrato.fecha_fin)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    ${parseFloat(contrato.costo_contratado).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(contrato.estado)}`}>
                                                        {contrato.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/contratos/${contrato.id_contrato}`}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <Link
                                                            to={`/contratos/${contrato.id_contrato}/editar`}
                                                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
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
                {!loading && (
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {contratos.length === 0 ? (
                                <span>No hay contratos registrados</span>
                            ) : (
                                <span>
                                    Mostrando <strong className="text-gray-800">{filteredContratos.length}</strong> de <strong className="text-gray-800">{contratos.length}</strong> contratos
                                    {(searchTerm || filterEstado) && filteredContratos.length < contratos.length && (
                                        <span className="ml-2 text-blue-600 font-medium">
                                            ({contratos.length - filteredContratos.length} ocultos por filtros)
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        {contratos.length > 0 && (
                            <Link
                                to="/contratos/nuevo"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                + Agregar otro contrato
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ContratosIndex;
