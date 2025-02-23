-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 19. Feb 2025 um 17:53
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `school_surveys`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `access_codes`
--

CREATE TABLE `access_codes` (
  `id` int(11) NOT NULL,
  `user_type` enum('student','teacher') NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `access_codes`
--

INSERT INTO `access_codes` (`id`, `user_type`, `password_hash`, `last_updated`) VALUES
(1, 'student', '$2y$10$laBqjVWofRueyDOsu2K7tulyD1oSCeqVzecSc408PgKlzIPZBNBG2', '2025-02-17 16:51:24'),
(2, 'teacher', '$2y$10$vz3.O.izNwNBt8bIb8pNeuVS1QbkaRE4/xdiduXbrVs3SEYHfo/De', '2025-02-17 16:51:24');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'info',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `activity_log`
--

INSERT INTO `activity_log` (`id`, `type`, `description`, `ip_address`, `status`, `timestamp`) VALUES
(1, '', 'Survey #2 status updated to active', NULL, 'info', '2025-02-18 15:48:35'),
(2, '', 'Survey #3 status updated to completed', NULL, 'info', '2025-02-18 15:48:36'),
(3, '', 'Survey #45 status updated to active', NULL, 'info', '2025-02-18 15:48:38'),
(4, '', 'Survey #45 status updated to completed', NULL, 'info', '2025-02-18 16:09:44'),
(5, '', 'Survey #45 status updated to pending', NULL, 'info', '2025-02-18 16:09:45'),
(6, '', 'Survey #45 status updated to active', NULL, 'info', '2025-02-18 16:09:45'),
(7, '', 'Survey #45 status updated to completed', NULL, 'info', '2025-02-18 21:08:44'),
(8, '', 'Survey #2 status updated to completed', NULL, 'info', '2025-02-18 21:08:45'),
(9, '', 'Survey #46 status updated to active', NULL, 'info', '2025-02-18 21:16:18'),
(10, '', 'Survey #46 status updated to completed', NULL, 'info', '2025-02-18 21:16:30'),
(11, '', 'Survey #46 status updated to pending', NULL, 'info', '2025-02-19 07:02:12'),
(12, '', 'Survey #46 status updated to active', NULL, 'info', '2025-02-19 07:02:13'),
(13, '', 'Survey #51 status updated to active', NULL, 'info', '2025-02-19 08:02:41'),
(14, '', 'Survey #50 status updated to active', NULL, 'info', '2025-02-19 08:02:42'),
(15, '', 'Survey #50 status updated to completed', NULL, 'info', '2025-02-19 08:02:58'),
(16, '', 'Survey #51 status updated to completed', NULL, 'info', '2025-02-19 08:02:59'),
(17, '', 'Survey #51 status updated to pending', NULL, 'info', '2025-02-19 13:29:34'),
(18, '', 'Survey #51 status updated to active', NULL, 'info', '2025-02-19 13:32:27'),
(19, '', 'Survey #50 status updated to pending', NULL, 'info', '2025-02-19 13:32:29'),
(20, '', 'Survey #51 status updated to completed', NULL, 'info', '2025-02-19 13:33:20'),
(21, '', 'Survey #51 status updated to pending', NULL, 'info', '2025-02-19 13:34:17'),
(22, '', 'Survey #52 status updated to active', NULL, 'info', '2025-02-19 13:35:57'),
(23, '', 'Survey #54 status updated to active', NULL, 'info', '2025-02-19 13:38:37'),
(24, '', 'Survey #54 status updated to completed', NULL, 'info', '2025-02-19 13:38:37'),
(25, '', 'Survey #54 status updated to pending', NULL, 'info', '2025-02-19 13:38:38'),
(26, '', 'Survey #54 status updated to active', NULL, 'info', '2025-02-19 13:38:39'),
(27, '', 'Survey #54 status updated to completed', NULL, 'info', '2025-02-19 13:38:40'),
(28, '', 'Survey #54 status updated to pending', NULL, 'info', '2025-02-19 13:38:40'),
(29, '', 'Survey #54 status updated to active', NULL, 'info', '2025-02-19 13:38:41'),
(30, '', 'Survey #54 status updated to completed', NULL, 'info', '2025-02-19 13:38:41'),
(31, '', 'Survey #54 status updated to pending', NULL, 'info', '2025-02-19 13:38:42'),
(32, '', 'Survey #54 status updated to active', NULL, 'info', '2025-02-19 13:38:43'),
(33, '', 'Survey #54 status updated to completed', NULL, 'info', '2025-02-19 13:38:51'),
(34, '', 'Survey #54 status updated to pending', NULL, 'info', '2025-02-19 13:38:52'),
(35, '', 'Survey #54 status updated to active', NULL, 'info', '2025-02-19 13:38:53'),
(36, '', 'Survey #54 status updated to completed', NULL, 'info', '2025-02-19 13:38:53'),
(37, '', 'Survey #53 status updated to active', NULL, 'info', '2025-02-19 13:38:54'),
(38, '', 'Survey #53 status updated to completed', NULL, 'info', '2025-02-19 13:38:55'),
(39, '', 'Survey #53 status updated to pending', NULL, 'info', '2025-02-19 13:38:55'),
(40, '', 'Survey #53 status updated to active', NULL, 'info', '2025-02-19 13:38:55'),
(41, '', 'Survey #55 status updated to active', NULL, 'info', '2025-02-19 13:53:45'),
(42, '', 'Survey #55 status updated to completed', NULL, 'info', '2025-02-19 13:53:45'),
(43, '', 'Survey #55 status updated to pending', NULL, 'info', '2025-02-19 13:53:46'),
(44, '', 'Survey #54 status updated to pending', NULL, 'info', '2025-02-19 13:59:08'),
(45, '', 'Survey #54 status updated to active', NULL, 'info', '2025-02-19 13:59:09'),
(46, '', 'Survey #54 status updated to completed', NULL, 'info', '2025-02-19 13:59:09'),
(47, '', 'Survey #55 status updated to active', NULL, 'info', '2025-02-19 14:03:27'),
(48, '', 'Survey #54 status updated to pending', NULL, 'info', '2025-02-19 14:03:28'),
(49, '', 'Survey #55 status updated to completed', NULL, 'info', '2025-02-19 14:03:35'),
(50, 'survey_creation', 'Student survey created: \'tzesrizt\'', '::1', 'info', '2025-02-19 14:34:30'),
(51, 'survey_creation', 'Student survey created: \'Penis\'', '::1', 'info', '2025-02-19 14:58:11'),
(52, '', 'Survey #57 status updated to active', NULL, 'info', '2025-02-19 14:58:22'),
(53, '', 'Survey #57 status updated to completed', NULL, 'info', '2025-02-19 15:15:25'),
(54, 'status_update', 'Survey #57 status updated to pending', '::1', 'info', '2025-02-19 15:22:24'),
(55, 'status_update', 'Survey #57 status updated to active', '::1', 'info', '2025-02-19 15:22:33'),
(56, 'status_update', 'Survey #57 status updated to completed', '::1', 'info', '2025-02-19 15:22:35'),
(57, 'survey_creation', 'Student survey created: \'Test 1\'', '::1', 'info', '2025-02-19 15:23:17'),
(58, 'survey_creation', 'Student survey created: \'Test 2\'', '::1', 'info', '2025-02-19 15:23:28'),
(59, 'survey_creation', 'Student survey created: \'Test 3\'', '::1', 'info', '2025-02-19 15:23:40'),
(60, 'status_update', 'Survey #58 status updated to active', '::1', 'info', '2025-02-19 15:23:49'),
(61, 'status_update', 'Survey #58 status updated to completed', '::1', 'info', '2025-02-19 15:23:58'),
(62, 'status_update', 'Survey #59 status updated to active', '::1', 'info', '2025-02-19 15:24:07'),
(63, 'status_update', 'Survey #60 status updated to active', '::1', 'info', '2025-02-19 15:24:17'),
(64, 'status_update', 'Survey #60 status updated to completed', '::1', 'info', '2025-02-19 15:35:38'),
(65, 'status_update', 'Survey #59 status updated to completed', '::1', 'info', '2025-02-19 15:35:39'),
(66, 'status_update', 'Survey #60 status updated to pending', '::1', 'info', '2025-02-19 15:35:51'),
(67, 'status_update', 'Survey #60 status updated to active', '::1', 'info', '2025-02-19 15:35:52'),
(68, 'status_update', 'Survey #59 status updated to pending', '::1', 'info', '2025-02-19 15:36:01'),
(69, 'status_update', 'Survey #59 status updated to active', '::1', 'info', '2025-02-19 15:36:02'),
(70, 'status_update', 'Survey #60 status updated to completed', '::1', 'info', '2025-02-19 16:35:06');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `created_at`) VALUES
(1, 'admin', '$2y$12$HiIJztWmZDYUgktE9w2rm.dkMWxGiFGeMKlDqzloTWOm1v94B40ra', '2025-02-18 10:55:18');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `error_log`
--

