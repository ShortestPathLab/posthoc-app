import { AccountTreeOutlined } from "@mui-symbols-material/w400";
import { Box, useTheme } from "@mui/material";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { Block } from "components/generic/Block";
import { LayerPicker } from "components/generic/LayerPicker";
import { Spinner } from "components/generic/Spinner";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { MultiDirectedGraph } from "graphology";
import { inferLayerName } from "layers/inferLayerName";
import { isEmpty } from "lodash-es";
import { Size } from "protocol";
import { useState } from "react";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { useLayerPicker, WithLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { set } from "utils/set";
import { PageContentProps } from "../PageMeta";
import { GraphEvents } from "./GraphEvents";
import { layoutModes, ScatterPlotControls } from "./ScatterPlotControls";
import { ScatterPlotGraph } from "./ScatterPlotGraph";
import { SharedGraphProps } from "./SharedGraphProps";
import { TreeGraph } from "./TreeGraph";
import { isTreeLayer, TreeLayer } from "./TreeLayer";
import { useTreeLayout } from "./TreeLayoutWorker";
import { TreeMenu } from "./TreeMenu";
import { useGraphSettings } from "./useGraphSettings";
import { useSelection } from "./useSelection";
import { useTreeOptions } from "./useTreeOptions";
import { useTreePageState } from "./useTreePageState";

type TreePageContext = PanelState;

export function TreePage({ template: Page }: PageContentProps) {
  const theme = useTheme();

  // ─── Layer Data ──────────────────────────────────────────────────────

  const { key, setKey } = useLayerPicker(isTreeLayer);
  const one = slice.layers.one<TreeLayer>(key);
  const { trace, step } = useTreePageState(key);

  // ─── Options ─────────────────────────────────────────────────────────

  const options = useTreeOptions(key);
  const {
    mode,
    isLoading: isOptionsLoading,
    trackedProperty,
    logAxis,
    axis,
    typeFilter,
  } = options;
  // ─── Playback ────────────────────────────────────────────────────────

  const throttled = useThrottle(step ?? 0, 1000 / 24);

  // ─── Panel Data ──────────────────────────────────────────────────────

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<TreePageContext>();
  const size = useSurfaceAvailableCssSize();

  const { point, selected, selection, setSelection } = useSelection(
    throttled,
    trace?.content,
  );

  // ─────────────────────────────────────────────────────────────────────

  const [menuOpen, setMenuOpen] = useState(false);

  const { data: tree, isLoading: isTreeLoading } = useTreeLayout({
    trace: trace?.content,
    mode: mode === "plot" ? "tree" : mode,
    key: trace?.key,
  });

  const isLoading = isTreeLoading || isOptionsLoading;

  const graphSettings = useGraphSettings();

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>tree</Page.Key>
      <Page.Title>Tree</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Block sx={size}>
          {trace ? (
            <>
              {
                <>
                  <AutoSize>
                    {(size: Size) => {
                      const sharedProps: SharedGraphProps = {
                        ...size,
                        trace: trace?.content,
                        traceKey: trace?.key,
                        trackedProperty,
                        step: throttled,
                        layer: key,
                        showAllEdges: layoutModes[mode].showAllEdges,
                        onExit: () => {
                          const layer = one.get();
                          if (!isEmpty(layer?.source?.highlighting)) {
                            one.set((l) => set(l, "source.highlighting", {}));
                          }
                        },
                      };
                      return (
                        <>
                          {isLoading ? (
                            <Box sx={size}>
                              <Spinner message="Generating layout" />
                            </Box>
                          ) : tree?.length ? (
                            <SigmaContainer
                              style={{
                                ...size,
                                background: theme.palette.background.paper,
                              }}
                              graph={MultiDirectedGraph}
                              settings={graphSettings}
                            >
                              {mode !== "plot" ? (
                                <>
                                  <TreeGraph {...sharedProps} tree={tree} />
                                </>
                              ) : (
                                <>
                                  <ScatterPlotGraph
                                    {...sharedProps}
                                    logAxis={logAxis}
                                    eventTypeFilter={typeFilter}
                                    xMetric={axis.xMetric}
                                    yMetric={axis.yMetric}
                                  />
                                </>
                              )}
                              <GraphEvents
                                layerKey={key}
                                onSelection={(e) => {
                                  setSelection(e);
                                  setMenuOpen(true);
                                }}
                              />
                            </SigmaContainer>
                          ) : (
                            <>
                              <WithLayer<TreeLayer> layer={key}>
                                {(l) => (
                                  <Placeholder
                                    icon={<AccountTreeOutlined />}
                                    label="Graph"
                                    secondary={`${inferLayerName(l)} is not a graph.`}
                                  />
                                )}
                              </WithLayer>
                            </>
                          )}

                          <ScatterPlotControls {...sharedProps} {...options} />
                        </>
                      );
                    }}
                  </AutoSize>
                  {menuOpen && (
                    <TreeMenu
                      onClose={() => setMenuOpen(false)}
                      anchorReference="anchorPosition"
                      anchorPosition={{
                        left: point.x,
                        top: point.y,
                      }}
                      transformOrigin={{
                        horizontal: "left",
                        vertical: "top",
                      }}
                      open={menuOpen}
                      layer={key}
                      selected={selected}
                      selection={selection}
                    />
                  )}
                </>
              }
            </>
          ) : (
            <Placeholder
              icon={<AccountTreeOutlined />}
              label="Graph"
              secondary="When you load a trace that has tree-like data, you'll see it here as a decision tree."
            />
          )}
        </Block>
      </Page.Content>
      <Page.Options>
        <>
          <LayerPicker onChange={setKey} value={key} guard={isTreeLayer} />
        </>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
