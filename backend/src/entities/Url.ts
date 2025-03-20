import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Url {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ default: 0 })
  visitCount: number;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
