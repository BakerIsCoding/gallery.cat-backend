import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import gallery_users from "./gallery_users_model";
import gallery_post_likes from "./gallery_post_likes_model";
import gallery_post_comments from "./gallery_post_comments_model";

interface GalleryPostAttributes {
  postId: number;
  userId: number;
  description: string;
  imageUrl: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type GalleryPostCreationAttributes = Optional<
  GalleryPostAttributes,
  "postId" | "createdAt" | "updatedAt"
>;

@Table({
  tableName: "gallery_posts",
  timestamps: false,
})
export class gallery_posts
  extends Model<GalleryPostAttributes, GalleryPostCreationAttributes>
  implements GalleryPostAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER.UNSIGNED })
  postId!: number;

  @ForeignKey(() => gallery_users)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER.UNSIGNED })
  userId!: number;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  description!: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  imageUrl!: string;

  @AllowNull
  @Column({ type: DataType.DATE })
  createdAt?: Date | null;

  @AllowNull
  @Column({ type: DataType.DATE })
  updatedAt?: Date | null;

  // EXTRA ASSOCIATIONS

  @BelongsTo(() => gallery_users)
  user!: gallery_users;

  @HasMany(() => gallery_post_likes)
  likes!: gallery_post_likes[];

  @HasMany(() => gallery_post_comments)
  comments!: gallery_post_comments[];
}

export default gallery_posts;
