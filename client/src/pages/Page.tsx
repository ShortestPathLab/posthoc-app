import { ErrorOutlined, WidgetsOutlined } from "@mui-symbols-material/w400";
import { Box, Divider, Stack } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
import { Space } from "components/generic/Space";
import { Placeholder } from "components/inspector/Placeholder";
import { withSlots } from "components/withSlots";
import { values } from "lodash";
import { pages } from "pages";
import React, { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PanelState } from "slices/view";
import { useAcrylic } from "theme";

export const divider = (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ m: 1, height: (t) => t.spacing(3), alignSelf: "auto" }}
  />
);

export type PageProps = {
  stack?: PanelState;
  renderExtras?: (content?: PanelState) => ReactNode;
  onChange?: (state: PanelState) => void;
  controls?: ReactNode;
  children?: ReactNode;
};

export type PageSlots = {
  Key: { children: string };
  Title: {
    children: React.ReactNode;
  };
  Content: {
    children: React.ReactNode;
  };
  Options: {
    children: React.ReactNode;
  };
  Extras: {
    children: React.ReactNode;
  };
  Handle: {
    children: React.ReactNode;
  };
};

export const Page = withSlots<PageSlots, PageProps>(
  ({ slotProps, onChange, stack }) => {
    const acrylic = useAcrylic();
    return (
      <ErrorBoundary
        fallbackRender={(error) => (
          <Stack
            sx={{
              background: (t) => t.palette.background.paper,
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              sx={{
                height: (t) => t.spacing(6),
                alignItems: "center",
                pl: 1,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              {slotProps.Handle?.children}
              <FeaturePicker
                // showArrow
                icon={<WidgetsOutlined />}
                label="Choose View"
                onChange={(type) =>
                  onChange?.({
                    ...stack,
                    type,
                  })
                }
                value={stack?.type}
                items={values(pages)}
                itemOrientation="vertical"
              />
              <Space sx={{ mx: "auto" }} />
              {slotProps.Extras?.children}
            </Stack>
            <Placeholder
              // label="Something went wrong"
              secondary={`${error.error}`}
              icon={<ErrorOutlined />}
            />
          </Stack>
        )}
      >
        <Block vertical>
          <Block sx={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "background.paper",
              }}
            >
              {slotProps.Content?.children}
            </Box>
          </Block>
          <Block sx={{ height: (t) => t.spacing(6), alignItems: "center" }}>
            <Block
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
                <Block
                  sx={{
                    width: "max-content",
                    height: (t) => t.spacing(6),
                    alignItems: "center",
                    p: 1,
                  }}
                >
                  {slotProps.Handle?.children}
                  <FeaturePicker
                    // showArrow
                    icon={<WidgetsOutlined />}
                    label="Choose View"
                    onChange={(type) =>
                      onChange?.({
                        ...stack,
                        type,
                      })
                    }
                    value={stack?.type}
                    items={values(pages)}
                    itemOrientation="vertical"
                  />
                  {slotProps.Options?.children && (
                    <>
                      {divider}
                      {slotProps.Options.children}
                    </>
                  )}
                </Block>
              </Scroll>
            </Block>
            <Space sx={{ mx: "auto" }} />
            {slotProps.Extras?.children}
          </Block>
        </Block>
      </ErrorBoundary>
    );
  }
);
