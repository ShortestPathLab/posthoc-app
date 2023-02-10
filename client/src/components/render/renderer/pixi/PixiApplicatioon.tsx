import { AppProvider } from '@inlet/react-pixi';
import { Application } from 'pixi.js';
import React from 'react';

const PIXIapp = new Application();

export type PixiApplicationType = {
  children: React.ReactNode;
}

export function PixiApplication({children}:PixiApplicationType) {
  return (
    <AppProvider value={PIXIapp}>
      {children}
    </AppProvider>
  )
}