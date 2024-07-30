import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryColumn()
  id: number;

  @Column()
  type: string;

  @Index() // database indexing
  @Column()
  name: string;

  @Column()
  payload: Record<string, any>;
}
