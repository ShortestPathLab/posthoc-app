export type Event = {
  type: string;
  id: number;
  pid?: number;
  g?: number;
  h?: number;
  f?: number;
  [key: string]: any;
}

export type Colours = {
  source: number;
  destination: number;
  expanding: number;
  generating: number;
  closing: number;
  end: number;
}

export type Context = {
  current?: Event | null;
  parent?: Event | null;
  events?: Event[] | null;
  colour?: Colours;
  [key: string]: any;
}

export const Default2DRendererContext: Context = {
  current: null,
  parent: null,
  events: null,
  colour: {
    source: 0x26a69a,
    destination: 0xf06292,
    expanding: 0xff5722,
    generating: 0xffeb3b,
    closing: 0xb0bec5,
    end: 0xec407a,
  },
  scale: 15,
  fill: 0x000000,
  alpha: 1,
}

export type Component = {
  $: string;
  [key:string]: any;
}

export type Components = { 
  [K: string]: Component[]
}

export type Views = {
  main: Component[];
  [K: string]: Component[]
}

export type Render = {
  context?: Context;
  components?: Components;
  views: Views;
}

export type SearchTrace = {
  context: object | null;
  render: Render;
  eventList: Event[];
}

export type RenderProps = {
  searchTrace: SearchTrace;
}