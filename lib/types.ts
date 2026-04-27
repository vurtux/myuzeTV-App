export interface Drama {
  id: string;
  title: string;
  image: string;
  genre: string;
  episode?: string;
  progress?: number;
  watching?: string;
  releasedAgo?: string;
  isNew?: boolean;
  insertedAt?: string;
}
