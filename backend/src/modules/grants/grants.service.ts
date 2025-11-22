import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grant, GrantStatus } from './entities/grant.entity';
import { CreateGrantDto } from './dto/create-grant.dto';
import { QueryGrantsDto } from './dto/query-grants.dto';

@Injectable()
export class GrantsService {
  constructor(
    @InjectRepository(Grant)
    private grantsRepository: Repository<Grant>,
  ) {}

  async findAll(queryDto: QueryGrantsDto): Promise<Grant[]> {
    const query = this.grantsRepository.createQueryBuilder('grant');

    // Apply filters
    if (queryDto.chain) {
      query.andWhere('grant.chain = :chain', { chain: queryDto.chain });
    }

    if (queryDto.category) {
      query.andWhere('grant.category = :category', {
        category: queryDto.category,
      });
    }

    if (queryDto.status) {
      query.andWhere('grant.status = :status', { status: queryDto.status });
    }

    if (queryDto.search) {
      query.andWhere(
        '(LOWER(grant.title) LIKE LOWER(:search) OR ' +
          'LOWER(grant.summary) LIKE LOWER(:search) OR ' +
          'LOWER(grant.tag) LIKE LOWER(:search) OR ' +
          'LOWER(grant.chain) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    // Sort by status (Open first) and then by deadline
    query
      .addSelect(
        `CASE
          WHEN grant.status = '${GrantStatus.OPEN}' THEN 1
          WHEN grant.status = '${GrantStatus.UPCOMING}' THEN 2
          ELSE 3
        END`,
        'status_order',
      )
      .orderBy('status_order', 'ASC')
      .addOrderBy('grant.deadline', 'ASC');

    return query.getMany();
  }

  async findOne(id: number): Promise<Grant> {
    const grant = await this.grantsRepository.findOne({ where: { id } });

    if (!grant) {
      throw new NotFoundException(`Grant with ID ${id} not found`);
    }

    return grant;
  }

  async create(createGrantDto: CreateGrantDto): Promise<Grant> {
    const grant = this.grantsRepository.create(createGrantDto);
    return this.grantsRepository.save(grant);
  }

  async update(id: number, updateData: Partial<CreateGrantDto>): Promise<Grant> {
    const grant = await this.findOne(id);
    Object.assign(grant, updateData);
    return this.grantsRepository.save(grant);
  }

  async delete(id: number): Promise<void> {
    const grant = await this.findOne(id);
    await this.grantsRepository.remove(grant);
  }

  async upsert(createGrantDto: CreateGrantDto): Promise<Grant> {
    // Try to find existing grant by title and link
    const existing = await this.grantsRepository.findOne({
      where: {
        title: createGrantDto.title,
        link: createGrantDto.link,
      },
    });

    if (existing) {
      return this.update(existing.id, createGrantDto);
    }

    return this.create(createGrantDto);
  }
}
