import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { GrantsService } from './grants.service';
import { QueryGrantsDto } from './dto/query-grants.dto';
import { Grant } from './entities/grant.entity';

@Controller('grants')
export class GrantsController {
  constructor(private readonly grantsService: GrantsService) {}

  @Get()
  async findAll(@Query() queryDto: QueryGrantsDto): Promise<Grant[]> {
    return this.grantsService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Grant> {
    return this.grantsService.findOne(id);
  }
}
