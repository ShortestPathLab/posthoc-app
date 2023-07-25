import { Box, Divider, Fade } from "@mui/material";
import { Scroll } from "components/Scrollbars";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { pages } from "components/pages";
import { values } from "lodash";
import { ReactNode } from "react";
import { withSlots } from "react-slot-component";
import { PanelState } from "slices/UIState";
import { useAcrylic } from "theme";

const divider = (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ m: 1, height: (t) => t.spacing(3), alignSelf: "auto" }}
  />
);

type PageProps = {
  stack?: PanelState;
  renderExtras?: (content?: PanelState) => ReactNode;
  onChange?: (state: PanelState) => void;
  controls?: ReactNode;
  children?: ReactNode;
};

export type SlotExampleComponentProps = {};

// Describe you future slots name with props

export type Slots = {
  Content: {
    children: React.ReactNode;
  };
  Options: {
    children: React.ReactNode;
  };
  Extras: {
    children: React.ReactNode;
  };
};

export const Page = withSlots<Slots, PageProps>(
  ({ slotProps, onChange, stack }) => {
    const acrylic = useAcrylic();
    return (
      <Flex vertical>
        <Flex sx={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
          <Fade in>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "background.default",
              }}
            >
              {slotProps.Content?.children}
            </Box>
          </Fade>
        </Flex>
        <Flex sx={{ height: (t) => t.spacing(6) }}>
          <Flex
            sx={{
              p: 0,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              borderBottom: 1,
              borderColor: "divider",
              alignItems: "center",
              pr: 6,
              ...acrylic,
            }}
          >
            <Scroll x>
              <Flex
                sx={{
                  width: "max-content",
                  height: (t) => t.spacing(6),
                  alignItems: "center",
                  p: 1,
                }}
              >
                <FeaturePicker
                  showArrow
                  label="Page"
                  onChange={(type) =>
                    onChange?.({
                      ...stack,
                      type,
                    })
                  }
                  icon={pages[stack?.type!]?.icon}
                  value={stack?.type}
                  items={values(pages)}
                />
                {slotProps.Options?.children && (
                  <>
                    {divider}
                    {slotProps.Options.children}
                  </>
                )}
              </Flex>
            </Scroll>
          </Flex>
          <Space sx={{ mx: "auto" }} />
          {slotProps.Extras?.children}
        </Flex>
      </Flex>
    );
  }
);
