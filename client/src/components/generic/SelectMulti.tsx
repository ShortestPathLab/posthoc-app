import {
  Checkbox,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import { findIndex, map, max } from "lodash";
import State, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { ReactElement, ReactNode } from "react";

type Key = string | number;

export type SelectProps<T extends Key> = {
  trigger?: (props: ReturnType<typeof bindTrigger>) => ReactElement;
  items?: { value: T; label?: ReactNode; disabled?: boolean }[];
  value?: Record<T, boolean | undefined>;
  onChange?: (value: Record<T, boolean | undefined>) => void;
  placeholder?: string;
};

const itemHeight = (sm: boolean) => (sm ? 48 : 36);
const padding = 8;

export function SelectMulti<T extends string>({
  trigger,
  items,
  value,
  onChange,
  placeholder = "Select Options",
}: SelectProps<T>) {
  const sm = useSmallDisplay();
  const index = max([findIndex(items, ({ value: v }) => !!value?.[v]), 0]) ?? 0;
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
              horizontal: "center",
              vertical: -itemHeight(sm) * index - padding,
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            {map(items, ({ value: v, label, disabled }) => (
              <MenuItem
                disabled={disabled}
                key={v}
                onClick={() => {
                  onChange?.({ ...value, [v]: !value?.[v] } as any);
                }}
              >
                <ListItemIcon>
                  <Checkbox sx={{ p: 0 }} checked={!!value?.[v]} />
                </ListItemIcon>
                {label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </State>
  );
}

// export type SelectFieldProps<T extends string> = Pick<
//   SelectProps<T>,
//   "items" | "onChange"
// > &
//   Omit<TextFieldProps, "onChange">;

// export function SelectField<T extends string>(props: SelectFieldProps<T>) {
//   const { placeholder, value, items = [], onChange } = props;
//   return (
//     <TextField
//       sx={{ minWidth: 120 }}
//       select
//       label={placeholder}
//       value={value}
//       variant="filled"
//       {...props}
//       onChange={(e) => onChange?.(e.target.value as T)}
//     >
//       {map(items, (item) => (
//         <MenuItem key={item.value} value={item.value}>
//           {item.label}
//         </MenuItem>
//       ))}
//     </TextField>
//   );
// }
