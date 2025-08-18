// ----------------------------------------------------------------
// ARQUIVO CORRIGIDO: src/components/Footer.jsx
// O erro era que o componente se chamava FooterComponent, mas era importado como Footer.
// Renomeei para Footer e adicionei a exportação que faltava.
// ----------------------------------------------------------------
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
    color: #808080;
    padding: 2rem 4rem;
    margin-top: 5rem;
    border-top: 1px solid #222;
    text-align: center;
`;

const Footer = () => {
    return (
        <FooterContainer>
            <p>ToaruFlix.</p>
            <p>&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
        </FooterContainer>
    );
};

export default Footer;