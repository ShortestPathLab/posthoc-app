import Split from "@devbookhq/splitter";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tabs, Tab } from "@mui/material";

import { head, map } from "lodash";
import { produce } from "produce";
import { ReactNode, createContext, useState } from "react";
import { Leaf, Root, Stack, StackItem } from "slices/UIState";

export function StackView<T>({
  stack,
}: {
  stack?: Stack<T>;
  renderContent?: (content: StackItem<T>) => ReactNode;
}) {
  const { items } = stack ?? {};
  const [value, setValue] = useState(head(stack?.items)?.key);

  return (
    <Box>
      <TabContext value={value!}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={(e, newValue) => {
              setValue(newValue);
            }}
          >
            {map(items, ({ key }, i) => (
              <Tab value={key} label="View" />
            ))}
          </TabList>
        </Box>
        {map(items, ({ key }, i) => (
          <TabPanel value={key}>View {i + 1}</TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}

function ViewControls() {
  return <></>;
}

type ViewTreeProps<T> = {
  root?: Root<T>;
  renderLeaf?: (leaf: Leaf<T>) => ReactNode;
  onChange?: (root: Root<T>) => ReactNode;
};

const ViewTreeContext = createContext<any>(undefined);

export function ViewTree<T>({
  root = { type: "leaf", key: "" },
  renderLeaf,
  onChange,
}: ViewTreeProps<T>) {
  return (
    <ViewTreeContext.Provider value={root}>
      <>
        {root.type === "leaf" ? (
          <Box>
            <ViewControls />
            {renderLeaf?.(root)}
          </Box>
        ) : (
          <Split>
            {map(root.children, (c, i) => (
              <ViewTree
                root={c}
                onChange={(newChild) =>
                  onChange?.(
                    produce(root, (draft) => (draft.children[i] = newChild))
                  )
                }
              />
            ))}
          </Split>
        )}
      </>
    </ViewTreeContext.Provider>
  );
}
