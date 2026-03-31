import type { PlanetPosition } from "@node-jhora/core";
import type { ChartProps } from "@node-jhora/ui-react";

export type JhoraUiChartProps = Pick<ChartProps, "planets" | "ascendant">;

export type JhoraRawChart = {
  planets: PlanetPosition[];
  houses: { ascendant: number };
};

export function mapJhoraChartToUiReact(chart: JhoraRawChart): JhoraUiChartProps {
  return {
    planets: chart.planets,
    ascendant: chart.houses.ascendant,
  };
}
