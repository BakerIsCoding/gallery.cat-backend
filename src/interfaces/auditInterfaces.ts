import { TABLE_NAME as GALLERY_AUDIT_TABLE } from "@models/gallery_audit_model";
import { TABLE_NAME as GALLERY_POST_COMMENTS } from "@models/gallery_post_comments_model";
import { TABLE_NAME as GALLERY_POST_LIKES } from "@models/gallery_post_likes_model";
import { TABLE_NAME as GALLERY_POSTS } from "@models/gallery_posts_model";
import { TABLE_NAME as GALLERY_USERS } from "@models/gallery_users_model";

export enum AuditType {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum AuditTable {
  POST_COMMENTS = GALLERY_POST_COMMENTS,
  POST_LIKES = GALLERY_POST_LIKES,
  POSTS = GALLERY_POSTS,
  USERS = GALLERY_USERS,
}
