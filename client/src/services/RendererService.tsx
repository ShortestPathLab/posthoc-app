import renderers from "internal-renderers";
import { useAsync } from "react-async-hook";
import { RendererDefinition, RendererEvents, RendererOptions } from "renderer";
import { slice } from "slices";
import { Renderer, useRenderers } from "slices/renderers";
import url from "url-parse";

type RendererTransportOptions = { url: string };

interface RendererTransport {
  get(): Promise<
    RendererDefinition<RendererOptions, RendererEvents, { $: string }>
  >;
}

export type RendererTransportConstructor = new (
  options: RendererTransportOptions
) => RendererTransport;

type RendererTransportEntry = {
  name: string;
  constructor: RendererTransportConstructor;
};

export class NativeRendererTransport implements RendererTransport {
  constructor(readonly options: RendererTransportOptions) {}
  async get() {
    const { hostname } = url(this.options.url);
    return renderers[hostname];
  }
}

export const transports: Record<string, RendererTransportEntry> = {
  native: {
    name: "Internal",
    constructor: NativeRendererTransport,
  },
};

export function RendererService() {
  const { renderer } = slice.settings.use();
  const [, setRenderers] = useRenderers();

  useAsync(async () => {
    const rs: Renderer[] = [];
    for (const { transport, url, key, disabled } of renderer ?? []) {
      if (!disabled) {
        const t = new transports[transport].constructor({ url });
        rs.push({
          key,
          url,
          renderer: await t.get(),
        });
      }
    }
    setRenderers(() => rs);
  }, [JSON.stringify(renderer), setRenderers]);

  return <></>;
}
