import {
  AccountTreeOutlined,
  ChevronRightOutlined,
  LayersOutlined as LayersIcon,
  FlipCameraAndroidOutlined as RotateIcon,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Label } from "components/generic/Label";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { inferLayerName } from "layers/inferLayerName";
import { delay, entries, find, findLast, map, set, startCase } from "lodash";
import PopupState, { bindMenu } from "material-ui-popup-state";
import { produce } from "produce";
import { FC, useCallback, useEffect, useState } from "react";
import {
  CustomNodeElementProps,
  TreeProps,
  Tree as _Tree,
} from "react-d3-tree";
import { useCss, useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { useLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { PageContentProps } from "./PageMeta";
import { useTreeMemo } from "./TreeWorker";
import { EventTree } from "./tree.worker";
const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

const Tree = _Tree as unknown as FC<TreeProps>;

type TreePageContext = PanelState;

export function useCache<T>(result: T, loading: boolean = false) {
  const [cache, setCache] = useState<T>();

  useEffect(() => {
    if (!loading) {
      if (result) {
        setCache(result);
      }
    }
  }, [result, loading]);
  return cache;
}

const radius2 = {
  small: {
    value: 0,
    name: "Current",
    description: "Show the current node and its parents",
  },
  medium: {
    value: 4,
    name: "Nearby",
    description: "Show nodes with ≤4 degrees of separation",
  },
  infinite: {
    value: undefined,
    name: "All",
    description: "Show all nodes, may impact performance",
  },
};

const orientationOptions = {
  horizontal: {
    value: "horizontal",
  },
  vertical: {
    value: "vertical",
  },
};

export function TreePage({ template: Page }: PageContentProps) {
  const { palette } = useTheme();

  const { key, setKey, layer, setLayer, layers } = useLayer();

  const throttledStep = useThrottle(layer?.source?.step ?? 0, 600);
  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<TreePageContext>();

  const [radius, setRadius] = useState<keyof typeof radius2>("small");

  const [orientation, setOrientation] =
    useState<keyof typeof orientationOptions>("horizontal");

  const pathCls = useCss({
    "&.rd3t-link": {
      stroke: alpha(palette.text.primary, palette.action.disabledOpacity),
    },
  });

  const { result, loading } = useTreeMemo(
    {
      trace: layer?.source?.trace?.content,
      step: throttledStep,
      radius: radius2[radius].value,
    },
    [throttledStep, layer, radius]
  );

  const cache = useCache(result, loading);

  const pathClassFunc = useCallback(() => pathCls, [pathCls]);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Title>Tree</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex>
          {layer?.source?.trace?.content && cache?.tree ? (
            <AutoSize>
              {({ width, height }) => (
                <Box {...{ width, height }}>
                  <Tree
                    scaleExtent={{ max: 10, min: 0.01 }}
                    orientation={orientation}
                    translate={{ x: width / 2, y: width / 2 }}
                    data={cache.tree}
                    dimensions={{ width, height }}
                    separation={{
                      siblings: 1,
                      nonSiblings: 1,
                    }}
                    pathClassFunc={pathClassFunc}
                    renderCustomNodeElement={({
                      nodeDatum,
                      onNodeClick,
                    }: CustomNodeElementProps) => {
                      return (
                        <Node
                          node={nodeDatum as unknown as EventTree}
                          onClick={() => onNodeClick?.({} as any)}
                          step={layer?.source?.step}
                          onStep={(s) =>
                            setLayer(
                              produce(layer, (l) => {
                                set(l, "source.step", s);
                              })
                            )
                          }
                        />
                      );
                    }}
                  />
                </Box>
              )}
            </AutoSize>
          ) : (
            <Placeholder
              icon={<AccountTreeOutlined />}
              label="Tree"
              secondary="When you load a trace that has tree-like data, you'll see it here as a decision tree."
            />
          )}
        </Flex>
      </Page.Content>{" "}
      <Page.Options>
        <FeaturePicker
          icon={<LayersIcon />}
          label="Layer"
          value={key}
          items={map(layers, (l) => ({
            id: l.key,
            name: inferLayerName(l),
          }))}
          onChange={setKey}
          arrow
          ellipsis={12}
        />
        {divider}
        <FeaturePicker
          icon={<VisibilityOutlined />}
          label="Radius"
          value={radius}
          onChange={(e) => setRadius(e as keyof typeof radius2)}
          items={map(entries(radius2), ([k, v]) => ({
            id: k,
            ...v,
          }))}
          arrow
        />
        {divider}
        <FeaturePicker
          icon={<RotateIcon />}
          label="Orientation"
          value={orientation}
          onChange={(e) => setOrientation(e as keyof typeof orientationOptions)}
          items={entries(orientationOptions).map(([key, value]) => ({
            id: key,
            name: startCase(value.value),
          }))}
          arrow
        />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}

const width = 16;
const height = 4;

function Node({
  onClick,
  node,
  step = 0,
  onStep,
}: {
  onClick?: () => void;
  node?: EventTree;
  step?: number;
  onStep?: (s: number) => void;
}) {
  const { palette, spacing, shape } = useTheme();
  const a = findLast(node?.events, (e) => e.step <= step);
  const isSelected = !!find(node?.events, (e) => e.step === step);
  const color = getColorHex(a?.data?.type);
  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <Tooltip
            title={`f: ${a?.data?.f ?? "unknown"}, g: ${
              a?.data?.g ?? "unknown"
            }`}
          >
            <g
              onClick={(e) => {
                state.open(e);
              }}
            >
              <clipPath id="clipPath">
                <rect
                  y={spacing(-height / 2)}
                  x={spacing(-0.25)}
                  strokeWidth={0}
                  width={spacing(width)}
                  height={spacing(height)}
                  rx={shape.borderRadius}
                />
              </clipPath>
              <rect
                y={spacing(-height / 2)}
                x={spacing(-0.25)}
                strokeWidth={0}
                fill={palette.background.default}
                width={spacing(width)}
                height={spacing(height)}
                clipPath="url(#clipPath)"
              />
              {isSelected && (
                <rect
                  y={spacing(-height / 2)}
                  x={spacing(-0.25)}
                  strokeWidth={0}
                  fill={alpha(
                    palette.primary.main,
                    palette.action.selectedOpacity
                  )}
                  width={spacing(width)}
                  height={spacing(height)}
                  clipPath="url(#clipPath)"
                />
              )}
              <rect
                x={spacing(-0.25)}
                y={spacing(-height / 2)}
                height={spacing(height)}
                width={spacing(0.5)}
                fill={color}
                strokeWidth={0}
                clipPath="url(#clipPath)"
              />
              <text
                strokeWidth={0}
                height={spacing(4)}
                fill={palette.text.primary}
                y={0}
                fontWeight={500}
                fontSize="0.875rem"
                x={spacing(2 - 0.25)}
                alignmentBaseline="central"
              >
                {node?.name}
              </text>
              {!!node?.cumulativeChildCount && (
                <>
                  <text
                    strokeWidth={0}
                    height={spacing(4)}
                    fill={palette.text.secondary}
                    y={0}
                    x={spacing(width - 2.25 - 1)}
                    textAnchor="end"
                    fontWeight={400}
                    fontSize="0.875rem"
                    alignmentBaseline="central"
                  >
                    {node?.cumulativeChildCount}
                  </text>
                  <ChevronRightOutlined
                    width={spacing(2)}
                    height={spacing(2)}
                    x={spacing(width - 2 - 1)}
                    y={spacing(-height / 2 + 1)}
                    strokeWidth={0}
                    fill={palette.text.primary}
                    opacity={palette.action.disabledOpacity}
                  />
                </>
              )}
            </g>
          </Tooltip>
          <Menu
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
            transformOrigin={{
              horizontal: "center",
              vertical: "top",
            }}
            {...bindMenu(state)}
          >
            <MenuList dense sx={{ p: 0 }}>
              {map(node?.events, (e) => (
                <MenuItem
                  selected={e.step === step}
                  sx={{
                    borderLeft: `4px solid ${getColorHex(e.data.type)}`,
                  }}
                  onClick={() => {
                    state.close();
                    onClick?.();
                    delay(() => onStep?.(e.step), 150);
                  }}
                >
                  <Label
                    primary={startCase(e.data.type)}
                    secondary={`Step ${e.step}`}
                  />
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </>
      )}
    </PopupState>
  );
}
