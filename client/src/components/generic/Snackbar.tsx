import { Box, IconButton, Snackbar } from "@material-ui/core";
import { CloseOutlined as CloseIcon } from "@material-ui/icons";
import { noop } from "lodash";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Flex } from "./Flex";
import { Space } from "./Space";

const SnackbarContext = createContext<(message?: ReactNode) => void>(noop);

export interface SnackbarMessage {
  message?: ReactNode;
  key: number;
}

export interface State {
  open: boolean;
  snackPack: readonly SnackbarMessage[];
  messageInfo?: SnackbarMessage;
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }: { children?: ReactNode }) {
  const [snackPack, setSnackPack] = useState<readonly SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackbarMessage | undefined>(
    undefined
  );

  useEffect(() => {
    if (snackPack.length && !current) {
      setCurrent({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && current && open) {
      setOpen(false);
    }
  }, [snackPack, current, open]);

  const handleMessage = useCallback(
    (message: ReactNode) => {
      setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
    },
    [setSnackPack]
  );

  const handleClose = (_: any, reason?: string) => {
    reason !== "clickaway" && setOpen(false);
  };

  const handleExited = () => setCurrent(undefined);

  return (
    <>
      <SnackbarContext.Provider value={handleMessage}>
        {children}
      </SnackbarContext.Provider>
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        message={current?.message}
        action={
          <>
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    </>
  );
}

type SnackbarLabelProps = {
  primary?: ReactNode;
  secondary?: ReactNode;
};

export function SnackbarLabel({ primary, secondary }: SnackbarLabelProps) {
  return (
    <Flex>
      <Box>{primary}</Box>
      <Space />
      <Box sx={{ opacity: 0.56 }}>{secondary}</Box>
    </Flex>
  );
}
