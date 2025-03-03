import { merge } from "lodash-es";
import { usePopupState } from "material-ui-popup-state/hooks";
import { ReactNode, useState } from "react";
import { SurfaceBase, SurfaceBaseProps, SurfaceProps } from "./Surface";

export type SurfaceContentProps = {
  onClose?: () => void;
  onProps?: (p: SurfaceProps) => void;
};
export function useSurface<T>(
  Content?: (props: T & SurfaceContentProps) => ReactNode,
  props: SurfaceProps = {}
) {
  const popupState = usePopupState({ variant: "dialog" });
  const [state, setState] = useState<T & SurfaceContentProps>();
  const [modalProps, setModalProps] = useState<Partial<SurfaceBaseProps>>({});
  const open = (s: T & SurfaceContentProps) => {
    popupState.open();
    setState(s);
  };
  const close = () => {
    popupState.close();
    setModalProps({});
  };
  return {
    open,
    close,
    dialog: (
      <SurfaceBase {...merge({ state: popupState }, props, modalProps)}>
        {Content && (
          <Content
            {...state!}
            onClose={() => {
              close?.();
              state?.onClose?.();
            }}
            onProps={setModalProps}
          />
        )}
      </SurfaceBase>
    ),
  };
}
