import { Box } from "@mui/material";
import { chain as _, entries, identity, merge } from "lodash";
import React, { Reducer, useContext, useReducer } from "react";
import { SplitPane } from "react-multi-split-pane";
import { ResizeMenu } from "./ResizeMenu";

type View = {
  [key: string]: React.ReactNode;
};

export type SplitViewProps = {
  views: View;
  resizable?: boolean;
};

export type ViewportData = {
  x: number;
  y: number;
  scale: number;
};

export type MapData = {
  fitMap: () => void;
};

export type ViewContext = {
  viewport?: ViewportData;
  map?: MapData;
};

// key: viewname
export type SplitViewData = {
  [key: string]: ViewContext;
};

type Payload = {
  view: string;
  payload: ViewContext;
};

type ViewDataReducer = Reducer<SplitViewData, Payload>;

export const SplitViewContext = React.createContext<
  [SplitViewData, (payload: Payload) => void]
>([{}, identity]);

export function useViewContext() {
  return useContext(SplitViewContext);
}

/**
 * Resizable split view component for displaying views side by side
 * - if left and right property all passed in then display split view
 * - if right view is not passed then it will return the left view
 *
 * @param props.left ReactNode placed on the left side of split views
 * @param props.right ReactNode placed on the right side of split views
 * @param props.resizable boolean value if true then the split view will be resizable
 * @returns ReactElement of the split view
 */
export function SplitView({ views, resizable = false }: SplitViewProps) {
  const value = useReducer<ViewDataReducer>(
    (prev, { view, payload }) =>
      _(prev)
        .cloneDeep()
        .merge({ [view]: payload })
        .value(),
    {}
  );
  const [viewData] = value;

  return (
    <SplitViewContext.Provider value={value}>
      <SplitPane split="vertical">
        {entries(views).map(([k, v]) => (
          <Box
            sx={{
              width: "100%",
              height: "100%",
            }}
          >
            <ResizeMenu fitMap={viewData?.[k]?.map?.fitMap} />
            {v}
          </Box>
        ))}
      </SplitPane>
    </SplitViewContext.Provider>
  );
}
