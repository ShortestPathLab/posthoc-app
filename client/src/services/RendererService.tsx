import { useSnackbar } from "components/generic/Snackbar";
import renderers from "internal-renderers";
import { Dictionary, map } from "lodash";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";
import { RendererDefinition } from "renderer";
import { useConnections } from "slices/connections";
import { Renderer, useRenderers } from "slices/renderers";
import { useSettings } from "slices/settings";
import url from "url-parse";

type RendererTransportOptions = { url: string };

interface RendererTransport {
  get(): Promise<RendererDefinition<any, any, any>>;
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

export const transports: Dictionary<RendererTransportEntry> = {
  native: {
    name: "Internal",
    constructor: NativeRendererTransport,
  },
};

export function RendererService() {
  const notify = useSnackbar();
  const [{ renderer }] = useSettings();
  const [, setRenderers] = useRenderers();

  useAsync(async () => {
    const rs: Renderer[] = [];
    for (const { transport, url, key } of renderer ?? []) {
      const t = new transports[transport].constructor({ url });
      rs.push({
        key,
        url,
        renderer: await t.get(),
      });
    }
    setRenderers(rs);
  }, [renderer, setRenderers, notify]);

  return <></>;
}
