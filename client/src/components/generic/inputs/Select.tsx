import {
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import { map } from "lodash";
import State, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { ReactElement, ReactNode } from "react";

type Key = string | number;

export type SelectProps<T extends Key> = {
  trigger?: (props: ReturnType<typeof bindTrigger>) => ReactElement;
  items?: {
    value: T;
    label?: ReactNode;
    disabled?: boolean;
    icon?: ReactNode;
  }[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  showTooltip?: boolean;
};

export function Select<T extends string>({
  trigger,
  items,
  value,
  onChange,
  showTooltip,
  placeholder = "Select Option",
}: SelectProps<T>) {
  return (
    <State variant="popover">
      {(state) => (
        <>
          <Tooltip title={placeholder}>
            <span>{trigger?.(bindTrigger(state))}</span>
          </Tooltip>
          <Menu
            {...bindMenu(state)}
            anchorOrigin={{
              horizontal: "left",
              vertical: "bottom",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {map(items, ({ value: v, label, disabled, icon }) => (
              <Tooltip title={showTooltip && v} placement="right" key={v}>
                <MenuItem
                  disabled={disabled}
                  key={v}
                  value={v}
                  selected={v === value}
                  onClick={() => {
                    state.close();
                    onChange?.(v);
                  }}
                >
                  {icon && (
                    <ListItemIcon sx={{ transform: "scale(0.8)" }}>
                      {icon}
                    </ListItemIcon>
                  )}
                  {label}
                </MenuItem>
              </Tooltip>
            ))}
          </Menu>
        </>
      )}
    </State>
  );
}

export type SelectFieldProps<T extends string> = Pick<
  SelectProps<T>,
  "items" | "onChange"
> &
  Omit<TextFieldProps, "onChange">;

export function SelectField<T extends string>(props: SelectFieldProps<T>) {
  const { placeholder, value, items = [], onChange } = props;
  return (
    <TextField
      sx={{ minWidth: 120 }}
      select
      label={placeholder}
      defaultValue={value}
      variant="filled"
      {...props}
      onChange={(e) => onChange?.(e.target.value as T)}
    >
      {map(items, (item) => (
        <MenuItem key={item.value} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
