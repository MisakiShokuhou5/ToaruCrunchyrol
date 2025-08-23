// ARQUIVO: src/pages/TierList.jsx
// VERSÃO CORRIGIDA E ROBUSTA: Lógica de estado refeita para eliminar bugs de duplicação.

// --- IMPORTS ---
import React, { useState, useRef, useMemo, useEffect, useReducer } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Header from '../components/Header';
import Spinner from '../components/shared/Spinner';
import { FaCog, FaTrash, FaArrowUp, FaArrowDown, FaUndo, FaPlus, FaImage, FaList, FaThList } from 'react-icons/fa';

// --- STYLED COMPONENTS (mesma versão aprimorada) ---
const TierListContainer = styled.div`
    padding-top: 80px;
    background: linear-gradient(180deg, #1a1a2e 0%, #121212 25%);
    color: #e0e0e0;
    padding-bottom: 2rem;
    min-height: 100vh;
`;
const ControlsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 4rem;
    flex-wrap: wrap;
    gap: 1rem;
    border-bottom: 1px solid rgba(138, 43, 226, 0.2);
`;
const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;
const CharacterPoolContainer = styled.div`
    padding: 2rem 4rem;
    background-color: rgba(0,0,0,0.2);
    margin: 2rem 4rem;
    border-radius: 12px;
`;
const TierRowContainer = styled(motion.div)`
    display: flex;
    align-items: stretch;
    min-height: 120px;
    background-color: #1c1c1c;
    margin: 4px 4rem;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    &:hover .tier-actions {
        opacity: 1;
        transform: translateX(0);
    }
