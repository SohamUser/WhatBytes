import Svg, { Circle, Line } from "react-native-svg";

const fibers = Array.from({ length: 20 }, (_, index) => ({
  x: (index * 47) % 360,
  y: (index * 83) % 480,
  length: 12 + (index % 4) * 7,
}));

export function PaperTexture() {
  return (
    <Svg
      pointerEvents="none"
      style={{ position: "absolute", inset: 0, opacity: 0.14 }}
      viewBox="0 0 360 480"
      preserveAspectRatio="none"
    >
      {fibers.map((fiber, index) => (
        <Line
          key={`fiber-${index}`}
          x1={fiber.x}
          x2={fiber.x + fiber.length}
          y1={fiber.y}
          y2={fiber.y + (index % 3) - 1}
          stroke="#8A6B2C"
          strokeWidth="0.65"
          strokeLinecap="round"
        />
      ))}
      {fibers.slice(0, 12).map((fiber, index) => (
        <Circle
          key={`speck-${index}`}
          cx={(fiber.x + 91) % 360}
          cy={(fiber.y + 37) % 480}
          fill="#7E652D"
          r={index % 2 ? 0.65 : 0.4}
        />
      ))}
    </Svg>
  );
}
