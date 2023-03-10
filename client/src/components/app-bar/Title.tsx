import { Typography as Type, BoxProps, Box } from "@material-ui/core";
import {
  AppBarTitle,
  ManagedModal as Dialog,
} from "components/generic/Modal";
import { Welcome } from "components/welcome/Welcome"
import { useState } from "react";

export function Title(props: BoxProps) {
  const [first, setFirst] = useState(true);

  return (
    <>
      <Dialog
        trigger={(onClick, setOpen) => {
          if (first) {
            setOpen?.(true);
            setFirst(false);
          }
          return (
            <Box sx={{cursor:"pointer", userSelect:"none"}} bgcolor="primary.main" p={2} {...{onClick}}>
              <Type
                variant="body1"
                color="text.secondary"
                sx={{
                  color: "primary.contrastText",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                }}
              >
                PFAlgoViz
              </Type>
            </Box>
          )
        }}
        options={{width:960, scrollable: false}}
        appBar={{children: <AppBarTitle>Welcome</AppBarTitle> }}
      >
        <Welcome />
      </Dialog>
    </>
  );
}
