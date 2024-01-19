import { LayerController } from "layers";
import { withProduce } from "produce";
import { Heading, Option } from "components/layer-editor/Option";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { TextField } from "@mui/material";
import { useState } from "react";
import { encode, decode } from "./codeGenerator";

export const controller = {
  key: "pipe",
  inferName: (layer) => "Untitled Pipe",
  editor: withProduce(() => {
    const [pairingCode, setPairingCode] = useState("");
    const { error: decodeError, id, port } = decode(pairingCode);
    const error = pairingCode && decodeError;

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
              placeholder="xxxxxx"
              helperText={error && "Invalid code"}
              onChange={(e) =>
                setPairingCode(e.target.value.toUpperCase().slice(0, 6))
              }
              value={pairingCode}
            />
          }
        />
        {id},{port}
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
