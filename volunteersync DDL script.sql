-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jan 09, 2026 at 01:52 AM
-- Server version: 5.7.24
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `volunteersync`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `log_id` bigint(20) NOT NULL,
  `occurred_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor_user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(30) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `certificate_id` int(11) NOT NULL,
  `signup_id` int(11) NOT NULL,
  `certificate_uid` char(12) NOT NULL,
  `verification_hash` char(64) NOT NULL,
  `issued_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `signed_by` int(11) DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `email_notifications`
--

CREATE TABLE `email_notifications` (
  `notification_id` int(11) NOT NULL,
  `signup_id` int(11) NOT NULL,
  `notification_type` enum('REMINDER_7D','REMINDER_24H') NOT NULL,
  `scheduled_for` datetime DEFAULT NULL,
  `status` enum('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  `attempt_count` int(11) NOT NULL DEFAULT '0',
  `last_attempt_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `provider_message_id` varchar(255) DEFAULT NULL,
  `error_message` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `event_length_hours` int(11) DEFAULT '1',
  `location_name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(2) NOT NULL,
  `num_needed` int(11) NOT NULL,
  `num_signed_up` int(11) DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `event_attendance`
--

CREATE TABLE `event_attendance` (
  `attendance_id` int(11) NOT NULL,
  `signup_id` int(11) NOT NULL,
  `marked_by` int(11) NOT NULL,
  `marked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `hours` decimal(5,2) DEFAULT NULL,
  `status` enum('completed','no_show','excused') NOT NULL DEFAULT 'completed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `event_tags`
--

CREATE TABLE `event_tags` (
  `event_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `channel` enum('email','in_app') NOT NULL DEFAULT 'email',
  `subject` varchar(150) NOT NULL,
  `body` text NOT NULL,
  `related_event_id` int(11) DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `organization_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `contact_email` varchar(100) NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `signups`
--

CREATE TABLE `signups` (
  `signup_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `signup_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('registered','canceled') NOT NULL DEFAULT 'registered'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `support_messages`
--

CREATE TABLE `support_messages` (
  `message_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `is_resolved` tinyint(1) DEFAULT '0',
  `responded_by` int(11) DEFAULT NULL,
  `response_message` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `responded_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `tag_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('volunteer','organizer','admin') NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `organization_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `user_follow_organizations`
--

CREATE TABLE `user_follow_organizations` (
  `user_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `followed_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `user_follow_tags`
--

CREATE TABLE `user_follow_tags` (
  `user_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `followed_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_time` (`occurred_at`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_actor` (`actor_user_id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certificate_id`),
  ADD UNIQUE KEY `uniq_cert_signup` (`signup_id`),
  ADD UNIQUE KEY `uniq_cert_uid` (`certificate_uid`),
  ADD UNIQUE KEY `uniq_cert_hash` (`verification_hash`),
  ADD KEY `idx_signed_by` (`signed_by`);

--
-- Indexes for table `email_notifications`
--
ALTER TABLE `email_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD UNIQUE KEY `uq_signup_type` (`signup_id`,`notification_type`),
  ADD KEY `idx_status_scheduled` (`status`,`scheduled_for`),
  ADD KEY `idx_signup` (`signup_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD UNIQUE KEY `unique_event_constraint` (`organization_id`,`event_date`,`event_time`,`location_name`,`title`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_event_city_state` (`city`,`state`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_event_org` (`organization_id`),
  ADD KEY `idx_org_date` (`organization_id`,`event_date`),
  ADD KEY `idx_city_state_date` (`city`,`state`,`event_date`);

--
-- Indexes for table `event_attendance`
--
ALTER TABLE `event_attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uniq_signup_attendance` (`signup_id`),
  ADD KEY `idx_marked_by` (`marked_by`);

--
-- Indexes for table `event_tags`
--
ALTER TABLE `event_tags`
  ADD PRIMARY KEY (`event_id`,`tag_id`),
  ADD KEY `idx_tag_event` (`tag_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notif_user` (`user_id`),
  ADD KEY `idx_notif_event` (`related_event_id`),
  ADD KEY `idx_notif_status` (`status`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`organization_id`),
  ADD UNIQUE KEY `unique_organization_name` (`name`),
  ADD KEY `idx_org_approval` (`approval_status`,`approved_at`),
  ADD KEY `fk_org_approved_by` (`approved_by`);

--
-- Indexes for table `signups`
--
ALTER TABLE `signups`
  ADD PRIMARY KEY (`signup_id`),
  ADD UNIQUE KEY `unique_user_event` (`user_id`,`event_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `support_messages`
--
ALTER TABLE `support_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `responded_by` (`responded_by`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `uniq_tag_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `unique_user_email` (`email`),
  ADD KEY `fk_user_organization` (`organization_id`);

--
-- Indexes for table `user_follow_organizations`
--
ALTER TABLE `user_follow_organizations`
  ADD PRIMARY KEY (`user_id`,`organization_id`),
  ADD KEY `idx_ufo_org` (`organization_id`);

--
-- Indexes for table `user_follow_tags`
--
ALTER TABLE `user_follow_tags`
  ADD PRIMARY KEY (`user_id`,`tag_id`),
  ADD KEY `idx_uft_tag` (`tag_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `log_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `email_notifications`
--
ALTER TABLE `email_notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=230;

--
-- AUTO_INCREMENT for table `event_attendance`
--
ALTER TABLE `event_attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1008;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `organization_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `signups`
--
ALTER TABLE `signups`
  MODIFY `signup_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1664;

--
-- AUTO_INCREMENT for table `support_messages`
--
ALTER TABLE `support_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_cert_signed_by` FOREIGN KEY (`signed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cert_signup` FOREIGN KEY (`signup_id`) REFERENCES `signups` (`signup_id`) ON DELETE CASCADE;

--
-- Constraints for table `email_notifications`
--
ALTER TABLE `email_notifications`
  ADD CONSTRAINT `fk_email_notifications_signup` FOREIGN KEY (`signup_id`) REFERENCES `signups` (`signup_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `event_attendance`
--
ALTER TABLE `event_attendance`
  ADD CONSTRAINT `fk_attendance_markedby` FOREIGN KEY (`marked_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_attendance_signup` FOREIGN KEY (`signup_id`) REFERENCES `signups` (`signup_id`) ON DELETE CASCADE;

--
-- Constraints for table `event_tags`
--
ALTER TABLE `event_tags`
  ADD CONSTRAINT `fk_et_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_et_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_event` FOREIGN KEY (`related_event_id`) REFERENCES `events` (`event_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `organizations`
--
ALTER TABLE `organizations`
  ADD CONSTRAINT `fk_org_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `signups`
--
ALTER TABLE `signups`
  ADD CONSTRAINT `signups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signups_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE;

--
-- Constraints for table `support_messages`
--
ALTER TABLE `support_messages`
  ADD CONSTRAINT `support_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_messages_ibfk_2` FOREIGN KEY (`responded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE SET NULL;

--
-- Constraints for table `user_follow_organizations`
--
ALTER TABLE `user_follow_organizations`
  ADD CONSTRAINT `fk_ufo_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ufo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_follow_tags`
--
ALTER TABLE `user_follow_tags`
  ADD CONSTRAINT `fk_uft_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_uft_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
