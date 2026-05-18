import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  // Stocke une liste de rôles (ex: ["ADMIN", "FARMER"])
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  roles!: string[];
}

