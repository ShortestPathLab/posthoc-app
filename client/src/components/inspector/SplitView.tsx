import React, { useRef, useState, useCallback, Dispatch, SetStateAction } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useTheme } from "@material-ui/core/styles";

export type SplitViewProps = {
  views?: React.ReactNode[];
  resizable?: boolean;
  resizing: boolean;
  setResizing: Dispatch<SetStateAction<boolean>>;
}

/**
 * Resizable split view component for displaying views side by side
 * - if left and right property all passed in then display split view
 * - if right view is not passed then it will return the left view
 * 
 * @param props.left ReactNode placed on the left side of split views
 * @param props.right ReactNode placed on the right side of split views
 * @param props.resizable boolean value if true then the split view will be resizable
 * @returns ReactElement of the split view
 */
export function SplitView({views, resizable=false, resizing, setResizing}:SplitViewProps):React.ReactElement {
  const resizerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  let [x, setX] = useState(0);
  let [leftWidth, setLeftWidth] = useState(0);

  const resizeMoveHandler = useCallback((e: MouseEvent) => {
    if (
      resizerRef.current &&
      leftRef.current &&
      rightRef.current &&
      resizerRef.current.parentNode
    ) {
      const parent = resizerRef.current.parentNode as HTMLDivElement;
      const dx = e.clientX - x;
      const width =
        ((leftWidth + dx) * 100) / parent.getBoundingClientRect().width;
      leftRef.current.style.width = `${width}%`;

      leftRef.current.style.userSelect = "none";
      leftRef.current.style.pointerEvents = "none";
      rightRef.current.style.userSelect = "none";
      rightRef.current.style.pointerEvents = "none";
    }
  }, [resizerRef, leftRef, rightRef, leftWidth, x]);

  const resizeUpHandler = useCallback(() => {
    if (resizerRef.current && leftRef.current && rightRef.current) {
      resizerRef.current.style.removeProperty("cursor");
      document.body.style.removeProperty("cursor");
      leftRef.current.style.removeProperty("user-select");
      leftRef.current.style.removeProperty("pointer-events");
      rightRef.current.style.removeProperty("user-select");
      rightRef.current.style.removeProperty("pointer-events");
      setResizing(false);
      document.removeEventListener("mousemove", resizeMoveHandler);
      document.removeEventListener("mouseup", resizeUpHandler);
    }
  }, [resizeMoveHandler, setResizing]);

  const resizeHandler = useCallback((e: React.MouseEvent) => {
    if (leftRef.current && resizerRef.current) {
      resizerRef.current.style.cursor = "e-resize";
      document.body.style.cursor = "e-resize";
      setX(e.clientX);
      setLeftWidth(leftRef.current.getBoundingClientRect().width);
      document.addEventListener("mousemove", resizeMoveHandler);
      document.addEventListener("mouseup", resizeUpHandler);
      setResizing(true);
    }
  }, [setX, setLeftWidth, resizeMoveHandler, resizeUpHandler, setResizing]);

  if (resizing) {
    return (
      <div style={{ height: "100%", display: "flex", width:"100%" }}>
        <div
          ref={leftRef}
          style={{ height: "100%", minWidth: "20%", width: "50%", background: theme.palette.divider}}
        >
        </div>
        <div
          ref={resizerRef}
          onMouseDown={resizable?resizeHandler:undefined}
          style={{ width: "15px", backgroundColor: theme.palette.primary.main, height: "100%", display:'flex', justifyContent:'center', alignItems:'center' }}
        >
          <MoreVertIcon color="action" />
        </div>
        <div
          ref={rightRef}
          style={{ flex: "1 1 0%", minWidth: "20%", height: "100%", background: theme.palette.divider }}
        >
        </div>
      </div>
    )
  }
  if (views?.length === 2) {
    return (
      <div style={{ height: "100%", display: "flex", width:"100%" }}>
        <div
          ref={leftRef}
          style={{ height: "100%", minWidth: "20%", width: "50%" }}
        >
          {views[0]}
        </div>
        <div
          ref={resizerRef}
          onMouseDown={resizable?resizeHandler:undefined}
          style={{ width: "15px", backgroundColor: theme.palette.primary.main, height: "100%", display:'flex', justifyContent:'center', alignItems:'center' }}
        >
          <MoreVertIcon color="action" />
        </div>
        <div
          ref={rightRef}
          style={{ flex: "1 1 0%", minWidth: "20%", height: "100%" }}
        >
          {views[1]}
        </div>
      </div>
    )
  } else if (views?.length === 1) {
    return <>{views[0]}</>
  } else {
    return <></>
  }
}