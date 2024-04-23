import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UploadPublicExternalRomsModal } from './public-external-roms.tsx';
import { testRomLocation } from '../../../test/mocks/handlers.ts';
import { renderWithContext } from '../../../test/render-with-context.tsx';
import * as contextHooks from '../../hooks/context.tsx';
import { productTourLocalStorageKey } from '../product-tour/consts.tsx';

import type { GBAEmulator } from '../../emulator/mgba/mgba-emulator.tsx';

describe('<UploadPublicExternalRomsModal />', () => {
  it('uploads rom from external url', async () => {
    const onLoadOrDismissSpy = vi.fn();
    const setIsModalOpenSpy = vi.fn();
    const uploadRomSpy: (file: File, cb?: () => void) => void = vi.fn(
      (_file, cb) => cb && cb()
    );
    const emulatorRunSpy: (romPath: string) => boolean = vi.fn(() => true);

    const {
      useEmulatorContext: originalEmulator,
      useModalContext: originalModal
    } = await vi.importActual<typeof contextHooks>('../../hooks/context.tsx');

    vi.spyOn(contextHooks, 'useModalContext').mockImplementation(() => ({
      ...originalModal(),
      setIsModalOpen: setIsModalOpenSpy
    }));

    vi.spyOn(contextHooks, 'useEmulatorContext').mockImplementation(() => ({
      ...originalEmulator(),
      emulator: {
        uploadRom: uploadRomSpy,
        run: emulatorRunSpy,
        filePaths: () => ({
          gamePath: '/games'
        })
      } as GBAEmulator
    }));

    renderWithContext(
      <UploadPublicExternalRomsModal
        url={new URL(`${testRomLocation}/good_rom.gba`)}
        onLoadOrDismiss={onLoadOrDismissSpy}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Upload' }));

    const loadingSpinner = screen.getByText(/Loading rom from url:/);
    expect(loadingSpinner).toBeVisible();

    const romLink = screen.getByRole('link');
    expect(romLink).toBeInTheDocument();
    expect(romLink).toHaveAttribute('href', `${testRomLocation}/good_rom.gba`);

    await waitForElementToBeRemoved(
      screen.queryByText(/Loading rom from url:/)
    );

    expect(uploadRomSpy).toHaveBeenCalledOnce();

    expect(emulatorRunSpy).toHaveBeenCalledOnce();
    expect(emulatorRunSpy).toHaveBeenCalledWith('/games/good_rom.gba');

    expect(onLoadOrDismissSpy).toHaveBeenCalledOnce();
    expect(onLoadOrDismissSpy).toHaveBeenCalledWith('loaded');
    expect(setIsModalOpenSpy).toHaveBeenCalledWith(false);

    expect(await screen.findByText('Upload complete!')).toBeVisible();
  });

  it('renders external rom error', async () => {
    const onLoadOrDismissSpy = vi.fn();
    const uploadRomSpy: (file: File, cb?: () => void) => void = vi.fn(
      (_file, cb) => cb && cb()
    );
    const emulatorRunSpy: (romPath: string) => boolean = vi.fn(() => true);

    const { useEmulatorContext: originalEmulator } = await vi.importActual<
      typeof contextHooks
    >('../../hooks/context.tsx');

    vi.spyOn(contextHooks, 'useEmulatorContext').mockImplementation(() => ({
      ...originalEmulator(),
      emulator: {
        uploadRom: uploadRomSpy,
        run: emulatorRunSpy,
        filePaths: () => ({
          gamePath: '/games'
        })
      } as GBAEmulator
    }));

    renderWithContext(
      <UploadPublicExternalRomsModal
        url={new URL(`${testRomLocation}/bad_rom.gba`)}
        onLoadOrDismiss={onLoadOrDismissSpy}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Upload' }));

    const loadingSpinner = screen.getByText(/Loading rom from url:/);
    expect(loadingSpinner).toBeVisible();

    const romLink = screen.getByRole('link');
    expect(romLink).toBeInTheDocument();
    expect(romLink).toHaveAttribute('href', `${testRomLocation}/bad_rom.gba`);

    await waitForElementToBeRemoved(
      screen.queryByText(/Loading rom from url:/)
    );

    expect(uploadRomSpy).not.toHaveBeenCalled();
    expect(emulatorRunSpy).not.toHaveBeenCalled();

    expect(
      await screen.findByText('Loading rom from URL has failed')
    ).toBeVisible();

    // click the close button
    await userEvent.click(screen.getByText('Close', { selector: 'button' }));

    // if dismissed here, should mark rom as skipped and error
    expect(onLoadOrDismissSpy).toHaveBeenCalledOnce();
    expect(onLoadOrDismissSpy).toHaveBeenCalledWith('skipped-error');
  });

  it('closes modal using the close button', async () => {
    const onLoadOrDismissSpy = vi.fn();
    const setIsModalOpenSpy = vi.fn();
    const { useModalContext: original } = await vi.importActual<
      typeof contextHooks
    >('../../hooks/context.tsx');

    vi.spyOn(contextHooks, 'useModalContext').mockImplementation(() => ({
      ...original(),
      setIsModalOpen: setIsModalOpenSpy
    }));

    renderWithContext(
      <UploadPublicExternalRomsModal
        url={new URL(`${testRomLocation}/good_rom.gba`)}
        onLoadOrDismiss={onLoadOrDismissSpy}
      />
    );

    // click the close button
    const closeButton = screen.getByText('Close', { selector: 'button' });
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);

    // marks rom as skipped
    expect(onLoadOrDismissSpy).toHaveBeenCalledOnce();
    expect(onLoadOrDismissSpy).toHaveBeenCalledWith('skipped');
    expect(setIsModalOpenSpy).toHaveBeenCalledWith(false);
  });

  it('renders tour steps', async () => {
    const { useModalContext: original } = await vi.importActual<
      typeof contextHooks
    >('../../hooks/context.tsx');

    vi.spyOn(contextHooks, 'useModalContext').mockImplementation(() => ({
      ...original(),
      isModalOpen: true
    }));

    localStorage.setItem(
      productTourLocalStorageKey,
      '{"hasCompletedProductTourIntro":"finished"}'
    );

    renderWithContext(
      <UploadPublicExternalRomsModal
        url={new URL(`${testRomLocation}/good_rom.gba`)}
        onLoadOrDismiss={vi.fn}
      />
    );

    expect(
      await screen.findByText('A public rom URL has been shared with you.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('You can load it using the upload button!')
    ).toBeInTheDocument();

    // click joyride floater
    await userEvent.click(
      screen.getByRole('button', { name: 'Open the dialog' })
    );

    expect(
      screen.getByText('A public rom URL has been shared with you.')
    ).toBeVisible();
    expect(
      screen.getByText('You can load it using the upload button!')
    ).toBeVisible();
  });
});
