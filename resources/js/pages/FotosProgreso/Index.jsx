import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const FotosProgresoIndex = () => {
    const { user, isNutricionista, isPaciente } = useAuth();
    const [fotos, setFotos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [filter, setFilter] = useState('todas'); // todas, antes, durante, despues

    const [formData, setFormData] = useState({
        id_paciente: '',
        titulo: '',
        descripcion: '',
        tipo: 'durante',
        peso_kg: '',
        fecha: new Date().toISOString().split('T')[0],
        foto: null
    });

    useEffect(() => {
        if (isNutricionista) {
            fetchPacientes();
        } else if (isPaciente) {
            setSelectedPaciente(user.id);
            fetchFotos(user.id);
        }
    }, []);

    useEffect(() => {
        if (selectedPaciente) {
            fetchFotos(selectedPaciente);
        }
    }, [selectedPaciente, filter]);

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    };

    const fetchFotos = async (pacienteId) => {
        setLoading(true);
        try {
            const params = filter !== 'todas' ? { tipo: filter } : {};
            const response = await api.get(`/fotos-progreso/paciente/${pacienteId}`, { params });
            setFotos(response.data);
        } catch (error) {
            console.error('Error al cargar fotos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, foto: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('id_paciente', isPaciente ? user.id : formData.id_paciente);
        data.append('titulo', formData.titulo);
        data.append('descripcion', formData.descripcion);
        data.append('tipo', formData.tipo);
        data.append('peso_kg', formData.peso_kg);
        data.append('fecha', formData.fecha);
        data.append('foto', formData.foto);

        try {
            await api.post('/fotos-progreso', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Foto subida exitosamente');
            setShowUploadModal(false);
            setFormData({
                id_paciente: '',
                titulo: '',
                descripcion: '',
                tipo: 'durante',
                peso_kg: '',
                fecha: new Date().toISOString().split('T')[0],
                foto: null
            });
            fetchFotos(isPaciente ? user.id : selectedPaciente);
        } catch (error) {
            console.error('Error al subir foto:', error);
            alert('Error al subir la foto');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta foto?')) return;

        try {
            await api.delete(`/fotos-progreso/${id}`);
            fetchFotos(isPaciente ? user.id : selectedPaciente);
        } catch (error) {
            console.error('Error al eliminar foto:', error);
            alert('Error al eliminar la foto');
        }
    };

    const getTipoColor = (tipo) => {
        const colors = {
            antes: 'bg-blue-100 text-blue-800',
            durante: 'bg-yellow-100 text-yellow-800',
            despues: 'bg-green-100 text-green-800'
        };
        return colors[tipo] || 'bg-gray-100 text-gray-800';
    };

    const getTipoLabel = (tipo) => {
        const labels = {
            antes: 'Antes',
            durante: 'Durante',
            despues: 'Después'
        };
        return labels[tipo] || tipo;
    };

    const filteredFotos = filter === 'todas' 
        ? fotos 
        : fotos.filter(f => f.tipo === filter);

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">📸 Fotos de Progreso</h2>
                        <p className="text-gray-600 mt-1">Seguimiento visual de la transformación</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary"
                        disabled={isNutricionista && !selectedPaciente}
                    >
                        📤 Subir Foto
                    </button>
                </div>

                {/* Selector de Paciente (solo nutricionista) */}
                {isNutricionista && (
                    <div className="card">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Paciente
                        </label>
                        <select
                            value={selectedPaciente || ''}
                            onChange={(e) => setSelectedPaciente(e.target.value)}
                            className="input-field"
                        >
                            <option value="">-- Selecciona un paciente --</option>
                            {pacientes.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} - {p.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Filtros */}
                {selectedPaciente && (
                    <div className="card">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setFilter('todas')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'todas'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFilter('antes')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'antes'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Antes
                            </button>
                            <button
                                onClick={() => setFilter('durante')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'durante'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Durante
                            </button>
                            <button
                                onClick={() => setFilter('despues')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'despues'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Después
                            </button>
                            <button
                                onClick={() => setShowComparison(true)}
                                className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                🔄 Ver Comparación
                            </button>
                        </div>
                    </div>
                )}

                {/* Galería de Fotos */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : !selectedPaciente && isNutricionista ? (
                    <div className="card text-center py-12">
                        <span className="text-6xl mb-4 block">👆</span>
                        <p className="text-gray-600">Selecciona un paciente para ver sus fotos</p>
                    </div>
                ) : filteredFotos.length === 0 ? (
                    <div className="card text-center py-12">
                        <span className="text-6xl mb-4 block">📷</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay fotos</h3>
                        <p className="text-gray-600 mb-4">Aún no se han subido fotos de progreso</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn-primary"
                        >
                            Subir Primera Foto
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFotos.map((foto) => (
                            <div key={foto.id_foto} className="card overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Imagen */}
                                <div className="relative h-64 bg-gray-200">
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${foto.foto_url}`}
                                        alt={foto.titulo}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${getTipoColor(foto.tipo)}`}>
                                        {getTipoLabel(foto.tipo)}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{foto.titulo}</h3>
                                    {foto.descripcion && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {foto.descripcion}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">
                                            📅 {new Date(foto.fecha).toLocaleDateString('es-ES')}
                                        </span>
                                        {foto.peso_kg && (
                                            <span className="font-semibold text-primary-600">
                                                ⚖️ {foto.peso_kg} kg
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Acciones */}
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => handleDelete(foto.id_foto)}
                                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Subir Foto */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold">📤 Subir Foto de Progreso</h3>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {isNutricionista && (
                                        <div>
                                            <label className="label">Paciente *</label>
                                            <select
                                                name="id_paciente"
                                                value={formData.id_paciente}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                required
                                            >
                                                <option value="">Selecciona un paciente</option>
                                                {pacientes.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="label">Título *</label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            placeholder="Ej: Primera semana de transformación"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            rows="3"
                                            placeholder="Agrega detalles sobre esta foto..."
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">Tipo *</label>
                                            <select
                                                name="tipo"
                                                value={formData.tipo}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                required
                                            >
                                                <option value="antes">Antes</option>
                                                <option value="durante">Durante</option>
                                                <option value="despues">Después</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="label">Peso (kg)</label>
                                            <input
                                                type="number"
                                                name="peso_kg"
                                                value={formData.peso_kg}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                step="0.1"
                                                min="20"
                                                max="300"
                                            />
                                        </div>

                                        <div>
                                            <label className="label">Fecha *</label>
                                            <input
                                                type="date"
                                                name="fecha"
                                                value={formData.fecha}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Foto * (máx 5MB)</label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleFileChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            className="flex-1 btn-secondary"
                                        >
                                            Cancelar
                                        </button>
                                        <button type="submit" className="flex-1 btn-primary">
                                            📤 Subir Foto
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Comparación Antes/Después */}
                {showComparison && selectedPaciente && (
                    <ComparacionModal
                        pacienteId={selectedPaciente}
                        onClose={() => setShowComparison(false)}
                    />
                )}
            </div>
        </Layout>
    );
};

// Componente de Comparación
const ComparacionModal = ({ pacienteId, onClose }) => {
    const [comparacion, setComparacion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComparacion();
    }, []);

    const fetchComparacion = async () => {
        try {
            const response = await api.get(`/fotos-progreso/comparacion/${pacienteId}`);
            setComparacion(response.data);
        } catch (error) {
            console.error('Error al cargar comparación:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">🔄 Comparación Antes/Después</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : !comparacion.antes || !comparacion.despues ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">📷</span>
                            <p className="text-gray-600">
                                No hay suficientes fotos para comparar. 
                                <br />
                                Se necesita al menos una foto "Antes" y una "Después"
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Foto Antes */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-center text-blue-600">📸 ANTES</h4>
                                    <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${comparacion.antes.foto_url}`}
                                            alt="Antes"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="font-semibold">{comparacion.antes.titulo}</p>
                                        <p className="text-sm text-gray-600">
                                            📅 {new Date(comparacion.antes.fecha).toLocaleDateString('es-ES')}
                                        </p>
                                        {comparacion.antes.peso_kg && (
                                            <p className="text-lg font-bold text-primary-600">
                                                ⚖️ {comparacion.antes.peso_kg} kg
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Foto Después */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-center text-green-600">📸 DESPUÉS</h4>
                                    <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${comparacion.despues.foto_url}`}
                                            alt="Después"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="font-semibold">{comparacion.despues.titulo}</p>
                                        <p className="text-sm text-gray-600">
                                            📅 {new Date(comparacion.despues.fecha).toLocaleDateString('es-ES')}
                                        </p>
                                        {comparacion.despues.peso_kg && (
                                            <p className="text-lg font-bold text-primary-600">
                                                ⚖️ {comparacion.despues.peso_kg} kg
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            {comparacion.diferencia_peso !== null && (
                                <div className="card bg-gradient-to-r from-primary-50 to-green-50 border-2 border-primary-200">
                                    <div className="text-center">
                                        <h4 className="text-lg font-bold mb-3">🎉 Progreso Total</h4>
                                        <div className="text-5xl font-bold text-primary-600 mb-2">
                                            {comparacion.diferencia_peso > 0 ? '-' : '+'}{Math.abs(comparacion.diferencia_peso)} kg
                                        </div>
                                        <p className="text-gray-700">
                                            {comparacion.diferencia_peso > 0 
                                                ? '¡Excelente pérdida de peso!' 
                                                : '¡Ganancia de masa muscular!'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FotosProgresoIndex;
