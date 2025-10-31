import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const RecetaForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [formData, setFormData] = useState({ nombre: '', kcal: '', restricciones: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) fetchReceta();
    }, [id]);

    const fetchReceta = async () => {
        try {
            const response = await api.get(/recetas/);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar la receta');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            if (isEdit) {
                await api.put(/recetas/, formData);
            } else {
                await api.post('/recetas', formData);
            }
            navigate('/recetas');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al guardar');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">{isEdit ? 'Editar Receta' : 'Nueva Receta'}</h2>
                    <p className="text-gray-600 mt-1">{isEdit ? 'Modifica los datos' : 'Registra una nueva receta'}</p>
                </div>
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" required />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Calorías (kcal)</label>
                            <input type="number" name="kcal" value={formData.kcal} onChange={handleChange} className="input-field" min="0" />
                            {errors.kcal && <p className="text-red-500 text-xs mt-1">{errors.kcal[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Restricciones</label>
                            <textarea name="restricciones" value={formData.restricciones} onChange={handleChange} className="input-field" rows="3" />
                            {errors.restricciones && <p className="text-red-500 text-xs mt-1">{errors.restricciones[0]}</p>}
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => navigate('/recetas')} className="btn-secondary flex-1" disabled={loading}>Cancelar</button>
                            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default RecetaForm;
