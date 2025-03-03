import { Box, IconProps } from "@mui/material";
import { request } from "client/createHttpClient";
import { merge } from "lodash-es";
import memo from "memoizee";
import { useState } from "react";
import { useAsync } from "react-async-hook";

const getUrl = (key: string) =>
  `https://raw.githubusercontent.com/LawnchairLauncher/lawnicons/de1bd186c47f6655c9b3be7c9af9baa5dd636e54/svgs/${key}.svg`;

const getIcon = memo(async (key: string) => {
  if (!(key && isSanitised(key))) return;
  const response = await request.get({ path: getUrl(key), result: "text" });
  const svg = (
    new DOMParser().parseFromString(response, "image/svg+xml") as XMLDocument
  ).firstChild as SVGElement;
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("stroke-width", "16");
  svg.setAttribute("stroke", "currentColor");
  return svg;
});

type LawniconProps = {
  children: string;
  weight?: number;
};

/**
 * Fetches and renders an SVG icon from Lawnicons.
 * Use this for icons that are app icons, brands or logos.
 * @see https://github.com/LawnchairLauncher/lawnicons
 */

export const Lawnicon = ({
  children,
  color,
  ...props
}: LawniconProps & IconProps) => {
  const [ref, setRef] = useState<HTMLSpanElement | null>(null);
  const b = (!!ref && getComputedStyle(ref)?.fontSize) ?? 24;
  const { result } = useAsync(() => getIcon(children), [children]);
  return (
    <Box
      className="MuiSvgIcon-root Lawnicon-root"
      ref={setRef}
      {...merge({ sx: { width: b, height: b, color, lineHeight: 0 } }, props)}
      component="span"
      dangerouslySetInnerHTML={{ __html: result?.outerHTML ?? "" }}
    />
  );
};
function isSanitised(children: string) {
  return /^[a-zA-Z0-9_-]+$/.test(children);
}
