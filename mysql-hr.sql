-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: myappdb
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance_breaks`
--

DROP TABLE IF EXISTS `attendance_breaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_breaks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `break_start` datetime NOT NULL,
  `break_end` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_breaks`
--

LOCK TABLES `attendance_breaks` WRITE;
/*!40000 ALTER TABLE `attendance_breaks` DISABLE KEYS */;
INSERT INTO `attendance_breaks` VALUES (1,1,2,'2025-12-02','2025-12-02 21:15:36','2025-12-02 21:25:20','2025-12-02 15:45:36','2025-12-02 15:55:20'),(2,1,2,'2025-12-02','2025-12-02 21:25:24','2025-12-02 21:25:30','2025-12-02 15:55:24','2025-12-02 15:55:30'),(3,1,2,'2025-12-02','2025-12-02 21:26:23','2025-12-02 21:26:35','2025-12-02 15:56:23','2025-12-02 15:56:35'),(4,1,2,'2025-12-02','2025-12-02 21:31:47','2025-12-02 21:31:53','2025-12-02 16:01:47','2025-12-02 16:01:53'),(5,1,2,'2025-12-02','2025-12-02 21:34:39','2025-12-02 21:34:40','2025-12-02 16:04:39','2025-12-02 16:04:40'),(6,1,2,'2025-12-02','2025-12-02 21:40:03','2025-12-02 21:40:07','2025-12-02 16:10:03','2025-12-02 16:10:07'),(7,1,2,'2025-12-02','2025-12-02 21:40:31','2025-12-02 21:40:36','2025-12-02 16:10:31','2025-12-02 16:10:36'),(8,1,2,'2025-12-02','2025-12-02 21:41:22','2025-12-02 21:41:40','2025-12-02 16:11:22','2025-12-02 16:11:40'),(9,1,2,'2025-12-02','2025-12-02 21:52:48','2025-12-02 21:52:49','2025-12-02 16:22:48','2025-12-02 16:22:49'),(10,1,4,'2025-12-02','2025-12-02 22:28:01','2025-12-02 22:28:17','2025-12-02 16:58:01','2025-12-02 16:58:17'),(11,1,4,'2025-12-02','2025-12-02 22:48:30',NULL,'2025-12-02 17:18:30','2025-12-02 17:18:30'),(12,1,2,'2025-12-03','2025-12-03 19:26:29','2025-12-03 19:27:14','2025-12-03 13:56:29','2025-12-03 13:57:14');
/*!40000 ALTER TABLE `attendance_breaks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `work_hours` decimal(5,2) DEFAULT NULL,
  `status` enum('present','absent','leave','half_day') DEFAULT 'present',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `check_in_lat` varchar(50) DEFAULT NULL,
  `check_in_lng` varchar(50) DEFAULT NULL,
  `check_out_lat` varchar(50) DEFAULT NULL,
  `check_out_lng` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (1,1,1,'2025-12-01','2025-12-01 14:49:49','2025-12-01 14:57:54',NULL,'present','2025-12-01 09:19:49',NULL,NULL,NULL,NULL),(2,1,2,'2025-12-01','2025-12-01 16:10:27','2025-12-01 16:10:29',NULL,'present','2025-12-01 10:40:27',NULL,NULL,NULL,NULL),(3,1,2,'2025-12-02','2025-12-02 21:00:37','2025-12-02 21:01:06',0.00,'present','2025-12-02 15:30:37',NULL,NULL,NULL,NULL),(4,1,2,'2025-12-02','2025-12-02 21:18:16',NULL,NULL,'present','2025-12-02 15:48:16',NULL,NULL,NULL,NULL),(5,1,2,'2025-12-02','2025-12-02 21:18:18',NULL,NULL,'present','2025-12-02 15:48:18',NULL,NULL,NULL,NULL),(6,1,2,'2025-12-02','2025-12-02 21:18:20',NULL,NULL,'present','2025-12-02 15:48:20',NULL,NULL,NULL,NULL),(7,1,2,'2025-12-02','2025-12-02 21:18:23',NULL,NULL,'present','2025-12-02 15:48:23',NULL,NULL,NULL,NULL),(8,1,2,'2025-12-02','2025-12-02 21:22:51',NULL,NULL,'present','2025-12-02 15:52:51',NULL,NULL,NULL,NULL),(9,1,2,'2025-12-02','2025-12-02 21:22:52',NULL,NULL,'present','2025-12-02 15:52:52',NULL,NULL,NULL,NULL),(10,1,2,'2025-12-02','2025-12-02 21:22:53',NULL,NULL,'present','2025-12-02 15:52:53',NULL,NULL,NULL,NULL),(11,1,2,'2025-12-02','2025-12-02 21:23:06',NULL,NULL,'present','2025-12-02 15:53:06',NULL,NULL,NULL,NULL),(12,1,2,'2025-12-02','2025-12-02 21:23:06',NULL,NULL,'present','2025-12-02 15:53:06',NULL,NULL,NULL,NULL),(13,1,4,'2025-12-02','2025-12-02 22:27:59','2025-12-02 22:28:19',0.00,'present','2025-12-02 16:57:59',NULL,NULL,NULL,NULL),(14,1,2,'2025-12-03','2025-12-03 18:52:27','2025-12-03 19:26:03',33.00,'present','2025-12-03 13:22:27','28.607531262242194','77.43642726503982','28.607531262242194','77.43642726503982');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_dept_org` (`organization_id`),
  CONSTRAINT `fk_dept_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,'admin',NULL,'active','2025-11-30 13:55:15'),(2,1,'account',NULL,'active','2025-11-30 16:47:09'),(3,1,'Senior developer',NULL,'active','2025-12-01 06:14:31');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_bank_details`
--

DROP TABLE IF EXISTS `employee_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `account_holder` varchar(150) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `account_no` varchar(50) DEFAULT NULL,
  `ifsc` varchar(20) DEFAULT NULL,
  `upi_id` varchar(50) DEFAULT NULL,
  `branch_name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_bank_details`