CREATE TABLE `error_log` (
  `id` int(11) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `severity` enum('error','warning','notice','info') NOT NULL DEFAULT 'info',
  `message` text NOT NULL,
  `file` varchar(255) DEFAULT NULL,
  `line` int(11) DEFAULT NULL,
  `trace` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_type` enum('student','teacher') NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `status` enum('success','failed') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_type`, `ip_address`, `status`, `timestamp`) VALUES
(1, 'student', '::1', 'success', '2025-02-17 16:52:28'),
(2, 'student', '::1', 'success', '2025-02-17 16:55:27'),
(3, 'student', '::1', 'success', '2025-02-17 16:59:56'),
(4, 'teacher', '::1', 'success', '2025-02-17 17:00:40'),
(5, 'student', '::1', 'success', '2025-02-17 17:01:33'),
(6, 'student', '::1', 'success', '2025-02-17 17:05:01'),
(7, 'student', '::1', 'success', '2025-02-17 17:05:11');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `rate_limits`
--

CREATE TABLE `rate_limits` (
  `id` int(11) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `action` varchar(32) NOT NULL,
  `timestamp` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `rate_limits`
--

INSERT INTO `rate_limits` (`id`, `ip`, `action`, `timestamp`) VALUES
(57, '::1', 'login', 1739974095);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `responses`
--

CREATE TABLE `responses` (
  `id` int(11) NOT NULL,
  `survey_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `answer` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `responses`
--

INSERT INTO `responses` (`id`, `survey_id`, `session_id`, `answer`, `created_at`) VALUES
(1, 6, 'hdatj6ts8aje7npq8tqi1hb77d', 1, '2025-02-17 17:04:45'),
(2, 6, 'cm3bbqt4gns8ri6m6counoe3bm', 1, '2025-02-17 17:05:03'),
(3, 6, 'frsv1alevoagnac8ug7pou2du2', 1, '2025-02-18 07:01:06'),
(4, 5, 'frsv1alevoagnac8ug7pou2du2', 1, '2025-02-18 07:02:29');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `surveys`
--

CREATE TABLE `surveys` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','active','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `yes_votes` int(11) DEFAULT 0,
  `no_votes` int(11) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `type` varchar(20) DEFAULT 'yes-no',
  `tag` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `surveys`
--

INSERT INTO `surveys` (`id`, `title`, `description`, `status`, `created_at`, `updated_at`, `yes_votes`, `no_votes`, `completed_at`, `type`, `tag`) VALUES
(58, 'Test 1', 'Test Umfrage 1', 'completed', '2025-02-19 15:23:17', '2025-02-19 15:23:58', 0, 0, '2025-02-19 15:23:58', 'yes-no', 'student'),
(59, 'Test 2', 'Test Umfrage 2', 'active', '2025-02-19 15:23:28', '2025-02-19 15:36:02', 0, 0, NULL, 'yes-no', 'student'),
(60, 'Test 3', 'Test Umfrage 3', 'completed', '2025-02-19 15:23:40', '2025-02-19 16:35:06', 0, 0, '2025-02-19 16:35:06', 'yes-no', 'student');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_type` enum('student','teacher') NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `user_type`, `password_hash`, `created_at`) VALUES
(1, 'teacher', '$2y$12$d2v6Z7ILXR6PTOA5HkLxcuDyEM0dbcPOtD7A1F97hRPd5iw5a53JS', '2025-02-18 09:51:50'),
(2, 'student', '$2y$12$qksXKKDceL3JR4be6d1LNeUp7Qf8zVfALVA9BpeE5R/kJG9KPlaVS', '2025-02-18 09:51:50');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `votes`
--

CREATE TABLE `votes` (
  `id` int(11) NOT NULL,
  `survey_id` int(11) NOT NULL,
  `vote` tinyint(1) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `votes`
--

INSERT INTO `votes` (`id`, `survey_id`, `vote`, `ip_address`, `created_at`) VALUES
(1, 45, 1, '::1', '2025-02-18 20:59:57'),
(2, 2, 1, '::1', '2025-02-18 21:00:11'),
(3, 46, 1, '::1', '2025-02-18 21:16:22'),
(4, 51, 1, '::1', '2025-02-19 08:02:47'),
(5, 50, 0, '::1', '2025-02-19 08:02:55'),
(6, 53, 1, '::1', '2025-02-19 14:03:05'),
(9, 52, 1, '::1', '2025-02-19 14:03:15'),
(10, 55, 1, '::1', '2025-02-19 14:03:33'),
(11, 57, 1, '::1', '2025-02-19 15:04:47'),
(12, 58, 1, '::1', '2025-02-19 15:23:54'),
(13, 59, 0, '::1', '2025-02-19 15:24:14');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `access_codes`
--
ALTER TABLE `access_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indizes für die Tabelle `error_log`
--
ALTER TABLE `error_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_severity` (`severity`);

--
-- Indizes für die Tabelle `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `rate_limits`
--
ALTER TABLE `rate_limits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip_action` (`ip`,`action`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Indizes für die Tabelle `responses`
--
ALTER TABLE `responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_id` (`survey_id`);

--
-- Indizes für die Tabelle `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_vote` (`survey_id`,`ip_address`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `access_codes`
--
ALTER TABLE `access_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT für Tabelle `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `error_log`
--
ALTER TABLE `error_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT für Tabelle `rate_limits`
--
ALTER TABLE `rate_limits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT für Tabelle `responses`
--
ALTER TABLE `responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `surveys`
--
ALTER TABLE `surveys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
