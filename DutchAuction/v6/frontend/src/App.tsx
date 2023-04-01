import { ReactElement } from 'react';
import styled from 'styled-components';
import { ActivateDeactivate } from './components/ActivateDeactivate';
import { Deploy } from './components/Deploy';
import { Greeter } from './components/Greeter';
import { SectionDivider } from './components/SectionDivider';
import { WalletStatus } from './components/WalletStatus';

const StyledAppDiv = styled.div`
  display: grid;
  grid-gap: 20px;
`;

export function App(): ReactElement {
  return (
    <StyledAppDiv>
      <ActivateDeactivate />
      <SectionDivider />
      <WalletStatus />
      <SectionDivider />
      <Deploy />
      <SectionDivider />
      <Greeter />
    </StyledAppDiv>
  );
}
