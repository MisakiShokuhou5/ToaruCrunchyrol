
// ----------------------------------------------------------------
// ARQUIVO: src/components/shared/Spinner.jsx
// ----------------------------------------------------------------
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    background-color: #141414;
`;

const StyledSpinner = styled.div`
    border: 5px solid #f3f3f3;
    border-top: 5px solid #8a2be2;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: ${spin} 1.5s linear infinite;
`;

const Spinner = () => (
    <SpinnerWrapper>
        <StyledSpinner />
    </SpinnerWrapper>
);

export default Spinner;
