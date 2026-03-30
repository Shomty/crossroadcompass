import { Planet, ZodiacSign } from '../shared-types/astrology.types';

export interface PlanetInHouse {
    planet: Planet;
    isRetrograde: boolean;
    isCombust: boolean;
}

export interface HouseData {
    number: number; // 1-12
    planets: PlanetInHouse[];
}

export interface ChartDrawParams {
    w?: string;
    h?: string;
    lagna?: ZodiacSign;
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
    h7?: string;
    h8?: string;
    h9?: string;
    h10?: string;
    h11?: string;
    h12?: string;
}
