import React, { useState, createContext, useContext } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// Context para el sistema de confirmación
const ConfirmContext = createContext();

// Hook para usar el sistema de confirmación
export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider');
    }
    return context;
};

// Componente de diálogo de confirmación
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
                    iconBg: 'bg-red-100'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
                    iconBg: 'bg-yellow-100'
                };
            default:
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
                    iconBg: 'bg-blue-100'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Centrar el modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                            {styles.icon}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors ${styles.confirmButton}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Provider del sistema de confirmación
export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'default',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const confirm = ({
        title = '¿Estás seguro?',
        message = 'Esta acción no se puede deshacer.',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'default'
    }) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                type,
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    };

    const handleClose = () => {
        confirmState.onCancel();
    };

    const handleConfirm = () => {
        confirmState.onConfirm();
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                type={confirmState.type}
            />
        </ConfirmContext.Provider>
    );
};

export default ConfirmDialog;