--

LOCK TABLES `employee_bank_details` WRITE;
/*!40000 ALTER TABLE `employee_bank_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_documents`
--

DROP TABLE IF EXISTS `employee_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `doc_type` varchar(50) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_experience`
--

DROP TABLE IF EXISTS `employee_experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_experience` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_experience`
--

LOCK TABLES `employee_experience` WRITE;
/*!40000 ALTER TABLE `employee_experience` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_experience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_skills`
--

DROP TABLE IF EXISTS `employee_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `skill` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_skills`
--

LOCK TABLES `employee_skills` WRITE;
/*!40000 ALTER TABLE `employee_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `employment_type` enum('full_time','part_time','intern','contract') DEFAULT 'full_time',
  `status` enum('active','terminated','on_leave') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `branch_id` int DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `marital_status` varchar(20) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `emergency_name` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,1,1,'1','brajendra','singh','brajendraaec121@gmail.com','09140592427',2,'admin','2025-11-30','full_time','active','2025-11-30 17:09:35',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,2,NULL,'karan','singh','karan@gmail.com','6589745895',3,'developer','2025-12-01','full_time','active','2025-12-01 10:39:14',NULL,'http://localhost:5000/uploads/profile/1764786536447-WhatsApp Image 2025-12-03 at 1.32.12 PM.jpeg','male',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,3,NULL,'brajendra','singh','brajendraaec@gmail.com','988754878',3,'developer','2025-12-01','full_time','active','2025-12-01 11:00:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,1,4,NULL,'brajendra','singh','urgentitsolution@gmail.com','8547852154',3,'senior','2025-12-01','full_time','active','2025-12-01 13:36:39',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `leave_type` enum('Casual Leave','Sick Leave','Paid Leave','Unpaid Leave') DEFAULT 'Casual Leave',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,1,2,'Casual Leave','2025-12-03','2025-12-04',']','approved','2025-12-03 13:20:56','pp'),(2,1,2,'Paid Leave','2025-12-03','2025-12-04','hiii','pending','2025-12-03 13:59:59',NULL);
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `office_branches`
--

DROP TABLE IF EXISTS `office_branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `office_branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int NOT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `radius` int DEFAULT '200',
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `office_branches`
--

LOCK TABLES `office_branches` WRITE;
/*!40000 ALTER TABLE `office_branches` DISABLE KEYS */;
/*!40000 ALTER TABLE `office_branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `domain` varchar(150) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `contact_email` varchar(150) DEFAULT NULL,
  `contact_phone` varchar(25) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `theme_color` varchar(20) DEFAULT NULL,
  `subscription_plan` enum('free','basic','pro','enterprise') DEFAULT 'free',
  `subscription_status` enum('active','expired','cancelled','trial') DEFAULT 'trial',
  `subscription_start` date DEFAULT NULL,
  `subscription_end` date DEFAULT NULL,
  `trial_end` date DEFAULT NULL,
  `billing_cycle` enum('monthly','yearly') DEFAULT 'monthly',
  `user_limit` int DEFAULT '10',
  `employee_limit` int DEFAULT '50',
  `status` enum('active','inactive') DEFAULT 'active',
  `timezone` varchar(50) DEFAULT 'Asia/Kolkata',
  `owner_user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `office_lat` varchar(50) DEFAULT NULL,
  `office_lng` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_org_owner` (`owner_user_id`),
  CONSTRAINT `fk_org_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'uis','www.urgentitsolution.com','IT Industry','it company',NULL,NULL,'uttar pradesh','india',NULL,'info@urgentitsolution.com','7408142576',NULL,NULL,'free','trial',NULL,NULL,NULL,'monthly',10,50,'active','Asia/Kolkata',1,'2025-11-30 13:52:56','2025-12-01 18:31:16',NULL,NULL);
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('superadmin','org_admin','hr','manager','employee') DEFAULT 'org_admin',
  `organization_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'brajendra','brajendraaec121@gmail.com','$2b$10$X5iLhU/xAdhbikNeX3XukOVTxX1ERGJnSBxuwT7mNFPkLSud/G7xm','2025-11-30 08:32:48','org_admin',1),(2,'karan singh','karan@gmail.com','$2b$10$X5iLhU/xAdhbikNeX3XukOVTxX1ERGJnSBxuwT7mNFPkLSud/G7xm','2025-12-01 10:39:14','employee',1),(3,'brajendra singh','brajendraaec@gmail.com','$2b$10$gvzY7jsGaOWhRNhtiUVRyeD.KH5XnE.x/JiNnYWeNe.tF0O/BeqMq','2025-12-01 11:00:25','employee',1),(4,'brajendra singh','urgentitsolution@gmail.com','$2b$10$X5iLhU/xAdhbikNeX3XukOVTxX1ERGJnSBxuwT7mNFPkLSud/G7xm','2025-12-01 13:36:39','employee',1);
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

-- Dump completed on 2025-12-04 13:10:00
