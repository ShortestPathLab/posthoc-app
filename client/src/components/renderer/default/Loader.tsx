import { CircularProgress } from "@mui/material";
import { Flex } from "components/generic/Flex";

export function Loader() {
  return (
    <Flex
      sx={{ width: "100vw", height: "100vh" }}
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      vertical
    >
      <CircularProgress sx={{ mb: 2 }} />
    </Flex>
  );
}