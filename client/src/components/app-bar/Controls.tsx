import { Box, Card, Divider } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { useAcrylic } from "theme";
import { Playback } from "./Playback";
import { Settings } from "./Settings";
import { Title } from "./Title";
import { Utility } from "./Utility";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

export function Controls() {
  const acrylic = useAcrylic();
  return (
    <Card
      sx={{
        m: 3,
        position: "absolute",
        bottom: (theme) => theme.spacing(2),
        left: 0,
        zIndex: "appBar",
        ...acrylic,
      }}
    >
      <Box display="flex">
        <Title mr={1} />
        <Flex p={1} alignItems="center">
          <Playback />
          {divider}
          <Utility />
          {divider}
          <Settings />
        </Flex>
      </Box>
    </Card>
  );
}
