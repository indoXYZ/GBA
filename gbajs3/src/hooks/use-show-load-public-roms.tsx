import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect } from 'react';
import {
  PromptLocalStorageKey,
  useShouldShowPrompt
} from 'react-ios-pwa-prompt-ts';

import { useModalContext } from './context.tsx';
import { UploadPublicExternalRomsModal } from '../components/modals/public-external-roms.tsx';
import { productTourLocalStorageKey } from '../components/product-tour/consts.tsx';

import type { CompletedProductTourSteps } from '../components/product-tour/product-tour-intro.tsx';

export type HasLoadedPublicRoms = {
  [url: string]: string;
};

const loadedPublicRomsLocalStorageKey = 'hasLoadedPublicExternalRoms';

export const useShowLoadPublicRoms = () => {
  const { setModalContent, setIsModalOpen, isModalOpen } = useModalContext();
  const [hasLoadedPublicRoms, setHasLoadedPublicRoms] = useLocalStorage<
    HasLoadedPublicRoms | undefined
  >(loadedPublicRomsLocalStorageKey);
  const [hasCompletedProductTourSteps] = useLocalStorage<
    CompletedProductTourSteps | undefined
  >(productTourLocalStorageKey);
  const { iosPwaPrompt, shouldShowPrompt } = useShouldShowPrompt({
    promptLocalStorageKey: PromptLocalStorageKey,
    withOutDefaults: true
  });

  const params = new URLSearchParams(window?.location?.search);
  const romURL = params.get('romURL');

  const shouldShowPublicRomModal =
    romURL &&
    !hasLoadedPublicRoms?.[romURL] &&
    hasCompletedProductTourSteps?.hasCompletedProductTourIntro &&
    iosPwaPrompt && // ensure install prompt has come first
    !shouldShowPrompt &&
    !isModalOpen;

  useEffect(() => {
    if (shouldShowPublicRomModal) {
      try {
        const url = new URL(romURL);

        const storeResult = (statusMsg: string) => {
          setHasLoadedPublicRoms((prevState) => ({
            ...prevState,
            [romURL]: statusMsg
          }));
        };

        setModalContent(
          <UploadPublicExternalRomsModal
            url={url}
            onLoadOrDismiss={storeResult}
          />
        );
        setIsModalOpen(true);
      } catch (e) {
        console.error('public rom url is invalid', e);
        setHasLoadedPublicRoms((prevState) => ({
          ...prevState,
          [romURL]: 'error'
        }));
      }
    }
  }, [
    romURL,
    shouldShowPublicRomModal,
    setIsModalOpen,
    setModalContent,
    setHasLoadedPublicRoms
  ]);
};
