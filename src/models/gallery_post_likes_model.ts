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
} from "sequelize-typescript";
import { Optional } from "sequelize";
import gallery_posts from "./gallery_posts_model";
import gallery_users from "./gallery_users_model";

interface GalleryPostLikeAttributes {
  likeId: number;
  postId: number;
  userId: number;
  createdAt: Date;
}

type GalleryPostLikeCreationAttributes = Optional<
  GalleryPostLikeAttributes,
  "likeId"
>;

export const TABLE_NAME = "gallery_post_likes";

@Table({
  tableName: TABLE_NAME,
  timestamps: false,
})
export class gallery_post_likes
  extends Model<GalleryPostLikeAttributes, GalleryPostLikeCreationAttributes>
  implements GalleryPostLikeAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER.UNSIGNED })
  likeId!: number;

  @ForeignKey(() => gallery_posts)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER.UNSIGNED })
  postId!: number;

  @ForeignKey(() => gallery_users)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER.UNSIGNED })
  userId!: number;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  // EXTRA ASSOCIATIONS

  @BelongsTo(() => gallery_posts)
  post!: gallery_posts;

  @BelongsTo(() => gallery_users)
  user!: gallery_users;
}

export default gallery_post_likes;
