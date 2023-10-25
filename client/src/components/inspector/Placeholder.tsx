import { WidgetsOutlined } from "@mui/icons-material";
import { Typography as Type } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { cloneElement, ReactElement, ReactNode } from "react";

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
      textAlign="center"
      vertical
      pt={6}
      {...rest}
    >
      {cloneElement(icon, { sx: { mb: 2 }, fontSize: "large" })}
      <Type>{label}</Type>
    </Flex>
  );
}
