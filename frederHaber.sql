-- MySQL dump 10.13  Distrib 8.0.32, for macos13 (arm64)
--
-- Host: localhost    Database: scholarshipsForFred
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Current Database: `scholarshipsForFred`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `scholarshipsForFred` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `scholarshipsForFred`;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int DEFAULT NULL,
  `percentage` float DEFAULT NULL,
  `scholarship_category` enum('A','B','C','D') DEFAULT NULL,
  `other_scholarship` enum('YES','NO') DEFAULT NULL,
  `other_scholarship_percentage` float DEFAULT NULL,
  `admin_full_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `comments` text,
  `manager_comment` text,
  `signature` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `scholarship_requests` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (145,432,95,'A','NO',NULL,'John Doe','2023-09-19','good -- from admin','this is the manager review comment','John Doe');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scholarship_requests`
--

DROP TABLE IF EXISTS `scholarship_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholarship_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_request_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `sport` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('draft','submitted','requires_more_info','reviewed','open','admin_reviewed','approved','denied') DEFAULT NULL,
  `government_id` int DEFAULT NULL,
  `registration_number` int DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `course_title` varchar(100) DEFAULT NULL,
  `year_of_admission` int DEFAULT NULL,
  `education_level` enum('undergraduate','postgraduate') DEFAULT NULL,
  `city` enum('Limassol','Nicosia') DEFAULT NULL,
  `review_status` tinyint(1) DEFAULT '0',
  `last_duplicated_at` timestamp NULL DEFAULT NULL,
  `has_been_duplicated` tinyint(1) DEFAULT '0',
  `file_url` text,
  `file_key` varchar(255) DEFAULT NULL,
  `file_extension` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `scholarship_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=433 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholarship_requests`
--

LOCK TABLES `scholarship_requests` WRITE;
/*!40000 ALTER TABLE `scholarship_requests` DISABLE KEYS */;
INSERT INTO `scholarship_requests` VALUES (432,NULL,88,'Marco','Haber','Basketball','This is a test description','2023-09-19 18:11:15','approved',10101,18940,'99123456','Computer Science',2020,'undergraduate','Limassol',0,NULL,0,'https://frederickscholarships.s3.eu-north-1.amazonaws.com/1695147072865.pdf','1695147072865.pdf','.pdf');
/*!40000 ALTER TABLE `scholarship_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','student','unset') NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `role_updated` tinyint(1) DEFAULT '0',
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (88,'marcoshaber99@gmail.com','$2b$10$bg8VD9AoRFD0uxZgQKGRV.yAvahpkC8uTUMdAtzh4jbjt6toAy8KG','student',1,0,NULL,NULL),(98,'s.a@frederick.ac.cy','$2a$12$RrmsvdUuQAVCHohcGl0gbuPCfgBj/hF3iVFw.NFVFVi.qNe7MNqau','admin',1,1,NULL,NULL),(99,'m.a@frederick.ac.cy','$2a$12$RrmsvdUuQAVCHohcGl0gbuPCfgBj/hF3iVFw.NFVFVi.qNe7MNqau','manager',1,1,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-20 11:16:54
