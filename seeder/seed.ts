import { faker } from '@faker-js/faker';
import { PrismaClient, Product } from '@prisma/client';
import * as dotenv from 'dotenv';
import { generateSlug } from 'src/utils/generate-slug';
import { getRandomNumber } from 'src/utils/random-numbers';

dotenv.config();
const prisma = new PrismaClient();

const createProducts = async (quantity: number): Promise<void> => {
  const products: Product[] = [];

  for (let i = 0; i < quantity; i++) {
    const productName = faker.commerce.productName();
    const categoryName = faker.commerce.department();

    const createdProduct = await prisma.product.create({
      data: {
        name: productName,
        slug: faker.helpers.slugify(productName).toLowerCase(),
        description: faker.commerce.productDescription(),
        price: parseFloat(
          faker.commerce.price({ min: 10000, max: 35000, dec: 0 }),
        ),
        images: Array.from({
          length: faker.number.int({ min: 2, max: 6 }),
        }).map(() => faker.image.dataUri()),
        category: {
          create: {
            name: categoryName,
            slug: faker.helpers.slugify(categoryName).toLowerCase(),
          },
        },
        reviews: {
          create: [
            {
              rating: faker.number.int({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: 1, // Убедитесь, что пользователь с таким ID существует
                },
              },
            },
            {
              rating: faker.number.int({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: 1, // Убедитесь, что пользователь с таким ID существует
                },
              },
            },
          ],
        },
      },
    });
    products.push(createdProduct);
  }
  console.log(`Created ${products.length} products`);
};

async function main() {
  console.log('Start seeding...');
  await createProducts(6);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
