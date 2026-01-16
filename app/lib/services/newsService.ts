import { NewsPost } from '@/app/domain/types';
import { INewsRepository } from '@/app/domain/repositoryInterfaces';
import { INewsService } from '@/app/domain/serviceInterfaces';

export class NewsService implements INewsService {
  constructor(private repository: INewsRepository) {}

  async getAll(): Promise<NewsPost[]> {
    return this.repository.getAll();
  }

  async upsert(post: Partial<NewsPost>): Promise<void> {
    await this.repository.upsert(post);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
