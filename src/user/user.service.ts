import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.servise';
import { returnUserObject } from './return-user.object';
import { Prisma } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async byId(id: number, selectObject: Prisma.UserSelect = {}) {
    console.log(`Fetching user with ID: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        ...returnUserObject,
        favorites: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
          },
        },
        ...selectObject,
      },
    });

    if (!user) {
      console.error(`User with ID ${id} not found`);
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async updateProfile(id: number, dto: UserDto) {
    const isSameUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (isSameUser && id !== isSameUser.id)
      throw new BadRequestException('Email занят');

    const user = await this.byId(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: dto.email,
        name: dto.name,
        avatarPath: dto.avatarPath,
        phone: dto.phone,
        password: dto.password ? await hash(dto.password) : user.password,
      },
    });
  }

  async toggleFavorite(userId: number, productId: number) {
    console.log(
      `Attempting to toggle favorite for user ID: ${userId} and product ID: ${productId}`,
    );

    const user = await this.byId(userId);
    const isExists = user.favorites.some((product) => product.id === productId);
    
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        favorites: {
          [isExists ? 'disconnect' : 'connect']: {
            id: productId,
          },
        },
      },
    });
    return { message: 'Success' };
  }
}
