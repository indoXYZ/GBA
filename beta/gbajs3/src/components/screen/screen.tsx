import { useMediaQuery } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { styled, useTheme } from 'styled-components';

import { EmulatorContext } from '../../context/emulator/emulator.tsx';
import { ControlPanelLandscapeCollapsedWidth } from '../controls/control-panel.tsx';
import { NavigationMenuWidth } from '../navigation-menu/navigation-menu.tsx';
import { GripperHandle } from '../shared/gripper-handle.tsx';

type RenderCanvasProps = {
  $pixelated?: boolean;
};

const RenderCanvas = styled.canvas<RenderCanvasProps>`
  background-color: ${({ theme }) => theme.screenLight};
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-crisp-edges;
  width: 100%;
  height: 100%;
  display: block;

  ${({ $pixelated = false }) =>
    $pixelated &&
    `image-rendering: pixelated;
    `}
`;

const ScreenWrapper = styled(Rnd)`
  border: solid 1px black;
  overflow: visible;
  width: 100dvw;

  @media ${({ theme }) => theme.isLargerThanPhone} {
    width: calc(100dvw - ${NavigationMenuWidth + 25}px);
  }

  @media ${({ theme }) => theme.isMobileLandscape} {
    width: auto;
    height: 100dvh;
  }

  @media ${({ theme }) => theme.isShortMobileLandscape} {
    height: auto;
    width: calc(100dvw - ${ControlPanelLandscapeCollapsedWidth}px);
  }
`;

export const Screen = () => {
  const theme = useTheme();
  const [hasDraggedOrResized, setHasDraggedOrResized] = useState(false);
  const isLargerThanPhone = useMediaQuery(theme.isLargerThanPhone);
  const isMobileLandscape = useMediaQuery(theme.isMobileLandscape);
  const screenWrapperRef = useRef<Rnd>(null);
  const canvasRef = useRef(null);
  const { setCanvas, areItemsDraggable, areItemsResizable } =
    useContext(EmulatorContext);
  const screenWrapperXStart = isMobileLandscape
    ? ControlPanelLandscapeCollapsedWidth
    : isLargerThanPhone
    ? NavigationMenuWidth + 10
    : 0;
  const screenWrapperYStart = isLargerThanPhone && !isMobileLandscape ? 15 : 0;

  useEffect(() => {
    if (screenWrapperRef.current && !hasDraggedOrResized) {
      screenWrapperRef.current.updatePosition({
        x: screenWrapperXStart,
        y: screenWrapperYStart
      });
    }
  }, [hasDraggedOrResized, screenWrapperXStart, screenWrapperYStart]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }
  }, [canvasRef, setCanvas]);

  return (
    <ScreenWrapper
      disableDragging={!areItemsDraggable}
      ref={screenWrapperRef}
      enableResizing={areItemsResizable}
      resizeHandleComponent={{
        topRight: <GripperHandle variation="topRight" />,
        bottomRight: <GripperHandle variation="bottomRight" />,
        bottomLeft: <GripperHandle variation="bottomLeft" />,
        topLeft: <GripperHandle variation="topLeft" />
      }}
      resizeHandleStyles={{
        topRight: { marginTop: '15px', marginRight: '15px' },
        bottomRight: { marginBottom: '15px', marginRight: '15px' },
        bottomLeft: { marginBottom: '15px', marginLeft: '15px' },
        topLeft: { marginTop: '15px', marginLeft: '15px' }
      }}
      default={{
        x: screenWrapperXStart,
        y: screenWrapperYStart,
        width: 'auto',
        height: 'auto'
      }}
      // initial width needs to be controlled from css
      size={{ width: '', height: '' }}
      lockAspectRatio={3 / 2}
      onResizeStart={() => setHasDraggedOrResized(true)}
      onDragStart={() => setHasDraggedOrResized(true)}
    >
      <RenderCanvas
        ref={canvasRef}
        id="screen"
        width="240"
        height="160"
        $pixelated
      />
    </ScreenWrapper>
  );
};
