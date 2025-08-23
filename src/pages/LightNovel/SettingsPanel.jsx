// ARQUIVO: src/pages/LightNovel/SettingsPanel.jsx
import React from 'react';
import {
    SettingsPanelContainer, SettingRow, SettingLabel, SettingControl,
    ThemeButton, CustomSlider, FontSelect, ToggleButtonGroup, ToggleButton
} from './styles';

const themes = {
  light: { bg: '#f5f5f5' },
  sepia: { bg: '#fbf0d9' },
  dark: { bg: '#121212' },
};

const fontFamilies = [
    { value: "'Georgia', serif", label: "Serif (Padrão)" },
    { value: "'Helvetica Neue', sans-serif", label: "Sans-Serif" },
    { value: "'Open Dyslexic', sans-serif", label: "Open Dyslexic" },
];

const SettingsPanel = ({ settings, updateSetting }) => {
    return (
        <SettingsPanelContainer>
            {/* Tema */}
            <SettingRow>
                <SettingLabel>Tema</SettingLabel>
                <SettingControl>
                    <ThemeButton title="Claro" color={themes.light.bg} isActive={settings.theme === 'light'} onClick={() => updateSetting('theme', 'light')} />
                    <ThemeButton title="Sépia" color={themes.sepia.bg} isActive={settings.theme === 'sepia'} onClick={() => updateSetting('theme', 'sepia')} />
                    <ThemeButton title="Escuro" color={themes.dark.bg} isActive={settings.theme === 'dark'} onClick={() => updateSetting('theme', 'dark')} />
                </SettingControl>
            </SettingRow>

            {/* Família da Fonte */}
            <SettingRow>
                <SettingLabel>Fonte</SettingLabel>
                <FontSelect value={settings.fontFamily} onChange={(e) => updateSetting('fontFamily', e.target.value)}>
                    {fontFamilies.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                </FontSelect>
            </SettingRow>
            
            {/* Tamanho da Fonte */}
            <SettingRow>
                <SettingLabel>Tamanho da Fonte: <span>{settings.fontSize}px</span></SettingLabel>
                <CustomSlider min="12" max="32" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseInt(e.target.value, 10))} />
            </SettingRow>

            {/* Largura do Texto */}
            <SettingRow>
                <SettingLabel>Largura do Texto: <span>{settings.textWidth}px</span></SettingLabel>
                <CustomSlider min="500" max="1200" step="50" value={settings.textWidth} onChange={(e) => updateSetting('textWidth', parseInt(e.target.value, 10))} />
            </SettingRow>

            {/* Altura da Linha */}
            <SettingRow>
                <SettingLabel>Altura da Linha: <span>{settings.lineHeight}</span></SettingLabel>
                <CustomSlider min="1.4" max="2.4" step="0.1" value={settings.lineHeight} onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))} />
            </SettingRow>

            {/* Alinhamento */}
            <SettingRow>
                <SettingLabel>Alinhamento</SettingLabel>
                 <ToggleButtonGroup>
                    <ToggleButton isActive={settings.textAlign === 'left'} onClick={() => updateSetting('textAlign', 'left')}>Esquerda</ToggleButton>
                    <ToggleButton isActive={settings.textAlign === 'justify'} onClick={() => updateSetting('textAlign', 'justify')}>Justificado</ToggleButton>
                </ToggleButtonGroup>
            </SettingRow>
        </SettingsPanelContainer>
    );
};

export default SettingsPanel;