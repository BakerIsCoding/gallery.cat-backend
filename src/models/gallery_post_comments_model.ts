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
  Default,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import gallery_posts from "./gallery_posts_model";
import gallery_users from "./gallery_users_model";

interface GalleryPostCommentAttributes {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  parentCommentId?: number | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

type GalleryPostCommentCreationAttributes = Optional<
  GalleryPostCommentAttributes,
  "commentId" | "parentCommentId" | "isDeleted" | "updatedAt"
>;

@Table({
  tableName: "gallery_post_comments",
  timestamps: false,
})
export class gallery_post_comments
  extends Model<
    GalleryPostCommentAttributes,
    GalleryPostCommentCreationAttributes
  >
  implements GalleryPostCommentAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER.UNSIGNED })
  commentId!: number;

  @ForeignKey(() => gallery_posts)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER.UNSIGNED })
  postId!: number;

  @ForeignKey(() => gallery_users)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER.UNSIGNED })
  userId!: number;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  content!: string;

  @ForeignKey(() => gallery_post_comments)
  @AllowNull
  @Column({ type: DataType.INTEGER.UNSIGNED })
  parentCommentId?: number | null;

  @Default(false)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  isDeleted!: boolean;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  createdAt!: Date;

  @AllowNull
  @Column({ type: DataType.DATE })
  updatedAt?: Date | null;

  // EXTRA ASSOCIATIONS

  @BelongsTo(() => gallery_posts)
  post!: gallery_posts;

  @BelongsTo(() => gallery_users)
  user!: gallery_users;

  // father comment if this is a reply, can be null if it's a top-level comment (the first one)
  @BelongsTo(() => gallery_post_comments)
  parentComment?: gallery_post_comments;

  // Replies to this comment
  @HasMany(() => gallery_post_comments)
  replies?: gallery_post_comments[];
}

export default gallery_post_comments;
