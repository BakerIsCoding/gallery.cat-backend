-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: gallery-cat
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit`
--

DROP TABLE IF EXISTS `audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table` varchar(255) NOT NULL,
  `userId` int unsigned DEFAULT NULL,
  `oldData` json DEFAULT NULL,
  `newData` json DEFAULT NULL,
  `queryType` varchar(20) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_table` (`table`),
  KEY `idx_audit_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gallery_post_comments`
--

DROP TABLE IF EXISTS `gallery_post_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_post_comments` (
  `commentId` int unsigned NOT NULL AUTO_INCREMENT,
  `postId` int unsigned NOT NULL,
  `userId` int unsigned NOT NULL,
  `content` text NOT NULL,
  `parentCommentId` int unsigned DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`commentId`),
  KEY `parentCommentId` (`parentCommentId`),
  KEY `idx_comments_postId` (`postId`),
  KEY `idx_comments_userId` (`userId`),
  CONSTRAINT `gallery_post_comments_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `gallery_posts` (`postId`),
  CONSTRAINT `gallery_post_comments_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `gallery_users` (`userId`),
  CONSTRAINT `gallery_post_comments_ibfk_3` FOREIGN KEY (`parentCommentId`) REFERENCES `gallery_post_comments` (`commentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gallery_post_likes`
--

DROP TABLE IF EXISTS `gallery_post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_post_likes` (
  `likeId` int unsigned NOT NULL AUTO_INCREMENT,
  `postId` int unsigned NOT NULL,
  `userId` int unsigned NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`likeId`),
  UNIQUE KEY `uniq_post_user` (`postId`,`userId`),
  KEY `idx_likes_postId` (`postId`),
  KEY `idx_likes_userId` (`userId`),
  CONSTRAINT `gallery_post_likes_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `gallery_posts` (`postId`),
  CONSTRAINT `gallery_post_likes_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `gallery_users` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gallery_posts`
--

DROP TABLE IF EXISTS `gallery_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_posts` (
  `postId` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned NOT NULL,
  `description` text NOT NULL,
  `imageUrl` text NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`postId`),
  KEY `userId` (`userId`),
  CONSTRAINT `gallery_posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `gallery_users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gallery_users`
--

DROP TABLE IF EXISTS `gallery_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_users` (
  `userId` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mailToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isMailConfirmed` tinyint(1) NOT NULL DEFAULT '0',
  `role` tinyint unsigned NOT NULL DEFAULT '3',
  `imageUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `ux_gallery_users_email` (`email`),
  KEY `ix_gallery_users_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'gallery-cat'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03  0:31:56
