import { Button } from '@mui/material';
import { useContext } from 'react';
import { styled } from 'styled-components';

import { ModalBody } from './modal-body.tsx';
import { ModalFooter } from './modal-footer.tsx';
import { ModalHeader } from './modal-header.tsx';
import { EmulatorContext } from '../../context/emulator/emulator.tsx';
import { ModalContext } from '../../context/modal/modal.tsx';

const LoadRomButton = styled.button`
  padding: 0.5rem 1rem;
  width: 100%;
  color: ${({ theme }) => theme.blueCharcoal};
  text-decoration: none;
  background-color: ${({ theme }) => theme.pureWhite};
  border: 1px solid rgba(0, 0, 0, 0.125);
  text-align: left;

  &:hover {
    color: ${({ theme }) => theme.darkGrayBlue};
    background-color: ${({ theme }) => theme.aliceBlue1};
  }
`;

const StyledLi = styled.li`
  cursor: pointer;
`;

const RomList = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;

  & > ${StyledLi}:first-child > ${LoadRomButton} {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  & > ${StyledLi}:last-child > ${LoadRomButton} {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  & > ${StyledLi}:not(:first-child) > ${LoadRomButton} {
    border-top-width: 0;
  }
`;

export const LoadLocalRomModal = () => {
  const { setIsModalOpen } = useContext(ModalContext);
  const { emulator } = useContext(EmulatorContext);
  const ignorePaths = ['.', '..'];
  const localRoms = emulator
    ?.listRoms?.()
    ?.filter((romName) => !ignorePaths.includes(romName));

  return (
    <>
      <ModalHeader title="Load Local Rom" />
      <ModalBody>
        <RomList>
          {localRoms?.map?.((romName: string, idx: number) => (
            <StyledLi key={`${romName}_${idx}`}>
              <LoadRomButton
                onClick={() => {
                  emulator?.run(emulator.filePaths().gamePath + '/' + romName);
                  setIsModalOpen(false);
                }}
              >
                {romName}
              </LoadRomButton>
            </StyledLi>
          ))}
        </RomList>
      </ModalBody>
      <ModalFooter>
        <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
          Close
        </Button>
      </ModalFooter>
    </>
  );
};
