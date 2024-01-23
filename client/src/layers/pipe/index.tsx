import { TextField } from "@mui/material";
import { Option } from "components/layer-editor/Option";
import { LayerController } from "layers";
import { withProduce } from "produce";
import { useState } from "react";
import { decode } from "./codeGenerator";

export const controller = {
  key: "pipe",
  inferName: () => "Untitled Pipe",
  editor: withProduce(() => {
    const [pairingCode, setPairingCode] = useState("");
    const { error: decodeError, id, port } = decode(pairingCode);
    const error = pairingCode && decodeError;

    function handleChange(v: string) {
      setPairingCode(
        Array.from(
          v
            .toUpperCase()
            .slice(0, 6)
            .matchAll(/[0-9A-Z]/g)
        ).join("")
      );
    }

    return (
      <>
        <Option
          label="Solver Code"
          content={
            <TextField
              error={!!error}
              variant="filled"
              size="small"
              hiddenLabel
              placeholder="XXX-XXX"
              helperText={error && "Invalid code"}
              onChange={(e) => handleChange(e.target.value)}
              value={pairingCode}
            />
          }
        />
      </>
    );
  }),
  renderer: () => {
    return <></>;
  },
  steps: ({ children }) => <>{children?.([])}</>,
  service: withProduce(() => {
    return <></>;
  }),
  getSelectionInfo: ({ children }) => {
    return <>{children?.({})}</>;
  },
} satisfies LayerController<"pipe", Record<string, any>>;
