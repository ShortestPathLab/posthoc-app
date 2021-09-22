import { BlurOffOutlined as DisabledIcon } from "@material-ui/icons";
import { Flex } from "components/generic/Flex";
import { RendererProps } from "components/specimen-inspector/Renderer";

export function DefaultRenderer({ width, height }: RendererProps) {
  return (
    <Flex
      {...{ width, height }}
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      vertical
    >
      <DisabledIcon sx={{ mb: 2 }} fontSize="large" />
      No renderer is installed for the current map style.
    </Flex>
  );
}
