import { Box, Card } from "@material-ui/core";
import { MapOutlined as MapIcon } from "@material-ui/icons";
import { IconButtonWithTooltip as Button } from "components/generic/IconButtonWithTooltip";
import { useAcrylic } from "theme";

export type ResizeMenuProps = {
  fitMap?: () => void;
};

export function ResizeMenu({ fitMap }: ResizeMenuProps) {
  const acrylic = useAcrylic();
  return (
    <Card
      sx={{
        m: 3,
        position: "absolute",
        left: 0,
        bottom: 0,
        zIndex: "appBar",
        ...acrylic,
      }}
    >
      <Box display="flex">
        {fitMap ? (
          <Button
            label="fit-map"
            icon={<MapIcon />}
            onClick={fitMap}
            color="primary"
          />
        ) : (
          <></>
        )}
      </Box>
    </Card>
  );
}
