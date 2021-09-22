import { Typography as Type } from "@material-ui/core";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export function Overline({ children }: Props) {
  return (
    <Type variant="overline" sx={{ my: -0.75, display: "block" }}>
      {children}
    </Type>
  );
}
