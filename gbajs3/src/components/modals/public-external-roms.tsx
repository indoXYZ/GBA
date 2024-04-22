import { Button } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { BiError } from 'react-icons/bi';
import { PacmanLoader } from 'react-spinners';
import { styled, useTheme } from 'styled-components';

import { ModalBody } from './modal-body.tsx';
import { ModalFooter } from './modal-footer.tsx';
import { ModalHeader } from './modal-header.tsx';
import { useEmulatorContext, useModalContext } from '../../hooks/context.tsx';
import { useLoadExternalRom } from '../../hooks/use-load-external-rom.tsx';
import { EmbeddedProductTour } from '../product-tour/embedded-product-tour.tsx';
import { ErrorWithIcon } from '../shared/error-with-icon.tsx';
import { CenteredTextContainer, TextBreakWord } from '../shared/styled.tsx';
import { URLDisplay } from '../shared/url-display.tsx';

import type { TourSteps } from '../product-tour/embedded-product-tour.tsx';

export type HasLoadedPublicRoms = {
  [url: string]: string;
};

type UploadPublicExternalRomsModalProps = {
  url: URL;
  raw: string;
};

type RomLoadingIndicatorProps = {
  isLoading: boolean;
  currentRomURL: string | null;
  children: ReactNode;
  indicator: ReactNode;
};

const loadedPublicRomsLocalStorageKey = 'hasLoadedPublicExternalRoms';

const RomLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  align-items: center;
  margin-bottom: 15px;
`;

const RomLoadingIndicator = ({
  isLoading,
  currentRomURL,
  children,
  indicator
}: RomLoadingIndicatorProps) => {
  return isLoading && currentRomURL ? (
    <RomLoadingContainer>
      <TextBreakWord>
        Loading rom from url:
        <br />
      </TextBreakWord>
      <URLDisplay url={new URL(currentRomURL)} />
      {indicator}
    </RomLoadingContainer>
  ) : (
    children
  );
};

export const UploadPublicExternalRomsModal = ({
  url,
  raw
}: UploadPublicExternalRomsModalProps) => {
  const theme = useTheme();
  const { setIsModalOpen } = useModalContext();
  const { emulator } = useEmulatorContext();
  const [hasCompletedUpload, setHasCompletedUpload] = useState(false);
  const [currentRomURL, setCurrentRomURL] = useState<string | null>(null);
  const [, setHasLoadedPublicRoms] = useLocalStorage<
    { [url: string]: string } | undefined
  >(loadedPublicRomsLocalStorageKey);
  const uploadRomButtonId = useId();

  const {
    data: externalRomFile,
    isLoading: isExternalRomLoading,
    error: externalRomLoadError,
    execute: executeLoadExternalRom
  } = useLoadExternalRom();

  useEffect(() => {
    if (!isExternalRomLoading && externalRomFile && currentRomURL) {
      const runCallback = () => {
        const hasSucceeded = emulator?.run(
          emulator.filePaths().gamePath + '/' + externalRomFile.name
        );
        if (hasSucceeded) {
          setHasLoadedPublicRoms((prevState) => ({
            ...prevState,
            [raw]: 'loaded'
          }));
          setIsModalOpen(false);
        }
      };
      emulator?.uploadRom(externalRomFile, runCallback);
      setCurrentRomURL(null);
      setHasCompletedUpload(true);
    }
  }, [
    url,
    raw,
    currentRomURL,
    emulator,
    externalRomFile,
    isExternalRomLoading,
    setHasLoadedPublicRoms,
    setIsModalOpen
  ]);

  const tourSteps: TourSteps = [
    {
      content: (
        <>
          <p>A public rom URL has been shared with you.</p>
          <p>You can load it using the upload button!</p>
        </>
      ),
      target: `#${CSS.escape(uploadRomButtonId)}`
    }
  ];

  return (
    <>
      <ModalHeader title="Upload Public Rom" />
      <ModalBody>
        <RomLoadingIndicator
          isLoading={isExternalRomLoading}
          currentRomURL={currentRomURL}
          indicator={
            <PacmanLoader
              color={theme.gbaThemeBlue}
              cssOverride={{ margin: '0 auto' }}
            />
          }
        >
          {!hasCompletedUpload && (
            <p>Do you want to load a rom from the following URL?</p>
          )}
          <URLDisplay url={url} />
          {!!externalRomLoadError && (
            <ErrorWithIcon
              icon={<BiError style={{ color: theme.errorRed }} />}
              text="Loading rom from URL has failed"
            />
          )}
          {hasCompletedUpload && (
            <CenteredTextContainer>
              <p>Upload complete!</p>
            </CenteredTextContainer>
          )}
        </RomLoadingIndicator>
      </ModalBody>
      <ModalFooter>
        <Button
          id={uploadRomButtonId}
          onClick={() => {
            setCurrentRomURL(url.href);
            executeLoadExternalRom({ url: url });
          }}
          type="submit"
          variant="contained"
        >
          Upload
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setHasLoadedPublicRoms((prevState) => ({
              ...prevState,
              [raw]: 'skipped'
            }));
            setIsModalOpen(false);
          }}
        >
          Close
        </Button>
      </ModalFooter>
      <EmbeddedProductTour
        skipRenderCondition={isExternalRomLoading}
        steps={tourSteps}
        completedProductTourStepName="hasCompletedUploadPublicExternalRomTour"
      />
    </>
  );
};