`;
const TierLabel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    background-color: ${props => props.color || '#333'};
    color: #111;
    font-size: 2.5rem;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    flex-shrink: 0;
    border-right: 2px solid rgba(0,0,0,0.2);
`;
const DropZone = styled.div`
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    padding: 10px;
    background-color: ${props => props.$isOver ? 'rgba(138, 43, 226, 0.2)' : 'transparent'};
    transition: background-color 0.2s ease-in-out;
    min-height: 120px;
`;
const TierActions = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #111;
    padding: 0 10px;
    flex-shrink: 0;
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.3s, transform 0.3s;
    button {
        background: none; border: none; color: #aaa;
        cursor: pointer; font-size: 1.2rem; padding: 10px;
        transition: color 0.2s, transform 0.2s;
        &:hover { color: #fff; transform: scale(1.1); }
        &:disabled { color: #444; cursor: not-allowed; transform: scale(1); }
    }
`;
const CharacterPool = styled(DropZone)`
    min-height: 150px;
    background-color: #101010;
    border-radius: 8px;
    border: 1px dashed #333;
`;
const CharacterItemStyled = styled(motion.div)`
    width: 100px;
    height: 100px;
    margin: 5px;
    cursor: grab;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    border: 3px solid ${props => props.$gender === 'Feminino' ? '#e91e63' : (props.$gender === 'Masculino' ? '#2196f3' : '#555')};
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    transition: box-shadow 0.2s, transform 0.2s;
    &:active {
        cursor: grabbing;
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(138, 43, 226, 0.5);
    }
    img {
        width: 100%; height: 100%;
        object-fit: cover; pointer-events: none;
    }
    &:hover > div {
        opacity: 1;
        visibility: visible;
    }
`;
const CharacterTooltip = styled.div`
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 8px;
    transition: opacity 0.2s, visibility 0.2s;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    h4 { margin: 0 0 4px 0; font-size: 12px; font-weight: bold; }
    p { margin: 0; font-size: 10px; color: #ccc; }
`;
const ControlButton = styled(motion.button)`
    background-color: #8a2be2;
    color: white; border: none;
    padding: 10px 20px; border-radius: 5px;
    cursor: pointer; font-weight: bold;
    display: flex; align-items: center; gap: 0.5rem;
`;
const ModeButton = styled(ControlButton)`
    background-color: ${props => props.$active ? '#7a1dd1' : '#3a3a5e'};
`;
const SearchInput = styled.input`
    padding: 10px;
    background-color: #1e1e3f;
    border: 1px solid rgba(138, 43, 226, 0.5);
    color: #fff; border-radius: 5px;
    font-size: 1rem; flex-grow: 1; min-width: 200px;
`;
const FilterButtonGroup = styled.div`
    display: flex;
    background-color: #1e1e3f;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid rgba(138, 43, 226, 0.5);
`;
const FilterButton = styled.button`
    padding: 10px 15px;
    border: none;
    background-color: ${props => props.$active ? '#8a2be2' : 'transparent'};
    color: #fff; cursor: pointer; font-weight: bold;
    &:not(:last-child) {
        border-right: 1px solid rgba(138, 43, 226, 0.5);
    }
`;
const ModalOverlay = styled(motion.div)`
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
`;
const ModalContent = styled(motion.div)`
    background-color: #2a2a2a; padding: 2rem;
    border-radius: 8px; display: flex;
    flex-direction: column; gap: 1rem; min-width: 300px;
    border-top: 4px solid #8a2be2;
`;
const ModalTitle = styled.h2` margin: 0; text-align: center; `;
const InputGroup = styled.div`
    display: flex; flex-direction: column; gap: 0.5rem;
    label { font-weight: bold; color: #ccc; }
    input {
        padding: 8px; border-radius: 4px; border: 1px solid #555;
        background-color: #333; color: #fff;
    }
    input[type="color"] { padding: 0; height: 40px; cursor: pointer; }
`;
const ModalActions = styled.div` display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem; `;


// --- REDUCER (LÓGICA DO ESTADO) ---
const initialTierState = { tiers: [] };

function tierListReducer(state, action) {
    switch (action.type) {
        case 'SET_TIERS':
            return { ...state, tiers: action.payload };

        case 'DRAG_AND_DROP': {
            const { character, originId, targetId } = action.payload;
            if (originId === targetId) return state;

            // Cria uma cópia profunda das tiers para garantir imutabilidade
            const newTiers = state.tiers.map(t => ({
                ...t,
                characters: [...t.characters]
            }));

            // 1. Remove o personagem da origem
            if (originId !== 'pool') {
                const originTier = newTiers.find(t => t.id === originId);
                if (originTier) {
                    originTier.characters = originTier.characters.filter(c => c.id !== character.id);
                }
            }

            // 2. Adiciona o personagem ao destino
            if (targetId !== 'pool') {
                const targetTier = newTiers.find(t => t.id === targetId);
                if (targetTier) {
                    // Evita adicionar duplicatas na mesma tier
                    if (!targetTier.characters.some(c => c.id === character.id)) {
                        targetTier.characters.push(character);
                    }
                }
            }
            
            return { ...state, tiers: newTiers };
        }
        
        case 'ADD_TIER':
            const newTier = { id: Date.now(), title: 'Novo', color: '#cccccc', characters: [] };
            return { ...state, tiers: [...state.tiers, newTier] };
        
        case 'UPDATE_TIER':
            return { ...state, tiers: state.tiers.map(t => t.id === action.payload.id ? action.payload : t) };
        
        case 'REMOVE_TIER':
             return { ...state, tiers: state.tiers.filter(t => t.id !== action.payload.id) };
        
        case 'MOVE_TIER': {
            const { tierId, direction } = action.payload;
            const index = state.tiers.findIndex(t => t.id === tierId);
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= state.tiers.length) return state;
            const newTiers = [...state.tiers];
            [newTiers[index], newTiers[newIndex]] = [newTiers[newIndex], newTiers[index]];
            return { ...state, tiers: newTiers };
        }
        
        case 'RESET_TIERS':
            return { ...state, tiers: state.tiers.map(tier => ({ ...tier, characters: [] })) };
        
        default:
            throw new Error(`Ação desconhecida: ${action.type}`);
    }
}


// --- COMPONENTES AUXILIARES OTIMIZADOS ---
const TierSettingsModal = ({ tier, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(tier.title);
    const [color, setColor] = useState(tier.color);
    const handleSave = () => onSave({ ...tier, title, color });

    return (
        <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <ModalContent initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Editar Tier</ModalTitle>
                <InputGroup> <label>Nome do Tier</label> <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /> </InputGroup>
                <InputGroup> <label>Cor</label> <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /> </InputGroup>
                <ModalActions>
                    <ControlButton onClick={() => onDelete(tier.id)} style={{backgroundColor: '#e74c3c'}} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <FaTrash /> Remover </ControlButton>
                    <ControlButton onClick={handleSave} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Salvar</ControlButton>
                </ModalActions>
            </ModalContent>
        </ModalOverlay>
    );
};
const ArcSelectorModal = ({ arcs, onSelect, onClose }) => (
    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <ModalContent initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Selecione o Arco</ModalTitle>
            <ControlButton onClick={() => onSelect('All')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Todos os Arcos</ControlButton>
            {arcs.map(arc => ( <ControlButton key={arc} onClick={() => onSelect(arc)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{arc}</ControlButton> ))}
        </ModalContent>
    </ModalOverlay>
);
const CharacterItem = React.memo(({ character, originId, onDragStart }) => (
    <CharacterItemStyled
        layoutId={character.id}
        $gender={character.gender}
        title={character.name}
        draggable
        onDragStart={(e) => onDragStart(e, character, originId)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }} >
        <img src={character.imageUrl} alt={character.name} />
        <CharacterTooltip> <h4>{character.name}</h4> <p>Gênero: {character.gender || 'N/A'}</p> </CharacterTooltip>
    </CharacterItemStyled>
));


// --- COMPONENTE PRINCIPAL ---
const TierList = () => {
    const [state, dispatch] = useReducer(tierListReducer, initialTierState);
    const { tiers } = state;
    
    // Estado para todos os personagens vindos do Firebase
    const [allCharacters, setAllCharacters] = useState([]);

    const [mode, setMode] = useState('tier');
    const [loading, setLoading] = useState(true);
    const [dragOverTier, setDragOverTier] = useState(null);
    const [editingTier, setEditingTier] = useState(null);
    const [showSpoilers, setShowSpoilers] = useState(false);
    const [selectedArc, setSelectedArc] = useState('All');
    const [isArcModalOpen, setArcModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    
    const tierListRef = useRef(null);

    const defaultTiers = useMemo(() => ({
        tier: [
            { id: 1, title: 'S', color: '#ff7f7f', characters: [] }, { id: 2, title: 'A', color: '#ffbf7f', characters: [] },
            { id: 3, title: 'B', color: '#ffff7f', characters: [] }, { id: 4, title: 'C', color: '#7fff7f', characters: [] },
            { id: 5, title: 'D', color: '#7fbfff', characters: [] },
        ],
        list: [
            { id: 7, title: 'Especial', color: '#d166d2', characters: [] }, { id: 8, title: 'Grau 1', color: '#6682d2', characters: [] },
            { id: 9, title: 'Grau 2', color: '#66d288', characters: [] },
        ]
    }), []);

    useEffect(() => {
        const q = query(collection(db, 'characters'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const charactersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setAllCharacters(charactersData);
            dispatch({ type: 'SET_TIERS', payload: defaultTiers.tier });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [defaultTiers.tier]);

    // Lógica para calcular o pool de personagens dinamicamente
    const unplacedCharacters = useMemo(() => {
        const placedCharacterIds = new Set(tiers.flatMap(tier => tier.characters.map(c => c.id)));
        return allCharacters.filter(c => !placedCharacterIds.has(c.id));
    }, [tiers, allCharacters]);

    const filteredPool = useMemo(() => {
        return unplacedCharacters.filter(c => 
            (!showSpoilers && c.isSpoiler ? false : true) &&
            (selectedArc !== 'All' ? c.arc === selectedArc : true) &&
            (genderFilter !== 'All' ? c.gender === genderFilter : true) &&
            (searchTerm ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
        ).sort((a,b) => a.name.localeCompare(b.name));
    }, [unplacedCharacters, showSpoilers, selectedArc, genderFilter, searchTerm]);

    const allArcs = useMemo(() => {
        if (allCharacters.length === 0) return [];
        const arcsSet = new Set(allCharacters.map(c => c.arc).filter(Boolean));
        return [...arcsSet].sort();
    }, [allCharacters]);

    const handleDragStart = (e, character, originId) => {
        e.dataTransfer.setData('character', JSON.stringify(character));
        e.dataTransfer.setData('originId', originId.toString());
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        setDragOverTier(null);
        const character = JSON.parse(e.dataTransfer.getData('character'));
        const originId = e.dataTransfer.getData('originId') === 'pool' ? 'pool' : Number(e.dataTransfer.getData('originId'));
        const numericTargetId = targetId === 'pool' ? 'pool' : Number(targetId);
        dispatch({ type: 'DRAG_AND_DROP', payload: { character, originId, targetId: numericTargetId } });
    };

    const handleSwitchMode = (newMode) => {
        if (mode === newMode) return;
        setMode(newMode);
        dispatch({ type: 'SET_TIERS', payload: defaultTiers[newMode] });
    };
    
    const handleSaveImage = () => {
        if (tierListRef.current) {
            html2canvas(tierListRef.current, { backgroundColor: '#1a1a2e' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `toaruflix-tierlist-${mode}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    if (loading) return <><Header /><Spinner /></>;

    return (
        <>
            <Header />
            <TierListContainer>
                <ControlsContainer>
                     <ControlGroup>
                        <ModeButton onClick={() => handleSwitchMode('tier')} $active={mode === 'tier'}><FaThList /> Tier List</ModeButton>
                        <ModeButton onClick={() => handleSwitchMode('list')} $active={mode === 'list'}><FaList /> Modo Lista</ModeButton>
                    </ControlGroup>
                    <ControlGroup>
                        <label><input type="checkbox" checked={showSpoilers} onChange={(e) => setShowSpoilers(e.target.checked)} /> Mostrar Spoilers</label>
                        <ControlButton onClick={() => setArcModalOpen(true)}>Info/Arcos</ControlButton>
                        <ControlButton onClick={() => dispatch({ type: 'ADD_TIER' })}><FaPlus /> Add Tier</ControlButton>
                        <ControlButton onClick={() => dispatch({ type: 'RESET_TIERS' })} style={{backgroundColor: '#f39c12'}}><FaUndo /> Limpar</ControlButton>
                        <ControlButton onClick={handleSaveImage} style={{backgroundColor: '#16a085'}}><FaImage /> Salvar</ControlButton>
                    </ControlGroup>
                </ControlsContainer>
                
                <div ref={tierListRef}>
                    <AnimatePresence>
                        {tiers.map((tier, index) => (
                            <TierRowContainer key={tier.id} layout>
                                <TierLabel color={tier.color}>{tier.title}</TierLabel>
                                <DropZone
                                    onDrop={(e) => handleDrop(e, tier.id)}
                                    onDragOver={(e) => { e.preventDefault(); setDragOverTier(tier.id); }}
                                    onDragLeave={() => setDragOverTier(null)}
                                    $isOver={dragOverTier === tier.id}
                                >
                                    <AnimatePresence>
                                        {tier.characters.map(char => <CharacterItem key={char.id} character={char} originId={tier.id} onDragStart={handleDragStart} />)}
                                    </AnimatePresence>
                                </DropZone>
                                <TierActions className="tier-actions">
                                    <button onClick={() => setEditingTier(tier)}><FaCog /></button>
                                    <button onClick={() => dispatch({ type: 'MOVE_TIER', payload: { tierId: tier.id, direction: -1 }})} disabled={index === 0}><FaArrowUp /></button>
                                    <button onClick={() => dispatch({ type: 'MOVE_TIER', payload: { tierId: tier.id, direction: 1 }})} disabled={index === tiers.length - 1}><FaArrowDown /></button>
                                </TierActions>
                            </TierRowContainer>
                        ))}
                    </AnimatePresence>
                </div>

                <CharacterPoolContainer>
                    <h3>Personagens Disponíveis ({filteredPool.length})</h3>
                     <ControlGroup style={{ marginBottom: '1rem' }}>
                        <SearchInput type="text" placeholder="Buscar personagem..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <FilterButtonGroup>
                            <FilterButton onClick={() => setGenderFilter('All')} $active={genderFilter === 'All'}>Todos</FilterButton>
                            <FilterButton onClick={() => setGenderFilter('Masculino')} $active={genderFilter === 'Masculino'}>Masculino</FilterButton>
                            <FilterButton onClick={() => setGenderFilter('Feminino')} $active={genderFilter === 'Feminino'}>Feminino</FilterButton>
                        </FilterButtonGroup>
                    </ControlGroup>
                    <CharacterPool
                        onDrop={(e) => handleDrop(e, 'pool')}
                        onDragOver={(e) => { e.preventDefault(); setDragOverTier('pool'); }}
                        onDragLeave={() => setDragOverTier(null)}
                        $isOver={dragOverTier === 'pool'}
                    >
                        <AnimatePresence>
                           {filteredPool.map(char => <CharacterItem key={char.id} character={char} originId={'pool'} onDragStart={handleDragStart} />)}
                        </AnimatePresence>
                    </CharacterPool>
                </CharacterPoolContainer>
            </TierListContainer>

            <AnimatePresence>
                {editingTier && (
                    <TierSettingsModal 
                        tier={editingTier}
                        onSave={(updatedTier) => { dispatch({ type: 'UPDATE_TIER', payload: updatedTier }); setEditingTier(null); }}
                        onDelete={(tierId) => { dispatch({ type: 'REMOVE_TIER', payload: { id: tierId } }); setEditingTier(null); }}
                        onClose={() => setEditingTier(null)}
                    />
                )}
                {isArcModalOpen && (
                    <ArcSelectorModal 
                        arcs={allArcs}
                        onSelect={(arc) => { setSelectedArc(arc); setArcModalOpen(false); }}
                        onClose={() => setArcModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default TierList;