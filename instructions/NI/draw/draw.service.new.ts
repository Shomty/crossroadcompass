import { Injectable } from '@nestjs/common';
import { Log4jsService } from '../common/logger';
import { Planet } from '../shared-types/astrology.types';
import { ChartDrawParams, HouseData, PlanetInHouse } from './draw.types';

@Injectable()
export class DrawService {
    constructor(private readonly logger: Log4jsService) {
        this.logger.setContext(DrawService.name);
    }

    // Planet symbol mappings
    private readonly planetSymbols: Record<Planet, string> = {
        sun: 'Su',
        moon: 'Mo',
        mars: 'Ma',
        mercury: 'Me',
        jupiter: 'Ju',
        venus: 'Ve',
        saturn: 'Sa',
        rahu: 'Ra',
        ketu: 'Ke'
    };

    /**
     * Parse planets from query parameter string
     * Format: "Ve,Ju,Sa(R),Ra(C)" -> [Venus, Jupiter, Saturn(R), Rahu(C)]
     */
    private parsePlanetsString(planetsStr: string): PlanetInHouse[] {
        if (!planetsStr || planetsStr.trim() === '') {
            return [];
        }

        return planetsStr.split(',').map(planetStr => {
            const trimmed = planetStr.trim();
            
            // Extract planet name and modifiers
            const match = trimmed.match(/^([A-Za-z]+)(\((R|C|RC|CR)\))?$/);
            if (!match) {
                this.logger.warn(`Invalid planet format: ${trimmed}`);
                return null;
            }

            const planetName = match[1];
            const modifiers = match[3] || '';

            // Convert planet abbreviation to full name
            const planetMap: Record<string, Planet> = {
                'Su': 'sun',
                'Mo': 'moon',
                'Ma': 'mars',
                'Me': 'mercury',
                'Ju': 'jupiter',
                'Ve': 'venus',
                'Sa': 'saturn',
                'Ra': 'rahu',
                'Ke': 'ketu'
            };

            const planet = planetMap[planetName];
            if (!planet) {
                this.logger.warn(`Unknown planet: ${planetName}`);
                return null;
            }

            return {
                planet,
                isRetrograde: modifiers.includes('R'),
                isCombust: modifiers.includes('C')
            };
        }).filter(Boolean) as PlanetInHouse[];
    }

    /**
     * Convert query parameters to house data
     */
    private parseChartParams(params: ChartDrawParams): HouseData[] {
        const houses: HouseData[] = [];

        for (let i = 1; i <= 12; i++) {
            const houseKey = `h${i}` as keyof ChartDrawParams;
            const planetsStr = params[houseKey];
            
            houses.push({
                number: i,
                planets: this.parsePlanetsString(planetsStr || '')
            });
        }

        return houses;
    }

    /**
     * Format planet display text with modifiers
     */
    private formatPlanetText(planet: PlanetInHouse): string {
        let text = this.planetSymbols[planet.planet];
        
        if (planet.isRetrograde && planet.isCombust) {
            text += '(RC)';
        } else if (planet.isRetrograde) {
            text += '(R)';
        } else if (planet.isCombust) {
            text += '(C)';
        }
        
        return text;
    }

