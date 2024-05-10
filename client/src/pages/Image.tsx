import { Fade } from "@mui/material";
import PopupState from "material-ui-popup-state";
import { ComponentProps } from "react";

export function Image(props: ComponentProps<"img">) {
  return (
    <PopupState variant="popover">
      {({ open, isOpen }) => (
        <>
          <Fade in={isOpen}>
            <img {...props} onLoad={open}></img>
          </Fade>
        </>
      )}
    </PopupState>
  );
}
