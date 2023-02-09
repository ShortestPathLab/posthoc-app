import { Typography as Type, BoxProps, Box } from "@material-ui/core";
import {
  AppBarTitle,
  ManagedModal as Dialog,
} from "components/generic/Modal";

export function Title(props: BoxProps) {
  return (
    <>
      <Dialog
        trigger={(onClick) => (
          <Box bgcolor="primary.main" p={2} {...{onClick}}>
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
        )}
        options={{width:960, scrollable: false}}
        appBar={{children: <AppBarTitle>Welcome</AppBarTitle> }}
      >
        ABCDE
      </Dialog>
    </>
  );
}
