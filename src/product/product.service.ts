import { Injectable, NotFoundException } from '@nestjs/common';
import {
  returnProductObject,
  returnProductObjectFullest,
} from './return-product.object';
import { PrismaService } from 'src/prisma.servise';
import { ProductDto } from './dto/product.dto';

import { generateSlug } from 'src/utils/generate-slug';
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async getAll(dto: GetAllProductDto = {}) {
    const { sort, searchTerm } = dto;
    const prismaSort: Prisma.ProductOrderByWithRelationInput[] = [];
    if (sort === EnumProductSort.LOW_PRICE) prismaSort.push({ price: 'asc' });
    else if (sort === EnumProductSort.HIGH_PRICE)
      prismaSort.push({ price: 'desc' });
    else if (sort === EnumProductSort.NEWEST)
      prismaSort.push({ createdAt: 'desc' });
    else if (sort === EnumProductSort.OLDEST)
      prismaSort.push({ createdAt: 'asc' });
    else prismaSort.push({ createdAt: 'desc' });

    const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
      ? {
          OR: [
            {
              category: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
              description: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};
    const { perPage, skip } = this.paginationService.getPagination(dto);
    const products = await this.prisma.product.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage,
    });
    return {
      products,
      length: await this.prisma.product.count({
        where: prismaSearchTermFilter,
      }),
    };
  }

  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      select: returnProductObjectFullest,
    });

    if (!product) {
      console.error(`product with ID ${id} not found`);
      throw new NotFoundException('Товар не найден');
    }
    return product;
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
      },
      select: returnProductObjectFullest,
    });

    if (!product) throw new NotFoundException('Товар не найдена');

    return product;
  }

  async byCategory(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
      },
      select: returnProductObjectFullest,
    });

    if (!products) throw new NotFoundException('Товарs не найдены');

    return products;
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id);

    if (!currentProduct)
      throw new NotFoundException('Выбранные товары не найдены');
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          name: currentProduct.category.name,
        },
        NOT: {
          id: currentProduct.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: returnProductObject,
    });
    return products;
  }

  async create() {
    const product = await this.prisma.product.create({
      data: {
        description: '',
        name: '',
        price: 0,
        slug: '',
      },
    });
    return product;
  }

  async update(id: number, dto: ProductDto) {
    const { description, images, price, name, categoryId } = dto;

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        description,
        images,
        price,
        name,
        slug: generateSlug(name),
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
