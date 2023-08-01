import { CloseOutlined as CloseIcon } from "@mui/icons-material";
import { IconButton, Snackbar } from "@mui/material";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLog } from "slices/log";
import { Label } from "./Label";
import { filter } from "lodash";

const SnackbarContext = createContext<
  (message?: string, secondary?: string) => () => void
>(() => {});

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

  const [, appendLog] = useLog();

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
    (message?: string, secondary?: string) => {
      setSnackPack((prev) => [
        ...prev,
        {
          message: <Label primary={message} secondary={secondary} />,
          key: new Date().getTime(),
        },
      ]);
      appendLog({
        content: filter([message, secondary]).join(", "),
        timestamp: new Date().toString(),
      });
      return () => handleClose("");
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
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
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
