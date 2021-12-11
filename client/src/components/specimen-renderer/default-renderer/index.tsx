import { BlurOffOutlined as DisabledIcon } from "@material-ui/icons";
import { Flex } from "components/generic/Flex";
import { RendererProps } from "components/specimen-renderer/Renderer";
import { useSpecimen } from "slices/specimen";

export function DefaultRenderer({ width, height }: RendererProps) {
  const [{ format }] = useSpecimen();
  return (
    <Flex
      {...{ width, height }}
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      vertical
    >
      <DisabledIcon sx={{ mb: 2 }} fontSize="large" />
      No renderer is installed for the current map format ({format}).
    </Flex>
  );
}
