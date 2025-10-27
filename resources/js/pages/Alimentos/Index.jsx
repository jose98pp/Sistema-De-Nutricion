import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const AlimentosIndex = () => {
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');

    useEffect(() => {
        fetchAlimentos();
    }, [search, categoria]);

    const fetchAlimentos = async () => {
        try {
            const response = await api.get('/alimentos', {
                params: { search, categoria }
            });
            setAlimentos(response.data.data);
        } catch (error) {
            console.error('Error al cargar alimentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const categorias = [
        { value: '', label: 'Todas' },
        { value: 'fruta', label: 'Frutas' },
        { value: 'verdura', label: 'Verduras' },
        { value: 'cereal', label: 'Cereales' },
        { value: 'proteina', label: 'Proteínas' },
        { value: 'lacteo', label: 'Lácteos' },
        { value: 'grasa', label: 'Grasas' },
        { value: 'otro', label: 'Otros' },
    ];

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Catálogo de Alimentos</h2>
                        <p className="text-gray-600 mt-1">Información nutricional por 100g</p>
                    </div>
                    <Link to="/alimentos/nuevo" className="btn-primary">
                        + Nuevo Alimento
                    </Link>
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Buscar alimento..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field"
                        />
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="input-field"
                        >
                            {categorias.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alimentos.map((alimento) => (
                                <div key={alimento.id_alimento} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{alimento.nombre}</h3>
                                            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize">
                                                {alimento.categoria}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Calorías:</span>
                                            <span className="font-medium">{alimento.calorias_por_100g} kcal</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Proteínas:</span>
                                            <span className="font-medium">{alimento.proteinas_por_100g}g</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Carbohidratos:</span>
                                            <span className="font-medium">{alimento.carbohidratos_por_100g}g</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Grasas:</span>
                                            <span className="font-medium">{alimento.grasas_por_100g}g</span>
                                        </div>
                                    </div>

                                    {alimento.restricciones && (
                                        <div className="mt-3 pt-3 border-t">
                                            <span className="text-xs text-red-600">⚠️ {alimento.restricciones}</span>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/alimentos/${alimento.id_alimento}/editar`}
                                            className="flex-1 text-center btn-secondary text-sm"
                                        >
                                            Editar
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AlimentosIndex;
