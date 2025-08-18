import React, { useState, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import { db } from '../firebase/config'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 

import Header from '../components/Header';
import Spinner from '../components/shared/Spinner';
import { FaCog, FaTrash, FaArrowUp, FaArrowDown, FaUndo } from 'react-icons/fa';

// --- STYLED COMPONENTS (sem alterações) ---
const TierListContainer = styled.div`
    padding-top: 80px;
    background-color: #121212;
    color: #fff;
    padding-bottom: 2rem;
    min-height: 100vh;
`;
const ControlsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 4rem;
    flex-wrap: wrap;
    gap: 1rem;
`;
const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;
const ControlButton = styled.button`
    background-color: #8a2be2;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { background-color: #7a1dd1; }
`;
const ModeButton = styled(ControlButton)`
    background-color: ${props => props.$active ? '#7a1dd1' : '#555'};
`;
const SpoilerCheckbox = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
`;
const TierRow = styled.div`
    display: flex;
    align-items: stretch;
    min-height: 120px;
    background-color: #222;
    margin: 4px 4rem;
    border: 1px solid #333;
`;
const TierLabel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    background-color: ${props => props.color || '#333'};
    font-size: 2rem;
    font-weight: bold;
    position: relative;
    flex-shrink: 0;
`;
const DropZone = styled.div`
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    background-color: ${props => props.$isOver ? 'rgba(138, 43, 226, 0.3)' : 'transparent'};
    transition: background-color 0.2s;
`;
const TierActions = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #1a1a1a;
    padding: 0 10px;
    flex-shrink: 0;
    button {
        background: none; border: none; color: #aaa;
        cursor: pointer; font-size: 1.2rem; padding: 8px;
        &:hover { color: #fff; }
        &:disabled { color: #444; cursor: not-allowed; }
    }
`;
const CharacterPoolContainer = styled.div`
    padding: 2rem 4rem;
`;
const PoolFiltersContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: center;
`;
const SearchInput = styled.input`
    padding: 10px;
    background-color: #1e1e3f;
    border: 1px solid rgba(138, 43, 226, 0.5);
    color: #fff;
    border-radius: 5px;
    font-size: 1rem;
    flex-grow: 1;
    min-width: 200px;
`;
const FilterButton = styled.button`
    padding: 10px 15px;
    border-radius: 5px;
    border: 1px solid ${props => props.$active ? '#8a2be2' : '#555'};
    background-color: ${props => props.$active ? '#8a2be2' : '#1e1e3f'};
    color: #fff;
    cursor: pointer;
    font-weight: bold;
`;
const CharacterPool = styled(DropZone)`
    min-height: 150px;
    background-color: #181818;
    border-radius: 4px;
`;
const CharacterItem = styled.div`
    width: 100px;
    height: 100px;
    margin: 5px;
    cursor: grab;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    border: 3px solid ${props => props.gender === 'Feminino' ? '#e91e63' : (props.gender === 'Masculino' ? '#2196f3' : 'transparent')};
    
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
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 8px;
    text-align: left;
    transition: opacity 0.2s, visibility 0.2s;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    h4 { margin: 0 0 4px 0; font-size: 12px; font-weight: bold; }
    p { margin: 0; font-size: 10px; color: #ccc; }
`;
const ModalOverlay = styled.div`
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
`;
const ModalContent = styled.div`
    background-color: #2a2a2a; padding: 2rem;
    border-radius: 8px; display: flex;
    flex-direction: column; gap: 1rem; min-width: 300px;
`;
const ModalTitle = styled.h2`
    margin: 0; text-align: center;
`;
const InputGroup = styled.div`
    display: flex; flex-direction: column; gap: 0.5rem;
    label { font-weight: bold; }
    input {
        padding: 8px; border-radius: 4px; border: 1px solid #555;
        background-color: #333; color: #fff;
    }
    input[type="color"] { padding: 0; height: 40px; }
`;
const ModalActions = styled.div`
    display: flex; justify-content: space-between; gap: 1rem;
`;

// --- COMPONENTES AUXILIARES ---
const TierSettingsModal = ({ tier, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(tier.title);
    const [color, setColor] = useState(tier.color);
    const handleSave = () => onSave({ ...tier, title, color });
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Editar Tier</ModalTitle>
                <InputGroup>
                    <label>Nome do Tier</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </InputGroup>
                <InputGroup>
                    <label>Cor</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </InputGroup>
                <ModalActions>
                    <ControlButton onClick={() => onDelete(tier.id)} style={{backgroundColor: '#e74c3c'}}>
                        <FaTrash /> Remover
                    </ControlButton>
                    <ControlButton onClick={handleSave}>Salvar</ControlButton>
                </ModalActions>
            </ModalContent>
        </ModalOverlay>
    );
};
const ArcSelectorModal = ({ arcs, onSelect, onClose }) => (
    <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Selecione o Arco</ModalTitle>
            <ControlButton onClick={() => onSelect('All')}>Todos os Arcos</ControlButton>
            {arcs.map(arc => (
                 <ControlButton key={arc} onClick={() => onSelect(arc)}>{arc}</ControlButton>
            ))}
        </ModalContent>
    </ModalOverlay>
);

// --- COMPONENTE PRINCIPAL ---
const TierList = () => {
    const [mode, setMode] = useState('tier');
    const [tiers, setTiers] = useState([]);
    const [pool, setPool] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [dragOverTier, setDragOverTier] = useState(null);
    const tierListRef = useRef(null);
    const [editingTier, setEditingTier] = useState(null);
    const [showSpoilers, setShowSpoilers] = useState(false);
    const [selectedArc, setSelectedArc] = useState('All');
    const [isArcModalOpen, setArcModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');

    const defaultTiers = useMemo(() => ({
        tier: [
            { id: 1, title: 'S', color: '#ff7f7f', characters: [] },
            { id: 2, title: 'A', color: '#ffbf7f', characters: [] },
            { id: 3, title: 'B', color: '#ffff7f', characters: [] },
            { id: 4, title: 'C', color: '#7fff7f', characters: [] },
            { id: 5, title: 'D', color: '#7fbfff', characters: [] },
        ],
        list: [
            { id: 7, title: 'Especial', color: '#d166d2', characters: [] },
            { id: 8, title: 'Grau 1', color: '#6682d2', characters: [] },
            { id: 9, title: 'Grau 2', color: '#66d288', characters: [] },
        ]
    }), []);
    
    useEffect(() => {
        setTiers(defaultTiers.tier);
    }, [defaultTiers]);

    useEffect(() => {
        const charactersCollectionRef = collection(db, 'characters');
        const q = query(charactersCollectionRef, orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const charactersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setPool(charactersData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const allArcs = useMemo(() => {
        if (pool.length === 0) return [];
        const arcsSet = new Set(pool.map(character => character.arc).filter(Boolean));
        return [...arcsSet].sort();
    }, [pool]);

    const handleDragStart = (e, character, originId) => {
        e.dataTransfer.setData('characterId', character.id.toString());
        e.dataTransfer.setData('originId', originId.toString());
    };

    const handleDragOver = (e, tierId) => {
        e.preventDefault();
        if (dragOverTier !== tierId) {
            setDragOverTier(tierId);
        }
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        setDragOverTier(null);
        const characterId = e.dataTransfer.getData('characterId');
        const originIdStr = e.dataTransfer.getData('originId');
        if (!characterId || !originIdStr || originIdStr === String(targetId)) return;

        const isOriginPool = originIdStr === 'pool';
        const originTier = isOriginPool ? null : tiers.find(t => String(t.id) === originIdStr);

        const characterToMove = isOriginPool 
            ? pool.find(c => c.id === characterId) 
            : originTier?.characters.find(c => c.id === characterId);

        if (!characterToMove) return;

        let newPool = [...pool];
        const newTiers = tiers.map(tier => {
            if (String(tier.id) === originIdStr) {
                return { ...tier, characters: tier.characters.filter(c => c.id !== characterId) };
            }
            return tier;
        });
        
        if (targetId !== 'pool') {
            const targetTierIndex = newTiers.findIndex(t => String(t.id) === String(targetId));
            if (targetTierIndex > -1) {
                newTiers[targetTierIndex].characters.push(characterToMove);
            }
        } else {
             newPool.push(characterToMove);
        }

        if (isOriginPool && targetId !== 'pool') {
            newPool = newPool.filter(c => c.id !== characterId);
        }
        
        setTiers(newTiers);
        setPool(newPool);
    };

    const handleAddTier = () => {
        setTiers([...tiers, { id: Date.now(), title: 'Novo', color: '#cccccc', characters: [] }]);
    };
    
    const handleUpdateTier = (updatedTier) => {
        setTiers(tiers.map(t => t.id === updatedTier.id ? updatedTier : t));
        setEditingTier(null);
    };

    const handleRemoveTier = (tierId) => {
        const tierToRemove = tiers.find(t => t.id === tierId);
        if (tierToRemove?.characters.length > 0) {
            setPool(prevPool => [...prevPool, ...tierToRemove.characters]);
        }
        setTiers(tiers.filter(t => t.id !== tierId));
        setEditingTier(null);
    };
    
    const moveTier = (tierId, direction) => {
        const index = tiers.findIndex(t => t.id === tierId);
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= tiers.length) return;
        const newTiers = [...tiers];
        [newTiers[index], newTiers[newIndex]] = [newTiers[newIndex], newTiers[index]];
        setTiers(newTiers);
    };

    const handleSaveImage = () => {
        if (tierListRef.current) {
            html2canvas(tierListRef.current, { backgroundColor: '#121212' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `toaruflix-tierlist-${mode}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const handleResetTiers = (confirmReset = true) => {
        if (confirmReset && !window.confirm("Isso moverá todos os personagens das tiers de volta para a lista. Deseja continuar?")) {
            return;
        }
        const allCharsFromTiers = tiers.flatMap(tier => tier.characters);
        setPool(prevPool => [...prevPool, ...allCharsFromTiers]);
        setTiers(prevTiers => prevTiers.map(tier => ({ ...tier, characters: [] })));
    };

    const handleSwitchMode = (newMode) => {
        if (mode === newMode) return;
        handleResetTiers(false); 
        setMode(newMode);
        setTiers(defaultTiers[newMode]);
    };

    const filteredPool = useMemo(() => {
        return pool.filter(character => {
            if (!showSpoilers && character.isSpoiler) return false;
            if (selectedArc !== 'All' && character.arc !== selectedArc) return false;
            if (genderFilter !== 'All' && character.gender !== genderFilter) return false;
            if (searchTerm && !character.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });
    }, [pool, showSpoilers, selectedArc, genderFilter, searchTerm]);

    const renderCharacterItem = (char, originId) => (
        <CharacterItem 
            key={char.id} 
            draggable 
            onDragStart={(e) => handleDragStart(e, char, originId)}
            gender={char.gender}
            title={char.name}
        >
            <img src={char.imageUrl} alt={char.name} />
            <CharacterTooltip>
                <h4>{char.name}</h4>
                <p>Gênero: {char.gender || 'N/A'}</p>
                {char.description && <p>{char.description.substring(0, 50)}...</p>}
            </CharacterTooltip>
        </CharacterItem>
    );
    
    if (loading) return <Spinner />;

    return (
        <>
            <Header />
            <TierListContainer>
                <ControlsContainer>
                    <ControlGroup>
                        <ModeButton onClick={() => handleSwitchMode('tier')} $active={mode === 'tier'}>Tier List</ModeButton>
                        <ModeButton onClick={() => handleSwitchMode('list')} $active={mode === 'list'}>Modo Lista</ModeButton>
                    </ControlGroup>
                    <ControlGroup>
                        <SpoilerCheckbox>
                            <input type="checkbox" checked={showSpoilers} onChange={(e) => setShowSpoilers(e.target.checked)} />
                            Mostrar Spoilers
                        </SpoilerCheckbox>
                        <ControlButton onClick={() => setArcModalOpen(true)}>Info/Arcos</ControlButton>
                        <ControlButton onClick={handleAddTier}>+ Adicionar Tier</ControlButton>
                        <ControlButton onClick={() => handleResetTiers(true)} style={{backgroundColor: '#f39c12'}}><FaUndo /> Limpar Tiers</ControlButton>
                        <ControlButton onClick={handleSaveImage} style={{backgroundColor: '#16a085'}}>Salvar Imagem</ControlButton>
                    </ControlGroup>
                </ControlsContainer>
                
                <div ref={tierListRef}>
                    {/* CORRIGIDO: A ordem dos argumentos é (tier, index) */}
                    {tiers.map((tier, index) => (
                        <TierRow key={tier.id}>
                            <TierLabel color={tier.color}>{tier.title}</TierLabel>
                            <DropZone
                                onDrop={(e) => handleDrop(e, tier.id)}
                                onDragOver={(e) => handleDragOver(e, tier.id)}
                                onDragLeave={() => setDragOverTier(null)}
                                $isOver={dragOverTier === tier.id}
                            >
                                {tier.characters.map(char => renderCharacterItem(char, tier.id))}
                            </DropZone>
                            <TierActions>
                                <button onClick={() => setEditingTier(tier)} aria-label="Configurações do Tier"><FaCog /></button>
                                <button onClick={() => moveTier(tier.id, -1)} disabled={index === 0} aria-label="Mover Tier para Cima"><FaArrowUp /></button>
                                <button onClick={() => moveTier(tier.id, 1)} disabled={index === tiers.length - 1} aria-label="Mover Tier para Baixo"><FaArrowDown /></button>
                            </TierActions>
                        </TierRow>
                    ))}
                </div>

                <CharacterPoolContainer>
                    <h3>Personagens Disponíveis ({filteredPool.length} de {pool.length})</h3>
                    <PoolFiltersContainer>
                        <SearchInput 
                            type="text"
                            placeholder="Buscar personagem..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <FilterButton onClick={() => setGenderFilter('All')} $active={genderFilter === 'All'}>Todos</FilterButton>
                        <FilterButton onClick={() => setGenderFilter('Masculino')} $active={genderFilter === 'Masculino'}>Masculino</FilterButton>
                        <FilterButton onClick={() => setGenderFilter('Feminino')} $active={genderFilter === 'Feminino'}>Feminino</FilterButton>
                    </PoolFiltersContainer>

                    <CharacterPool
                        onDrop={(e) => handleDrop(e, 'pool')}
                        onDragOver={(e) => handleDragOver(e, 'pool')}
                        onDragLeave={() => setDragOverTier(null)}
                        $isOver={dragOverTier === 'pool'}
                    >
                        {filteredPool.map(char => renderCharacterItem(char, 'pool'))}
                    </CharacterPool>
                </CharacterPoolContainer>
            </TierListContainer>

            {editingTier && (
                <TierSettingsModal 
                    tier={editingTier}
                    onSave={handleUpdateTier}
                    onDelete={handleRemoveTier}
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
        </>
    );
};

export default TierList;