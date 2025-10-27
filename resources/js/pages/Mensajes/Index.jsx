import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const MensajesIndex = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchUsers, setSearchUsers] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.usuario.id);
            const interval = setInterval(() => fetchMessages(selectedUser.usuario.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            searchForUsers();
        } else {
            setSearchUsers([]);
        }
    }, [searchTerm]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mensajes/conversaciones');
            setConversations(response.data);
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const response = await api.get(`/mensajes/conversacion/${otherUserId}`);
            setMessages(response.data.mensajes);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    };

    const searchForUsers = async () => {
        try {
            const response = await api.get(`/mensajes/usuarios/buscar?search=${searchTerm}`);
            setSearchUsers(response.data);
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            await api.post('/mensajes', {
                id_destinatario: selectedUser.usuario.id,
                mensaje: newMessage
            });
            setNewMessage('');
            await fetchMessages(selectedUser.usuario.id);
            await fetchConversations();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const startNewConversation = (usuario) => {
        setSelectedUser({
            usuario,
            mensajes_no_leidos: 0,
            ultimo_mensaje: null
        });
        setShowSearch(false);
        setSearchTerm('');
        setSearchUsers([]);
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-200px)] flex gap-4">
                {/* Panel Izquierdo - Lista de Conversaciones */}
                <div className="w-1/3 bg-white rounded-lg shadow-md flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold mb-3">Mensajes</h2>
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="w-full btn-primary text-sm"
                        >
                            + Nueva Conversación
                        </button>

                        {/* Buscador de usuarios */}
                        {showSearch && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar usuario..."
                                    className="input-field text-sm"
                                />
                                {searchUsers.length > 0 && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                                        {searchUsers.map((usuario) => (
                                            <button
                                                key={usuario.id}
                                                onClick={() => startNewConversation(usuario)}
                                                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-0"
                                            >
                                                <p className="font-medium text-sm">{usuario.name}</p>
                                                <p className="text-xs text-gray-500">{usuario.email}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lista de Conversaciones */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="text-4xl block mb-2">💬</span>
                                <p className="text-sm">No tienes conversaciones</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.usuario.id}
                                    onClick={() => setSelectedUser(conv)}
                                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                                        selectedUser?.usuario.id === conv.usuario.id ? 'bg-primary-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                            {conv.usuario.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {conv.usuario.name}
                                                </p>
                                                {conv.mensajes_no_leidos > 0 && (
                                                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                                                        {conv.mensajes_no_leidos}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.ultimo_mensaje && (
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conv.ultimo_mensaje.mensaje}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel Derecho - Chat */}
                <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Header del Chat */}
                            <div className="p-4 border-b flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                    {selectedUser.usuario.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold">{selectedUser.usuario.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{selectedUser.usuario.role}</p>
                                </div>
                            </div>

                            {/* Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id_mensaje}
                                        className={`flex ${
                                            msg.id_remitente === user.id ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                msg.id_remitente === user.id
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white text-gray-800 border'
                                            }`}
                                        >
                                            <p className="text-sm">{msg.mensaje}</p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    msg.id_remitente === user.id
                                                        ? 'text-primary-100'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input de Mensaje */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 input-field"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="btn-primary disabled:opacity-50"
                                    >
                                        {sending ? '⏳' : '📤'} Enviar
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <span className="text-6xl block mb-4">💬</span>
                                <p>Selecciona una conversación para empezar</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MensajesIndex;
