import Svg, { Path } from "react-native-svg";

interface TornEdgeSvgProps {
  color?: string;
  dashed?: boolean;
  inverted?: boolean;
}

const edgePath = "M0 9 L12 6 L22 11 L34 5 L47 10 L61 4 L73 12 L87 6 L101 10 L116 5 L131 11 L145 4 L159 10 L174 6 L188 12 L204 5 L220 10 L235 4 L249 11 L265 6 L281 10 L296 5 L312 12 L328 5 L344 10 L360 7";

export function TornEdgeSvg({ color = "#8A6B2C", dashed = false, inverted = false }: TornEdgeSvgProps) {
  return (
    <Svg
      pointerEvents="none"
      style={{ height: 18, width: "100%", transform: [{ scaleY: inverted ? -1 : 1 }] }}
      viewBox="0 0 360 18"
      preserveAspectRatio="none"
    >
      <Path
        d={edgePath}
        fill="none"
        opacity={dashed ? 0.48 : 0.8}
        stroke={color}
        strokeDasharray={dashed ? "7 6" : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={dashed ? 1.4 : 1.2}
      />
    </Svg>
  );
}
