import { HeroSettings } from '@/app/domain/types';
import { IHeroRepository } from '@/app/domain/repositoryInterfaces';
import { IHeroService } from '@/app/domain/serviceInterfaces';

export class HeroService implements IHeroService {
  constructor(private repository: IHeroRepository) {}

  async getSettings(): Promise<HeroSettings> {
    return this.repository.getSettings();
  }

  async updateSettings(settings: Partial<HeroSettings>): Promise<HeroSettings> {
    return this.repository.updateSettings(settings);
  }
}
