import { CloseOutlined, MoreVertOutlined as MoreIcon, ViewAgendaOutlined as SplitIcon } from "@mui/icons-material";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack as MuiStack, Tooltip } from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";

export function ViewControls({
  onSplitHorizontal,
  onClose,
  onSplitVertical,
  closeDisabled,
  splitHorizontalDisabled,
  splitVerticalDisabled,
}: {
  splitVerticalDisabled?: boolean;
  splitHorizontalDisabled?: boolean;
  closeDisabled?: boolean;
  onSplitVertical?: () => void;
  onSplitHorizontal?: () => void;
  onClose?: () => void;
}) {
  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <MuiStack sx={{ m: 1 }}>
            <Tooltip title="Panel Options">
              <IconButton size="small" {...bindTrigger(state)}>
                <MoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MuiStack>
          <Menu
            {...bindMenu(state)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
          >
            <MenuItem
              onClick={onSplitVertical}
              disabled={splitVerticalDisabled}
            >
              <ListItemIcon>
                <SplitIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Split Vertical</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={onSplitHorizontal}
              disabled={splitHorizontalDisabled}
            >
              <ListItemIcon>
                <SplitIcon
                  fontSize="small"
                  sx={{ transform: "rotate(90deg)" }}
                />
              </ListItemIcon>
              <ListItemText>Split Horizontal</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={onClose} disabled={closeDisabled}>
              <ListItemIcon>
                <CloseOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Close Panel</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </PopupState>
  );
}