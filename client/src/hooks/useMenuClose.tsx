import { createContext, useContext } from "react";

/**
 * Lets descendants close the menu they're rendered in. Menus (e.g.
 * `SelectionMenu`) provide their `onClose` here; surface openers consume it
 * via `useMenuClose` so that choosing a menu item that opens a surface closes
 * the menu first. Defaults to a no-op outside of any menu.
 */
export const MenuCloseContext = createContext<(() => void) | undefined>(undefined);

export const useMenuClose = () => useContext(MenuCloseContext);
