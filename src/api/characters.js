// ARQUIVO: src/api/characters.js

// Exemplo de como seus dados de personagens devem ser estruturados
export const characters = [
    {
        id: '1',
        name: 'Kamijou Touma',
        image: 'https://placehold.co/100x100/ff0000/FFFFFF/png', // Substitua pela URL real
        arc: 'Index',
        isSpoiler: false,
    },
    {
        id: '2',
        name: 'Misaka Mikoto',
        image: 'https://placehold.co/100x100/00ff00/FFFFFF/png', // Substitua pela URL real
        arc: 'Railgun',
        isSpoiler: false,
    },
    {
        id: '3',
        name: 'Accelerator',
        image: 'https://placehold.co/100x100/0000ff/FFFFFF/png', // Substitua pela URL real
        arc: 'Accelerator',
        isSpoiler: false,
    },
    {
        id: '4',
        name: 'Othinus',
        image: 'https://placehold.co/100x100/ffff00/000000/png', // Substitua pela URL real
        arc: 'New Testament',
        isSpoiler: true, // Personagem de spoiler
    },
    // ... adicione todos os outros personagens aqui
];

// !! ADICIONE ESTA PARTE NO FINAL DO ARQUIVO !!
// Lista de todos os arcos disponíveis para o filtro
export const allArcs = [
    'Index',
    'Railgun',
    'Accelerator',
    'New Testament',
    // ... adicione todos os outros arcos que você usar
];