    /**
     * Generate SVG for North Indian style Vedic chart
     */
    generateChartSVG(params: ChartDrawParams): string {
        try {
            const houses = this.parseChartParams(params);
            
            const svgWidth = 480;
            const svgHeight = 520;
            
            let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .outer-border { fill: white; stroke: #000; stroke-width: 3; }
      .inner-line { stroke: #000; stroke-width: 1; fill: none; }
      .house-text { font-family: Arial, sans-serif; font-size: 10px; fill: #000; text-anchor: middle; }
      .planet-text { font-family: Arial, sans-serif; font-size: 9px; fill: #000; text-anchor: middle; }
      .house-number { font-family: Arial, sans-serif; font-size: 7px; fill: #666; text-anchor: start; }
    </style>
  </defs>
  
  <!-- Chart Title -->
  <text x="${svgWidth/2}" y="25" class="house-text" style="font-size: 14px; font-weight: bold;">Vedic Chart - North Indian Style</text>
`;

            // Draw the diamond-shaped chart structure
            svg += this.generateChartStructure();
            
            // Add planets to houses
            houses.forEach(house => {
                if (house.planets.length > 0) {
                    svg += this.generateHouseContent(house);
                }
            });

            // Add house numbers
            for (let i = 1; i <= 12; i++) {
                svg += this.generateHouseNumber(i);
            }

            svg += '</svg>';
            
            return svg;
        } catch (error) {
            this.logger.error('Error generating chart SVG', error);
            throw new Error('Failed to generate chart SVG');
        }
    }

    /**
     * Generate the proper North Indian diamond chart structure
     */
    private generateChartStructure(): string {
        const centerX = 240;
        const centerY = 280;
        const outerSize = 160;
        
        let structure = `
  <!-- Outer Diamond Border -->
  <polygon points="${centerX},${centerY-outerSize} ${centerX+outerSize},${centerY} ${centerX},${centerY+outerSize} ${centerX-outerSize},${centerY}" 
           class="outer-border"/>
  
  <!-- Main Cross Lines -->
  <line x1="${centerX-outerSize}" y1="${centerY}" x2="${centerX+outerSize}" y2="${centerY}" class="inner-line"/>
  <line x1="${centerX}" y1="${centerY-outerSize}" x2="${centerX}" y2="${centerY+outerSize}" class="inner-line"/>
  
  <!-- Diagonal Lines -->
  <line x1="${centerX-outerSize/2}" y1="${centerY-outerSize/2}" x2="${centerX+outerSize/2}" y2="${centerY+outerSize/2}" class="inner-line"/>
  <line x1="${centerX-outerSize/2}" y1="${centerY+outerSize/2}" x2="${centerX+outerSize/2}" y2="${centerY-outerSize/2}" class="inner-line"/>
  
  <!-- Corner to Center Lines (creating the diamond segments) -->
  <line x1="${centerX}" y1="${centerY-outerSize}" x2="${centerX-outerSize/2}" y2="${centerY-outerSize/2}" class="inner-line"/>
  <line x1="${centerX}" y1="${centerY-outerSize}" x2="${centerX+outerSize/2}" y2="${centerY-outerSize/2}" class="inner-line"/>
  <line x1="${centerX+outerSize}" y1="${centerY}" x2="${centerX+outerSize/2}" y2="${centerY-outerSize/2}" class="inner-line"/>
  <line x1="${centerX+outerSize}" y1="${centerY}" x2="${centerX+outerSize/2}" y2="${centerY+outerSize/2}" class="inner-line"/>
  <line x1="${centerX}" y1="${centerY+outerSize}" x2="${centerX+outerSize/2}" y2="${centerY+outerSize/2}" class="inner-line"/>
  <line x1="${centerX}" y1="${centerY+outerSize}" x2="${centerX-outerSize/2}" y2="${centerY+outerSize/2}" class="inner-line"/>
  <line x1="${centerX-outerSize}" y1="${centerY}" x2="${centerX-outerSize/2}" y2="${centerY+outerSize/2}" class="inner-line"/>
  <line x1="${centerX-outerSize}" y1="${centerY}" x2="${centerX-outerSize/2}" y2="${centerY-outerSize/2}" class="inner-line"/>
`;
        
        return structure;
    }

    /**
     * Generate house number label
     */
    private generateHouseNumber(houseNumber: number): string {
        const positions = {
            1: { x: 235, y: 135 },   // Top
            2: { x: 295, y: 155 },   // Top-right
            3: { x: 315, y: 215 },   // Right-top  
            4: { x: 315, y: 280 },   // Right-center
            5: { x: 315, y: 345 },   // Right-bottom
            6: { x: 295, y: 405 },   // Bottom-right
            7: { x: 235, y: 425 },   // Bottom
            8: { x: 175, y: 405 },   // Bottom-left
            9: { x: 155, y: 345 },   // Left-bottom
            10: { x: 155, y: 280 },  // Left-center
            11: { x: 155, y: 215 },  // Left-top
            12: { x: 175, y: 155 }   // Top-left
        };
        
        const pos = positions[houseNumber as keyof typeof positions];
        return `<text x="${pos.x}" y="${pos.y}" class="house-number">${houseNumber}</text>\n`;
    }

    /**
     * Generate content for a specific house
     */
    private generateHouseContent(house: HouseData): string {
        const positions = {
            1: { x: 240, y: 160 },   // Top
            2: { x: 290, y: 180 },   // Top-right
            3: { x: 310, y: 240 },   // Right-top  
            4: { x: 310, y: 280 },   // Right-center
            5: { x: 310, y: 320 },   // Right-bottom
            6: { x: 290, y: 380 },   // Bottom-right
            7: { x: 240, y: 400 },   // Bottom
            8: { x: 190, y: 380 },   // Bottom-left
            9: { x: 170, y: 320 },   // Left-bottom
            10: { x: 170, y: 280 },  // Left-center
            11: { x: 170, y: 240 },  // Left-top
            12: { x: 190, y: 180 }   // Top-left
        };
        
        const pos = positions[house.number as keyof typeof positions];
        if (!pos) return '';
        
        let content = '';
        
        // Add planets to the house
        house.planets.forEach((planet, index) => {
            const planetText = this.formatPlanetText(planet);
            const yOffset = index * 12; // Stack planets vertically if multiple
            
            content += `<text x="${pos.x}" y="${pos.y + yOffset}" class="planet-text">${planetText}</text>\n`;
        });
        
        return content;
    }
}
