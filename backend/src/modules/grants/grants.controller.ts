import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GrantsService } from './grants.service';
import { QueryGrantsDto } from './dto/query-grants.dto';
import { CreateGrantDto } from './dto/create-grant.dto';
import { Grant } from './entities/grant.entity';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

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

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(@Body() createGrantDto: CreateGrantDto): Promise<Grant> {
    return this.grantsService.create(createGrantDto);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGrantDto: Partial<CreateGrantDto>,
  ): Promise<Grant> {
    return this.grantsService.update(id, updateGrantDto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.grantsService.delete(id);
    return { message: 'Grant deleted successfully' };
  }
}
