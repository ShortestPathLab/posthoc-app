import React, { useRef } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useTheme } from "@material-ui/core/styles";

export type SplitViewProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  resizable?: boolean;
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
export function SplitView({left, right, resizable=false}:SplitViewProps):React.ReactElement {
  const resizerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  let x = 0;
  let leftWidth = 0;

  const resizeMoveHandler = (e: MouseEvent) => {
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
  };

  const resizeUpHandler = () => {
    if (resizerRef.current && leftRef.current && rightRef.current) {
      resizerRef.current.style.removeProperty("cursor");
      document.body.style.removeProperty("cursor");
      leftRef.current.style.removeProperty("user-select");
      leftRef.current.style.removeProperty("pointer-events");
      rightRef.current.style.removeProperty("user-select");
      rightRef.current.style.removeProperty("pointer-events");
      document.removeEventListener("mousemove", resizeMoveHandler);
      document.removeEventListener("mouseup", resizeUpHandler);
    }
  };

  const resizeHandler = (e: React.MouseEvent) => {
    if (leftRef.current && resizerRef.current) {
      resizerRef.current.style.cursor = "e-resize";
      document.body.style.cursor = "e-resize";
      x = e.clientX;
      leftWidth = leftRef.current.getBoundingClientRect().width;
      document.addEventListener("mousemove", resizeMoveHandler);
      document.addEventListener("mouseup", resizeUpHandler);
    }
  };

  if (left && right) {
    return (
      <div style={{ height: "100%", display: "flex", width:"100%" }}>
        <div
          ref={leftRef}
          style={{ height: "100%", minWidth: "20%", width: "50%" }}
        >
          {left}
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
          {right}
        </div>
      </div>
    )
  } else if (left) {
    return <>{left}</>
  } else {
    return <></>
  }
}