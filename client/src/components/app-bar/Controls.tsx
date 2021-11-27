import { Box, Card, Divider } from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { acrylic } from "theme";
import { Input } from "./Input";
import { Playback } from "./Playback";
import { Settings } from "./Settings";
import { Title } from "./Title";
import { Utility } from "./Utility";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

export function Controls() {
  return (
    <Card
      sx={{
        m: 3,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: "appBar",
        ...acrylic,
      }}
    >
      <Box display="flex">
        <Title mr={1} />
        <Flex p={1} alignItems="center">
          <Input />
          {divider}
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
