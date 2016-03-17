-- -----------------------------------------------------
-- Releases Table - for OTA Update
-- -----------------------------------------------------
CREATE TABLE `Releases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) DEFAULT NULL,
  `major` int(11) DEFAULT NULL,
  `minor` int(11) DEFAULT NULL,
  `patch` int(11) DEFAULT NULL,
  `prerelease` varchar(20) DEFAULT NULL,
  `fileName` varchar(20) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
