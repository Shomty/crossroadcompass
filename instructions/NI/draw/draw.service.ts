import { Injectable } from '@nestjs/common';
import { Log4jsService } from '../common/logger';
import { Planet, ZodiacSign } from '../shared-types/astrology.types';
import { ChartDrawParams, HouseData, PlanetInHouse } from './draw.types';

@Injectable()
export class DrawService {
    private readonly zodiacSignFontSize = 12; // Default font size for zodiac signs

    constructor(
        private readonly logger: Log4jsService //
    ) {
        this.logger.setContext(DrawService.name);
    }

    // Planet symbol mappings
    private readonly planetSymbols: Record<Planet | 'lagna', string> = {
        lagna: 'As',
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
            const planetMap: Record<string, Planet | 'lagna'> = {
                'As': 'lagna',
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
    generateChartSVG(params: ChartDrawParams, width: number = 480, height: number = 480): string {
        try {
            const houses = this.parseChartParams(params);
            
            const svgWidth = width;
            const svgHeight = height;
            
            let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .background { fill: transparent; stroke: none; }
      .outer-border { fill: white; stroke: #000; stroke-width: 4; }
      .inner-line { stroke: #000; stroke-width: 1; fill: none; }
      .house-text { font-family: Arial, sans-serif; font-size: 10px; fill: #000; text-anchor: middle; }
      .planet-text { font-family: Arial, sans-serif; font-size: 9px; fill: #000; text-anchor: middle; }
      .house-number { font-family: Arial, sans-serif; font-size: 7px; fill: #666; text-anchor: start; }
      .house-container { fill: rgba(255,255,255,0.8); stroke: #ccc; stroke-width: 0.5; rx: 2; ry: 2; }
      .planet-row { font-family: Arial, sans-serif; font-size: 16px; fill: #000; text-anchor: middle; }
      .zodiac-sign { font-family: Arial, sans-serif; font-size: ${this.zodiacSignFontSize}px; fill: #333; text-anchor: middle; }
    </style>
  </defs>
`;

            // Draw the diamond-shaped chart structure
            svg += this.generateChartStructure(svgWidth, svgHeight);
            
            // Add planets to houses
            houses.forEach(house => {
                if (house.planets.length > 0) {
                    svg += this.generateHouseContent(house, svgWidth, svgHeight);
                }
            });

            // Add zodiac sign numbers if lagna is specified
            if (params.lagna) {
                svg += this.generateZodiacSigns(params.lagna, svgWidth, svgHeight);
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
    private generateChartStructure(svgWidth: number, svgHeight: number): string {
        const borderWidth = 4;
        const halfBorder = borderWidth / 2;
        
        let structure = `
  <!-- Background rectangle to ensure border visibility -->
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" class="background"/>
  
  <!-- Step 1: Outer Rectangle Border (inset to prevent clipping) -->
  <rect x="${halfBorder}" y="${halfBorder}" width="${svgWidth - borderWidth}" height="${svgHeight - borderWidth}" class="outer-border"/>
  
  <!-- Step 2: Diagonal Lines (parallel to screen edges) -->
  <line x1="${halfBorder}" y1="${halfBorder}" x2="${svgWidth - halfBorder}" y2="${svgHeight - halfBorder}" class="inner-line"/>
  <line x1="${halfBorder}" y1="${svgHeight - halfBorder}" x2="${svgWidth - halfBorder}" y2="${halfBorder}" class="inner-line"/>
  
  <!-- Step 3: Lines connecting halves of adjacent borders -->
  <!-- Line from half of top border to half of left border -->
  <line x1="${svgWidth/2}" y1="${halfBorder}" x2="${halfBorder}" y2="${svgHeight/2}" class="inner-line"/>
  <!-- Line from half of top border to half of right border -->
  <line x1="${svgWidth/2}" y1="${halfBorder}" x2="${svgWidth - halfBorder}" y2="${svgHeight/2}" class="inner-line"/>
  <!-- Line from half of bottom border to half of left border -->
  <line x1="${svgWidth/2}" y1="${svgHeight - halfBorder}" x2="${halfBorder}" y2="${svgHeight/2}" class="inner-line"/>
  <!-- Line from half of bottom border to half of right border -->
  <line x1="${svgWidth/2}" y1="${svgHeight - halfBorder}" x2="${svgWidth - halfBorder}" y2="${svgHeight/2}" class="inner-line"/>
`;
        
        return structure;
    }

    /**
     * Generate content for a specific house with a container that grows with content
     */
    private generateHouseContent(house: HouseData, svgWidth: number, svgHeight: number): string {
        // Base positions as percentages (0-1) for better scalability
        const basePositions = {
            1: { x: 0.5, y: 0.25 },     // Top center
            2: { x: 0.25, y: 0.1 },     // Top-left
            3: { x: 0.11, y: 0.25 },    // Left-top
            4: { x: 0.25, y: 0.5 },     // Left center
            5: { x: 0.11, y: 0.75 },    // Left-bottom
            6: { x: 0.25, y: 0.9 },     // Bottom-left
            7: { x: 0.5, y: 0.75 },     // Bottom center
            8: { x: 0.75, y: 0.9 },     // Bottom-right
            9: { x: 0.89, y: 0.75 },    // Right-bottom
            10: { x: 0.75, y: 0.5 },    // Right-center
            11: { x: 0.89, y: 0.25 },   // Right-top
            12: { x: 0.75, y: 0.1 }     // Top-left
        };
        
        const basePos = basePositions[house.number as keyof typeof basePositions];
        if (!basePos) return '';
        
        if (house.planets.length === 0) return '';
        
        // Convert percentage positions to actual coordinates
        const centerX = basePos.x * svgWidth;
        const centerY = basePos.y * svgHeight;
        
        // Calculate container dimensions based on content
        const planetsPerRow = this.calculateOptimalLayout(house.planets.length);
        const planetTexts = house.planets.map(planet => this.formatPlanetText(planet));
        
        // Estimate text dimensions (approximate)
        const charWidth = 6 * (svgWidth / 480); // Scale with SVG size
        const lineHeight = 20 * (svgHeight / 480);
        const padding = 4 * Math.min(svgWidth, svgHeight) / 480;
        
        // Calculate max text width in each row
        let maxRowWidth = 0;
        const totalRows = Math.ceil(house.planets.length / planetsPerRow);
        for (let row = 0; row < totalRows; row++) {
            const startIdx = row * planetsPerRow;
            const endIdx = Math.min(startIdx + planetsPerRow, house.planets.length);
            const rowTexts = planetTexts.slice(startIdx, endIdx);
            const rowText = rowTexts.join(', ');
            const rowWidth = rowText.length * charWidth;
            maxRowWidth = Math.max(maxRowWidth, rowWidth);
        }
        
        // Container dimensions
        const containerHeight = (totalRows * lineHeight) + (padding * 2);
        
        // Position container by its center
        const containerY = centerY - (containerHeight / 2);
        
        let content = '';
       
        // Add planets in rows
        for (let row = 0; row < totalRows; row++) {
            const startIdx = row * planetsPerRow;
            const endIdx = Math.min(startIdx + planetsPerRow, house.planets.length);
            const rowPlanets = house.planets.slice(startIdx, endIdx);
            const rowTexts = rowPlanets.map(planet => this.formatPlanetText(planet));
            const rowText = rowTexts.join(', ');
            
            const textX = centerX; // Center the text horizontally
            const textY = containerY + padding + (lineHeight * (row + 0.7)); // Position from top of container
            
            content += `<text x="${textX}" y="${textY}" class="planet-row">${rowText}</text>\n`;
        }
        
        return content;
    }

    /**
     * Calculate optimal layout for planets in a house
     * Returns number of planets per row for best fit
     */
    private calculateOptimalLayout(planetCount: number): number {
        if (planetCount <= 4) {
            return 1;
        }
        //if (planetCount <= 4) return 2;
        //if (planetCount <= 6) return 3;
        //if (planetCount <= 9) return 3;
        return 2; // Maximum 2 planets per row for readability
    }

    /**
     * Generate zodiac sign numbers for the chart based on lagna
     */
    private generateZodiacSigns(lagna: ZodiacSign, svgWidth: number, svgHeight: number): string {
        // Zodiac sign order starting from Aries
        const zodiacSigns: ZodiacSign[] = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];

        // Find the index of the lagna sign (0-11)
        const lagnaIndex = zodiacSigns.indexOf(lagna);
        if (lagnaIndex === -1) {
            this.logger.warn(`Invalid lagna sign: ${lagna}`);
            return '';
        }

        const zodiacSignHalfSize = this.zodiacSignFontSize / 2;
        const offset = 15; // Offset for better positioning

        // Zodiac sign positions as percentages (0-1) - positioned slightly offset from house centers
        const zodiacPositions = {
            1: { x: 0.5, y: 0.5, xOffset: 0, yOffset: -offset + zodiacSignHalfSize },     // Top center (above house content)
            2: { x: 0.25, y: 0.25, xOffset: 0, yOffset: -offset + zodiacSignHalfSize },    // Top-left (above house content)
            3: { x: 0.25, y: 0.25, xOffset: -offset, yOffset: zodiacSignHalfSize },    // Left-top (left of house content)
            4: { x: 0.5, y: 0.5, xOffset: -offset, yOffset: zodiacSignHalfSize },     // Left center (left of house content)
            5: { x: 0.25, y: 0.75, xOffset: -offset, yOffset: zodiacSignHalfSize },    // Left-bottom (left of house content)
            6: { x: 0.25, y: 0.75, xOffset: 0, yOffset: offset + zodiacSignHalfSize },    // Bottom-left (below house content)
            7: { x: 0.5, y: 0.5, xOffset: 0, yOffset: offset + zodiacSignHalfSize },     // Bottom center (below house content)
            8: { x: 0.75, y: 0.75, xOffset: 0, yOffset: offset + zodiacSignHalfSize },    // Bottom-right (below house content)
            9: { x: 0.75, y: 0.75, xOffset: offset, yOffset: zodiacSignHalfSize },    // Right-bottom (right of house content)
            10: { x: 0.5, y: 0.5, xOffset: offset, yOffset: zodiacSignHalfSize },    // Right-center (right of house content)
            11: { x: 0.75, y: 0.25, xOffset: offset, yOffset: zodiacSignHalfSize },   // Right-top (right of house content)
            12: { x: 0.75, y: 0.25, xOffset: 0, yOffset: -offset + zodiacSignHalfSize }    // Top-right (above house content)
        };

        let content = '';

        // Generate zodiac sign numbers for each house
        for (let houseNum = 1; houseNum <= 12; houseNum++) {
            // Calculate which zodiac sign corresponds to this house
            // House 1 = lagna sign, House 2 = next sign, etc.
            const zodiacIndex = (lagnaIndex + houseNum - 1) % 12;
            const zodiacNumber = zodiacIndex + 1; // Aries=1, Taurus=2, etc.

            const position = zodiacPositions[houseNum as keyof typeof zodiacPositions];
            if (position) {
                const x = position.x * svgWidth + position.xOffset;
                const y = position.y * svgHeight + position.yOffset;

                content += `<text x="${x}" y="${y}" class="zodiac-sign">${zodiacNumber}</text>\n`;
            }
        }

        return content;
    }
}
