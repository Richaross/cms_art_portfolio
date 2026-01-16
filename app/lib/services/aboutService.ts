import { AboutInfo } from '@/app/domain/types';
import { IAboutRepository } from '@/app/domain/repositoryInterfaces';
import { IAboutService } from '@/app/domain/serviceInterfaces';

export class AboutService implements IAboutService {
  constructor(private repository: IAboutRepository) {}

  async get(): Promise<AboutInfo | null> {
    return this.repository.get();
  }

  async upsert(info: Partial<AboutInfo>): Promise<void> {
    await this.repository.upsert(info);
  }
}
