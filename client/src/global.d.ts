declare module "*?worker&url" {
  const src: string;
  export default src;
}

declare interface Navigator {
  windowControlsOverlay: WindowControlsOverlay;
}

declare interface WindowControlsOverlay extends EventTarget {
  visible: boolean;
  getTitlebarAreaRect(): DOMRect;
}

declare interface WindowControlsOverlayGeometryChangeEvent extends Event {
  titlebarAreaRect?: DOMRect;
  visible?: boolean;
}

declare module "nearest-pantone" {
  export function getClosestColor(hex: string): {
    pantone: string;
    name: string;
    hex: string;
  };
}
