import { Typography as Type } from "@mui/material";
import { ReactNode as Node } from "react";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";

export const Heading = ({ label }: { label?: Node }) => (
  <Type variant="overline" color="text.secondary" sx={{ pt: 1 }} component="p">
    {label}
  </Type>
);

export const Label = ({ label }: { label?: Node }) => (
  <Type variant="body1">{label}</Type>
);

export const Option = ({
  label,
  content,
}: {
  label?: Node;
  content?: Node;
}) => (
  <Flex alignItems="center">
    <Label label={label} />
    <Space flex={1} />
    {content}
  </Flex>
);