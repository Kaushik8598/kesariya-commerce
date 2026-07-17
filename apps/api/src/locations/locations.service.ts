import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCountries() {
    return this.prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, phoneCode: true, iso2: true },
    });
  }

  async getStates(countryId: string) {
    return this.prisma.state.findMany({
      where: { countryId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async getCities(stateId: string) {
    return this.prisma.city.findMany({
      where: { stateId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }
}
