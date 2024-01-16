-- MySQL dump 10.13  Distrib 8.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: stylish
-- ------------------------------------------------------
-- Server version	8.1.0

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `provider` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `picture` text,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `email_index` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (21,'native','test','test@test.com','$argon2id$v=19$m=65536,t=3,p=4$3m9Qgx7kikypLJf+72MchQ$Ga00VZZ2K34ml2QCxU3ysmosG7LE2GueKbjOrd/VBns',NULL,'admin'),(22,'native','test','test1@test.com','$argon2id$v=19$m=65536,t=3,p=4$yjmx5d9b4i8LvGL+P62GYA$yvaBfU9EN8SW+EQOJZILAsi0bwcXKdlF/o1FWaUeWH8',NULL,'user'),(23,'native','test','test2@test.com','$argon2id$v=19$m=65536,t=3,p=4$nn6tCIS7RYj6Qwja8+K4Rg$JXQ1XIFzZYNC6NwYPUWOZdhBVUvQ7irZOvv16V9X1lQ',NULL,'user'),(24,'native','test','test3@test.com','$argon2id$v=19$m=65536,t=3,p=4$ZvO0Ek0NacB3VcQMf50ObA$/+ZQuqhUz1f5WiyV/PppNkF5t4i8Gd95rW18Y7evNSc',NULL,'user'),(25,'native','test','test4@test.com','$argon2id$v=19$m=65536,t=3,p=4$JFwK2WrnpdzR0QVqOln4OA$/+iijtJClfdyf6G6zDfiRZ6C1mr6oj5NThlNVYgVCHc',NULL,'user'),(26,'native','test','test5@test.com','$argon2id$v=19$m=65536,t=3,p=4$4DHcktcyJsck43BBgy/BxA$lvyjN3zxDH3CpnBJfEJUnXD6yjnnYxMIH/Hqo1HFZEs',NULL,'user');
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

-- Dump completed on 2023-10-17 21:53:06
