import { WidgetsOutlined } from "@mui/icons-material";
import { Flex, FlexProps } from "components/generic/Flex";
import { ReactElement, ReactNode, cloneElement } from "react";

export function Placeholder({
  label,
  icon = <WidgetsOutlined />,
  ...rest
}: { label?: ReactNode; icon?: ReactElement } & FlexProps) {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      bgcolor="background.paper"
      vertical
      pt={6}
      {...rest}
    >
      {cloneElement(icon, { sx: { mb: 2 }, fontSize: "large" })}
      {label}
    </Flex>
  );
}
