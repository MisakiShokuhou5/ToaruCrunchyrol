// ARQUIVO: src/pages/LightNovel/styles.js
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

// --- Animações ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;


// --- Estilos Globais (para travar o scroll do body) ---
export const GlobalReaderStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

// --- Estilos da Página Principal ---
export const MainContent = styled.main`
  padding: 100px 2rem 2rem 2rem;
`;
export const SeriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
`;
export const SeriesCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(138, 43, 226, 0.5);
  }
`;
export const SeriesCover = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  flex-shrink: 0;
`;
export const SeriesTitle = styled.span`
  padding: 1rem 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #E5E5E5;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// --- Estilos do Leitor ---
export const ReaderOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.98);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  user-select: none;
  animation: ${fadeIn} 0.3s ease;
`;

export const ReaderHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: #1a1a1a;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  flex-shrink: 0;
  z-index: 2010;
`;

export const ReaderTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 1rem;
`;

export const ReaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
`;

export const ReaderIconBtn = styled.button`
  background: none;
  border: none;
  color: #e5e5e5;
  font-size: 1.6rem;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  padding: 0;
  &:hover {
    color: #8a2be2;
    transform: scale(1.1);
  }
`;

export const ChapterSelector = styled.select`
  background-color: #2a2a2a;
  color: #e5e5e5;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
`;

export const ReaderBody = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem 0;
  display: flex;
  justify-content: center;
  position: relative;
  
  --theme-light-bg: #f5f5f5;
  --theme-light-text: #121212;
  --theme-sepia-bg: #fbf0d9;
  --theme-sepia-text: #5b4636;
  --theme-dark-bg: #121212;
  --theme-dark-text: #e5e5e5;

  ${props => props.theme === 'light' && css`
    --reader-bg-color: var(--theme-light-bg);
    --reader-text-color: var(--theme-light-text);
  `}
  ${props => props.theme === 'sepia' && css`
    --reader-bg-color: var(--theme-sepia-bg);
    --reader-text-color: var(--theme-sepia-text);
  `}
  ${props => props.theme === 'dark' && css`
    --reader-bg-color: var(--theme-dark-bg);
    --reader-text-color: var(--theme-dark-text);
  `}

  /* Estilização da barra de rolagem */
  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-track { background: #1a1a1a; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 5px; }
  &::-webkit-scrollbar-thumb:hover { background: #8a2be2; }
`;

export const ChapterContent = styled.div`
  white-space: pre-wrap;
  width: 100%;
  max-width: ${props => props.textWidth}px;
  font-size: ${props => props.fontSize}px;
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  text-align: ${props => props.textAlign};

  background-color: var(--reader-bg-color);
  color: var(--reader-text-color);
  padding: 3rem 4rem;
  transition: all 0.3s ease;
`;

export const ChapterTitle = styled.h3`
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
`;

export const ReaderFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background-color: #1a1a1a;
  flex-shrink: 0;
  z-index: 2010;
`;

export const NavButton = styled.button`
  background-color: #2a2a2a;
  border: 1px solid #555;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #8a2be2;
    border-color: #8a2be2;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 100px;
  right: 30px;
  z-index: 2020;
  background-color: rgba(138, 43, 226, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  transition: transform 0.2s, opacity 0.3s;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'scale(1)' : 'scale(0.5)'};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};

  &:hover {
    background-color: rgba(138, 43, 226, 1);
    transform: scale(1.1);
  }
`;

// --- Estilos do Painel de Configurações ---
export const SettingsPanelContainer = styled.div`
  position: absolute;
  top: 130%;
  right: 0;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  z-index: 2100;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 320px;
  animation: ${slideIn} 0.2s ease-out;
`;

export const SettingRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const SettingLabel = styled.label`
  font-size: 0.9rem;
  color: #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span {
    font-weight: bold;
    color: #fff;
  }
`;

export const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const ThemeButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${props => props.isActive ? '#8a2be2' : '#555'};
  cursor: pointer;
  background-color: ${props => props.color};
  transition: border-color 0.2s, transform 0.2s;
  &:hover {
    transform: scale(1.1);
  }
`;

export const CustomSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: #444;
  border-radius: 5px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #8a2be2;
    cursor: pointer;
    border-radius: 50%;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #8a2be2;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }
`;

export const FontSelect = styled.select`
  width: 100%;
  background-color: #333;
  color: #e5e5e5;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 0.5rem;
`;

export const ToggleButtonGroup = styled.div`
  display: flex;
  border: 1px solid #555;
  border-radius: 5px;
  overflow: hidden;
`;

export const ToggleButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  background-color: ${props => props.isActive ? '#8a2be2' : '#333'};
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  &:not(:last-child) {
    border-right: 1px solid #555;
  }
`;