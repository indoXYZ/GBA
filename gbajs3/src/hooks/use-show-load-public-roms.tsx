import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect } from 'react';
import {
  PromptLocalStorageKey,
  useShouldShowPrompt
} from 'react-ios-pwa-prompt-ts';

import { useModalContext } from './context.tsx';
import {
  UploadPublicExternalRomsModal,
  type HasLoadedPublicRoms
} from '../components/modals/public-external-roms.tsx';
import { productTourLocalStorageKey } from '../components/product-tour/consts.tsx';

import type { CompletedProductTourSteps } from '../components/product-tour/product-tour-intro.tsx';

const loadedPublicRomsLocalStorageKey = 'hasLoadedPublicExternalRoms';

export const useShowLoadPublicRoms = () => {
  const { setModalContent, setIsModalOpen } = useModalContext();
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

  useEffect(() => {
    if (
      romURL &&
      !hasLoadedPublicRoms?.[romURL] &&
      hasCompletedProductTourSteps?.hasCompletedProductTourIntro &&
      iosPwaPrompt && // ensure install prompt has come first
      !shouldShowPrompt
    ) {
      try {
        const url = new URL(romURL);

        setModalContent(
          <UploadPublicExternalRomsModal url={url} raw={romURL} />
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
    hasLoadedPublicRoms,
    setIsModalOpen,
    setModalContent,
    hasCompletedProductTourSteps?.hasCompletedProductTourIntro,
    setHasLoadedPublicRoms,
    shouldShowPrompt,
    iosPwaPrompt
  ]);
};
