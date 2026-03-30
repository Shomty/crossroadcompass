import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { DrawService } from './draw.service';
import { ChartDrawParams } from './draw.types';
import { Log4jsService } from '../common/logger';
import { ZodiacSign } from '../shared-types/astrology.types';

@ApiTags('Draw')
@Controller('draw')
export class DrawController {
    constructor(
        private readonly drawService: DrawService,
        private readonly logger: Log4jsService
    ) {
        this.logger.setContext(DrawController.name);
    }

    @Get()
    @ApiOperation({
        summary: 'Draw Vedic astrology chart in North Indian style',
        description: 'Generates an SVG image of a Vedic astrology chart in North Indian style. Houses are specified using h1-h12 parameters with planet abbreviations. Planets can be marked as retrograde (R) or combust (C).'
    })
    @ApiQuery({
        name: 'w',
        required: false,
        description: 'Width of the chart in pixels (default: 480, max: 2048)',
        example: '480'
    })
    @ApiQuery({
        name: 'h',
        required: false,
        description: 'Height of the chart in pixels (default: 480, max: 2048)',
        example: '480'
    })
    @ApiQuery({
        name: 'lagna',
        required: false,
        description: 'Lagna (Ascendant) sign. If specified, zodiac sign numbers (1-12) will be drawn in the chart. Values: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces',
        example: 'leo'
    })
    @ApiQuery({
        name: 'h1',
        required: false,
        description: 'Planets in house 1. Format: Ve,Ju,Sa(R),Ra(C). Planets: Su(Sun), Mo(Moon), Ma(Mars), Me(Mercury), Ju(Jupiter), Ve(Venus), Sa(Saturn), Ra(Rahu), Ke(Ketu). Modifiers: (R)=Retrograde, (C)=Combust, (RC)=Both',
        example: 'Ve,Ju,Sa(R)'
    })
    @ApiQuery({
        name: 'h2',
        required: false,
        description: 'Planets in house 2. Same format as h1',
        example: 'Ra(R)'
    })
    @ApiQuery({
        name: 'h3',
        required: false,
        description: 'Planets in house 3. Same format as h1'
    })
    @ApiQuery({
        name: 'h4',
        required: false,
        description: 'Planets in house 4. Same format as h1',
        example: 'Ra(R)'
    })
    @ApiQuery({
        name: 'h5',
        required: false,
        description: 'Planets in house 5. Same format as h1'
    })
    @ApiQuery({
        name: 'h6',
        required: false,
        description: 'Planets in house 6. Same format as h1'
    })
    @ApiQuery({
        name: 'h7',
        required: false,
        description: 'Planets in house 7. Same format as h1'
    })
    @ApiQuery({
        name: 'h8',
        required: false,
        description: 'Planets in house 8. Same format as h1'
    })
    @ApiQuery({
        name: 'h9',
        required: false,
        description: 'Planets in house 9. Same format as h1'
    })
    @ApiQuery({
        name: 'h10',
        required: false,
        description: 'Planets in house 10. Same format as h1',
        example: 'Ke(R)'
    })
    @ApiQuery({
        name: 'h11',
        required: false,
        description: 'Planets in house 11. Same format as h1'
    })
    @ApiQuery({
        name: 'h12',
        required: false,
        description: 'Planets in house 12. Same format as h1'
    })
    @ApiResponse({
        status: 200,
        description: 'SVG chart generated successfully',
        content: {
            'image/svg+xml': {
                schema: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - invalid planet format' })
    @ApiResponse({ status: 500, description: 'Internal server error - chart generation failed' })
    async drawChart(@Query() params: ChartDrawParams, @Res() res: Response): Promise<void> {
        try {
            this.logger.info(`Drawing Vedic chart with params: ${JSON.stringify(params)}`);

            // Validate width and height parameters
            const width = params.w ? parseInt(params.w, 10) : 480;
            const height = params.h ? parseInt(params.h, 10) : 480;

            if (isNaN(width) || width <= 0) {
                throw new BadRequestException('Width (w) must be a positive number');
            }
            if (isNaN(height) || height <= 0) {
                throw new BadRequestException('Height (h) must be a positive number');
            }
            if (width > 2048) {
                throw new BadRequestException('Width (w) cannot be greater than 2048 pixels');
            }
            if (height > 2048) {
                throw new BadRequestException('Height (h) cannot be greater than 2048 pixels');
            }

            // Validate lagna parameter if provided
            if (params.lagna) {
                const validZodiacSigns: ZodiacSign[] = [
                    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
                ];
                
                if (!validZodiacSigns.includes(params.lagna)) {
                    throw new BadRequestException(
                        `Invalid lagna value '${params.lagna}'. Must be one of: ${validZodiacSigns.join(', ')}`
                    );
                }
            }

            // Validate that at least one house parameter is provided
            const hasHouseData = Object.keys(params).some(key => key.startsWith('h') && key.length > 1 && params[key as keyof ChartDrawParams]);

            if (!hasHouseData) {
                this.logger.warn('No house data provided in request');
            }

            // Generate SVG
            const svg = this.drawService.generateChartSVG(params, width, height);

            // Set appropriate headers for SVG response
            res.set({
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Content-Disposition': 'inline; filename="vedic-chart.svg"'
            });

            res.send(svg);

            this.logger.info('Chart SVG generated successfully');
        } catch (error) {
            this.logger.error('Error generating chart', error);

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Failed to generate chart. Please check your parameters.');
        }
    }
}
