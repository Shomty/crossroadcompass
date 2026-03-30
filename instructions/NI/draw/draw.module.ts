import { Module } from '@nestjs/common';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [DrawController],
    providers: [DrawService],
    exports: [DrawService]
})
export class DrawModule {}
