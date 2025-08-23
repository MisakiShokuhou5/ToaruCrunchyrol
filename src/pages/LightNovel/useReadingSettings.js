// ARQUIVO: src/pages/LightNovel/useReadingSettings.js
import { useState, useEffect } from 'react';

// Função para obter as configurações salvas ou usar os padrões
const getInitialSettings = () => {
    try {
        const savedSettings = localStorage.getItem('lightNovelReaderSettings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error("Falha ao carregar configurações:", error);
    }
    // Valores padrão se nada for encontrado
    return {
        fontSize: 18,
        theme: 'dark',
        textWidth: 800,
        lineHeight: 1.8,
        fontFamily: "'Georgia', serif",
        textAlign: 'left', // 'left' ou 'justify'
    };
};

export const useReadingSettings = () => {
    const [settings, setSettings] = useState(getInitialSettings);

    // Salva as configurações no localStorage sempre que elas mudarem
    useEffect(() => {
        try {
            localStorage.setItem('lightNovelReaderSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Falha ao salvar configurações:", error);
        }
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return [settings, updateSetting];
};