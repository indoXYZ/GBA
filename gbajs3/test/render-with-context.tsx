import { render, renderHook } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import { AuthProvider } from '../src/context/auth/auth.tsx';
import { EmulatorProvider } from '../src/context/emulator/emulator.tsx';
import { LayoutProvider } from '../src/context/layout/layout.tsx';
import { ModalProvider } from '../src/context/modal/modal.tsx';
import { GbaDarkTheme } from '../src/context/theme/theme.tsx';

import type { ReactNode } from 'react';

const context = (children: ReactNode) => (
  <ThemeProvider theme={GbaDarkTheme}>
    <AuthProvider>
      <EmulatorProvider>
        <LayoutProvider>
          <ModalProvider>{children}</ModalProvider>
        </LayoutProvider>
      </EmulatorProvider>
    </AuthProvider>
  </ThemeProvider>
);

export const renderWithContext = (testNode: ReactNode) =>
  render(context(testNode));

export const renderHookWithContext = (testHook: () => void) =>
  renderHook(testHook, { wrapper: ({ children }) => context(children) });
