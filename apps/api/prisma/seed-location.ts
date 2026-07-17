import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Country: India
  let country = await prisma.country.findFirst({ where: { iso2: 'IN' } });
  if (!country) {
    country = await prisma.country.create({
      data: {
        name: 'India',
        iso2: 'IN',
        iso3: 'IND',
        phoneCode: '+91',
        currencyCode: 'INR',
        currencyName: 'Indian Rupee',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
      },
    });
    console.log('Created Country: India');
  }

  // State: Gujarat
  let state = await prisma.state.findFirst({ where: { code: 'GJ', countryId: country.id } });
  if (!state) {
    state = await prisma.state.create({
      data: {
        name: 'Gujarat',
        code: 'GJ',
        countryId: country.id,
      },
    });
    console.log('Created State: Gujarat');
  }

  // City: Surat
  let city = await prisma.city.findFirst({ where: { name: 'Surat', stateId: state.id } });
  if (!city) {
    city = await prisma.city.create({
      data: {
        name: 'Surat',
        stateId: state.id,
      },
    });
    console.log('Created City: Surat');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
