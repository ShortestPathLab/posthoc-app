import {
  CloseOutlined,
  MoreVertOutlined as MoreIcon,
  ViewAgendaOutlined as SplitIcon,
  OpenInNewOutlined as PopOutIcon,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack as MuiStack,
  Tooltip,
} from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";

type ViewControlsProps = {
  splitVerticalDisabled?: boolean;
  splitHorizontalDisabled?: boolean;
  closeDisabled?: boolean;
  popOutDisabled?: boolean;
  onSplitVertical?: () => void;
  onSplitHorizontal?: () => void;
  onClose?: () => void;
  onPopOut?: () => void;
};

export function ViewControls({
  onSplitHorizontal,
  onClose,
  onSplitVertical,
  closeDisabled,
  splitHorizontalDisabled,
  splitVerticalDisabled,
  onPopOut,
  popOutDisabled,
}: ViewControlsProps) {
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
            TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
            {...bindMenu(state)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
          >
            <MenuItem
              onClick={() => {
                onSplitVertical?.();
                state.close();
              }}
              disabled={splitVerticalDisabled}
            >
              <ListItemIcon>
                <SplitIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Split Vertical</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSplitHorizontal?.();
                state.close();
              }}
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
            {!popOutDisabled && (
              <Box>
                <MenuItem
                  onClick={() => {
                    onPopOut?.();
                    state.close();
                  }}
                >
                  <ListItemIcon>
                    <PopOutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Pop Out</ListItemText>
                </MenuItem>
                <Divider />
              </Box>
            )}
            <MenuItem
              onClick={() => {
                onClose?.();
                state.close();
              }}
              disabled={closeDisabled}
            >
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
