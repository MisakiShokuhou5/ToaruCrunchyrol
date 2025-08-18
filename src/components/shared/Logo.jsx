// ----------------------------------------------------------------
// ARQUIVO: src/components/shared/Logo.jsx
// ----------------------------------------------------------------
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const LogoWrapper = styled(Link)`
    color: #8a2be2; /* BlueViolet */
    font-size: 2rem;
    font-weight: bold;
    text-decoration: none;
    text-shadow: 0 0 5px rgba(138, 43, 226, 0.7);
`;

const Logo = () => {
    return <LogoWrapper to="/browse">ToaruFlix</LogoWrapper>;
};

export default Logo;
