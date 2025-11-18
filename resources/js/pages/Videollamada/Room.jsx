import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useToast } from '../../components/Toast';
import api from '../../config/api';

const VideollamadaRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [sesion, setSesion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roomName, setRoomName] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        fetchSesion();
    }, [id]);

    const fetchSesion = async () => {
        try {
            const response = await api.get(`/sesiones/${id}`);
            const sesionData = response.data.data;
            setSesion(sesionData);

            // Obtener información del usuario actual
            const userResponse = await api.get('/profile');
            const userData = userResponse.data;

            // Generar nombre de sala único
            const room = `nutricion-sesion-${id}-${Date.now()}`;
            setRoomName(room);

            // Establecer nombre de usuario
            if (userData.role === 'paciente') {
                setUserName(`${userData.paciente?.nombre} ${userData.paciente?.apellido}`);
            } else if (userData.role === 'nutricionista') {
                setUserName(`Dr. ${userData.nutricionista?.nombre} ${userData.nutricionista?.apellido}`);
            } else if (userData.role === 'psicologo') {
                setUserName(`Psic. ${userData.psicologo?.nombre} ${userData.psicologo?.apellido}`);
            } else {
                setUserName(userData.name);
            }

            // Actualizar link de videollamada en la sesión
            if (!sesionData.link_videollamada) {
                await api.put(`/sesiones/${id}`, {
                    link_videollamada: room
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al cargar sesión:', error);
            toast.error('❌ Error al cargar la sesión');
            navigate('/sesiones');
        }
    };

    const handleMeetingEnd = async () => {
        try {
            // Opcional: Marcar sesión como completada al finalizar
            toast.success('✅ Videollamada finalizada');
            navigate('/sesiones');
        } catch (error) {
            console.error('Error al finalizar videollamada:', error);
            navigate('/sesiones');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-white text-lg">Preparando videollamada...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen">
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                configOverwrite={{
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    disableModeratorIndicator: false,
                    enableEmailInStats: false,
                    enableWelcomePage: false,
                    prejoinPageEnabled: true,
                    disableInviteFunctions: true,
                    doNotStoreRoom: true,
                    startScreenSharing: false,
                    enableClosePage: false,
                    defaultLanguage: 'es',
                    disableDeepLinking: true,
                    resolution: 720,
                    constraints: {
                        video: {
                            height: {
                                ideal: 720,
                                max: 720,
                                min: 360
                            }
                        }
                    },
                    disableSimulcast: false,
                    enableLayerSuspension: true,
                    p2p: {
                        enabled: true
                    }
                }}
                interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    DISABLE_PRESENCE_STATUS: true,
                    DISPLAY_WELCOME_PAGE_CONTENT: false,
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    BRAND_WATERMARK_LINK: '',
                    SHOW_POWERED_BY: false,
                    TOOLBAR_BUTTONS: [
                        'microphone',
                        'camera',
                        'closedcaptions',
                        'desktop',
                        'fullscreen',
                        'fodeviceselection',
                        'hangup',
                        'chat',
                        'recording',
                        'livestreaming',
                        'etherpad',
                        'sharedvideo',
                        'settings',
                        'raisehand',
                        'videoquality',
                        'filmstrip',
                        'stats',
                        'shortcuts',
                        'tileview',
                        'download',
                        'help',
                        'mute-everyone'
                    ],
                    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
                    FILM_STRIP_MAX_HEIGHT: 120,
                    MOBILE_APP_PROMO: false,
                    HIDE_INVITE_MORE_HEADER: true
                }}
                userInfo={{
                    displayName: userName,
                    email: ''
                }}
                onApiReady={(externalApi) => {
                    // Eventos de la videollamada
                    externalApi.addEventListeners({
                        readyToClose: handleMeetingEnd,
                        participantLeft: (participant) => {
                            console.log('Participante salió:', participant);
                        },
                        participantJoined: (participant) => {
                            console.log('Participante se unió:', participant);
                        },
                        videoConferenceJoined: () => {
                            console.log('Usuario se unió a la conferencia');
                            toast.success('✅ Conectado a la videollamada');
                        },
                        videoConferenceLeft: () => {
                            console.log('Usuario salió de la conferencia');
                            handleMeetingEnd();
                        }
                    });
                }}
                getIFrameRef={(iframeRef) => {
                    if (iframeRef) {
                        iframeRef.style.height = '100vh';
                        iframeRef.style.width = '100vw';
                    }
                }}
            />
        </div>
    );
};

export default VideollamadaRoom;
