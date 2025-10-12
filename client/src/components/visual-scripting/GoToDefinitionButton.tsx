import { NetworkNodeOutlined } from "@mui-symbols-material/w400";
import {
  IconButtonWithTooltip,
  IconButtonWithTooltipProps,
} from "components/generic/inputs/IconButtonWithTooltip";
import { useVisualScriptingContext } from "pages/visual-scripting";

export function GoToDefinitionButton({
  $,
  ...props
}: Partial<IconButtonWithTooltipProps> & { $: string }) {
  const { goToDefinition, hasDefinition } = useVisualScriptingContext();
  return (
    <IconButtonWithTooltip
      color="primary"
      disabled={!hasDefinition?.($)}
      icon={<NetworkNodeOutlined fontSize="small" />}
      label="Go to view definition"
      onClick={() => goToDefinition?.($)}
      {...props}
    />
  );
}
