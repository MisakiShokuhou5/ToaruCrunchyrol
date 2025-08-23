// ARQUIVO FINAL: src/pages/LightNovel/index.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Header from '../../components/Header';
import Spinner from '../../components/shared/Spinner';
import LightNovelReader from './LightNovelReader';
import { MainContent, SeriesGrid, SeriesCard, SeriesCover, SeriesTitle } from './styles';

const LightNovel = () => {
    const [novelList, setNovelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReaderOpen, setReaderOpen] = useState(false);
    const [selectedNovel, setSelectedNovel] = useState(null);

    useEffect(() => {
        const novelsRef = collection(db, 'lightnovels');
        const q = query(novelsRef, orderBy('title'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const novelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNovelList(novelsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const openReader = (novel) => {
        setSelectedNovel(novel);
        setReaderOpen(true);
    };

    const closeReader = () => {
        setReaderOpen(false);
        setSelectedNovel(null);
    };
    
    if (loading) {
        return (
            <>
                <Header />
                <MainContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spinner />
                </MainContent>
            </>
        );
    }

    return (
        <>
            <Header />
            <MainContent>
                <SeriesGrid>
                    {novelList.map(novel => (
                        <SeriesCard key={novel.id} onClick={() => openReader(novel)} title={`Ler ${novel.title}`}>
                            <SeriesCover src={novel.imageUrl || 'https://placehold.co/180x250/1e1e1e/fff?text=Capa'} alt={`Capa de ${novel.title}`} />
                            <SeriesTitle>{novel.title}</SeriesTitle>
                        </SeriesCard>
                    ))}
                </SeriesGrid>
            </MainContent>
            {isReaderOpen && <LightNovelReader lightNovel={selectedNovel} onClose={closeReader} />}
        </>
    );
};

export default LightNovel;