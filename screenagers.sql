-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 14, 2022 at 09:31 AM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `screenagers`
--

-- --------------------------------------------------------

--
-- Table structure for table `avatar`
--

CREATE TABLE `avatar` (
  `id` int(11) NOT NULL,
  `top` varchar(50) NOT NULL DEFAULT '""',
  `leftPosition` varchar(50) NOT NULL DEFAULT '""',
  `zIndex` varchar(50) NOT NULL,
  `weight` varchar(50) NOT NULL,
  `height` varchar(50) NOT NULL,
  `backgroundColor` varchar(50) NOT NULL DEFAULT '""',
  `backgroundImage` varchar(150) NOT NULL DEFAULT '""'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `console`
--

CREATE TABLE `console` (
  `id` int(11) NOT NULL,
  `top` varchar(50) NOT NULL DEFAULT '""',
  `leftPosition` varchar(50) NOT NULL DEFAULT '""',
  `zIndex` varchar(50) NOT NULL,
  `weight` varchar(50) NOT NULL,
  `height` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `image`
--

CREATE TABLE `image` (
  `id` int(11) NOT NULL,
  `top` varchar(50) NOT NULL DEFAULT '""',
  `leftPosition` varchar(50) NOT NULL DEFAULT '""',
  `zIndex` varchar(50) NOT NULL,
  `width` varchar(50) NOT NULL,
  `height` varchar(50) NOT NULL,
  `objectFit` varchar(50) NOT NULL DEFAULT '""',
  `backgroundColor` varchar(50) NOT NULL DEFAULT '""',
  `backgroundImage` varchar(150) NOT NULL DEFAULT '""',
  `transform` varchar(50) NOT NULL DEFAULT '""',
  `src` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `image`
--

INSERT INTO `image` (`id`, `top`, `leftPosition`, `zIndex`, `width`, `height`, `objectFit`, `backgroundColor`, `backgroundImage`, `transform`, `src`) VALUES
(1, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables001.jpeg'),
(2, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables002.jpeg'),
(3, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables003.jpeg'),
(4, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables004.jpeg'),
(5, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables005.jpeg'),
(6, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables006.jpeg'),
(7, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables007.jpeg'),
(8, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables008.jpeg'),
(9, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables009.jpeg'),
(10, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables010.jpeg'),
(11, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables011.jpeg'),
(12, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables012.jpeg'),
(13, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables013.jpeg'),
(14, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables014.jpeg'),
(15, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables015.jpeg'),
(16, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables016.jpeg'),
(17, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables017.jpeg'),
(18, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables018.jpeg'),
(19, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables019.jpeg'),
(20, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables020.jpeg'),
(21, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables021.jpeg'),
(22, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables022.jpeg'),
(23, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables023.jpeg'),
(24, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables024.jpeg'),
(25, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables025.jpeg'),
(26, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables026.jpeg'),
(27, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables027.jpeg'),
(28, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables028.jpeg'),
(29, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'Histoire-des-cables029.jpeg'),
(30, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'G03.jpeg'),
(31, '\"\"', '\"\"', '1', '100%', '100%', 'cover', '\"\"', '\"\"', '\"\"', 'shark-cable.gif'),
(32, '\"\"', '\"\"', '1', '100%', '100%', 'contain', '\"\"', '\"\"', '\"\"', 'MateaShark3.jpg'),
(33, '\"\"', '\"\"', '1', '100%', '100%', 'contain', '\"\"', '\"\"', '\"\"', 'Sharkconnection2.gif');

-- --------------------------------------------------------

--
-- Table structure for table `scenes`
--

CREATE TABLE `scenes` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `show_id` int(11) NOT NULL,
  `order_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `scenes`
--

INSERT INTO `scenes` (`id`, `name`, `show_id`, `order_number`) VALUES
(1, 'Cable story', 1, 1),
(2, 'Animation connexion', 1, 2),
(3, 'Google song', 1, 3),
(4, 'Kof93', 1, 4),
(5, 'Mario', 1, 5),
(6, 'Unoriginal song', 1, 6),
(7, 'Fairememe', 1, 7),
(8, 'Youtube Band', 1, 8),
(9, 'Press song', 1, 9),
(10, 'Collective song', 1, 10),
(11, 'END', 1, 11);

-- --------------------------------------------------------

--
-- Table structure for table `shows`
--

CREATE TABLE `shows` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `shows`
--

INSERT INTO `shows` (`id`, `name`) VALUES
(1, 'Screenagers Vol 2');

-- --------------------------------------------------------

--
-- Table structure for table `steps`
--

CREATE TABLE `steps` (
  `id` int(11) NOT NULL,
  `backgroundColor` varchar(50) DEFAULT NULL,
  `image` varchar(50) DEFAULT NULL,
  `video` varchar(50) DEFAULT NULL,
  `text` varchar(50) DEFAULT NULL,
  `stream` varchar(50) DEFAULT NULL,
  `avatar` varchar(50) DEFAULT NULL,
  `console` varchar(50) DEFAULT NULL,
  `scene_id` int(11) NOT NULL,
  `order_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `steps`
--

INSERT INTO `steps` (`id`, `backgroundColor`, `image`, `video`, `text`, `stream`, `avatar`, `console`, `scene_id`, `order_number`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
(2, NULL, '1', NULL, NULL, NULL, NULL, NULL, 1, 2),
(3, NULL, '2', NULL, NULL, NULL, NULL, NULL, 1, 3),
(4, NULL, '3', NULL, NULL, NULL, NULL, NULL, 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `stream`
--

CREATE TABLE `stream` (
  `id` int(11) NOT NULL,
  `top` varchar(50) DEFAULT '""',
  `leftPosition` varchar(50) NOT NULL DEFAULT '""',
  `zIndex` varchar(50) NOT NULL,
  `weight` varchar(50) NOT NULL,
  `height` varchar(50) DEFAULT NULL,
  `objectFit` varchar(50) NOT NULL DEFAULT '""',
  `backgroundImage` varchar(150) NOT NULL DEFAULT '""',
  `transform` varchar(50) NOT NULL DEFAULT '""',
  `deviceId` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `text`
--

CREATE TABLE `text` (
  `id` int(11) NOT NULL,
  `top` varchar(50) NOT NULL,
  `leftPosition` varchar(50) NOT NULL,
  `zIndex` varchar(50) NOT NULL,
  `backgroundColor` varchar(50) NOT NULL DEFAULT '""',
  `color` varchar(50) NOT NULL DEFAULT '""',
  `fontFamily` varchar(50) NOT NULL DEFAULT '""',
  `fontSize` varchar(50) NOT NULL DEFAULT '""',
  `fontWeight` varchar(50) NOT NULL DEFAULT '""',
  `fontStyle` varchar(50) NOT NULL DEFAULT '""',
  `textDecoration` varchar(50) NOT NULL DEFAULT '""',
  `border` varchar(50) NOT NULL DEFAULT '""',
  `transform` varchar(50) NOT NULL DEFAULT '""'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `video`
--

CREATE TABLE `video` (
  `id` int(11) NOT NULL,
  `top` varchar(50) NOT NULL DEFAULT '""',
  `leftPosition` varchar(50) NOT NULL DEFAULT '""',
  `zIndex` varchar(50) NOT NULL,
  `weight` varchar(50) NOT NULL,
  `height` varchar(50) NOT NULL,
  `objectFit` varchar(50) NOT NULL DEFAULT '""',
  `backgroundImage` varchar(150) NOT NULL DEFAULT '""',
  `transform` varchar(50) NOT NULL DEFAULT '""',
  `loopAttribute` tinyint(1) NOT NULL DEFAULT 0,
  `muted` tinyint(1) NOT NULL DEFAULT 0,
  `src` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `avatar`
--
ALTER TABLE `avatar`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `console`
--
ALTER TABLE `console`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scenes`
--
ALTER TABLE `scenes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shows`
--
ALTER TABLE `shows`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `steps`
--
ALTER TABLE `steps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stream`
--
ALTER TABLE `stream`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `text`
--
ALTER TABLE `text`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `avatar`
--
ALTER TABLE `avatar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `console`
--
ALTER TABLE `console`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `image`
--
ALTER TABLE `image`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `scenes`
--
ALTER TABLE `scenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `shows`
--
ALTER TABLE `shows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `steps`
--
ALTER TABLE `steps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stream`
--
ALTER TABLE `stream`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `text`
--
ALTER TABLE `text`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `video`
--
ALTER TABLE `video`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
