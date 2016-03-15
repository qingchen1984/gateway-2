-- -----------------------------------------------------
-- Schema IOTDB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `IOTDB`;
USE `IOTDB` ;

-- -----------------------------------------------------
-- Table `Announcement`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Announcement` ;

CREATE TABLE IF NOT EXISTS `Announcement` (
    `device` VARCHAR(20) NOT NULL,
    `lastAnnouncementDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`device`)
);



-- -----------------------------------------------------
-- Table `DeviceHistoryStatus`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `DeviceHistoryStatus` ;

CREATE TABLE IF NOT EXISTS `DeviceHistoryStatus` (
    `status` VARCHAR(20) NOT NULL,
    `numberOfDevices` INT(11) NOT NULL,
    `creationDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);


-- -----------------------------------------------------
-- Table `DeviceStatistics`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `DeviceStatistics` ;

CREATE TABLE IF NOT EXISTS `DeviceStatistics` (
    `device` VARCHAR(20) NULL DEFAULT NULL,
    `sensor` INT(11) NULL DEFAULT NULL,
    `average` FLOAT NULL DEFAULT NULL,
    `deviation` FLOAT NULL DEFAULT NULL,
    `error` FLOAT NULL DEFAULT NULL,
    `creationDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- -----------------------------------------------------
-- Table `Facts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Facts` ;

CREATE TABLE IF NOT EXISTS `Facts` (
    `channel` VARCHAR(50) NOT NULL,
    `year` INT(11) NOT NULL,
    `month` INT(11) NOT NULL,
    `day` INT(11) NOT NULL,
    `week_day` INT(11) NOT NULL,
    `hour` INT(11) NOT NULL,
    `minute` INT(11) NOT NULL,
    `second` INT(11) NOT NULL,
    `device_group` VARCHAR(20) NOT NULL,
    `device` VARCHAR(20) NOT NULL,
    `sensor` INT(11) NOT NULL,
    `data` INT(11) NOT NULL,
    `creationDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_Facts_channel_year_month_day_hour_minute_second_device` (`channel` ASC , `year` ASC , `month` ASC , `day` ASC , `hour` ASC , `minute` ASC , `second` ASC , `device` ASC)
);



-- -----------------------------------------------------
-- Table `Messages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Messages` ;

CREATE TABLE IF NOT EXISTS `Messages` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `device` VARCHAR(20) NOT NULL,
    `sender` VARCHAR(20) NOT NULL,
    `delivery_type` VARCHAR(20) NOT NULL,
    `message` VARCHAR(1024) NOT NULL,
    `readDate` TIMESTAMP NULL DEFAULT NULL,
    `creationDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`ID`)
);


-- -----------------------------------------------------
-- Table `Registration`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Registration` ;

CREATE TABLE IF NOT EXISTS `Registration` (
    `device` VARCHAR(20) NOT NULL,
    `device_group` VARCHAR(20) NULL DEFAULT NULL,
    `registrationDate` TIMESTAMP NULL DEFAULT NULL,
    `creationDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `memo` VARCHAR(1024) NULL DEFAULT NULL,
    `type` VARCHAR(20) NULL,
    PRIMARY KEY (`device`)
);


-- -----------------------------------------------------
-- Table `User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `User` ;

CREATE TABLE IF NOT EXISTS `User` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `role` VARCHAR(45) NULL DEFAULT 'user',
    `password` TEXT NOT NULL,
    `salt` TEXT NULL DEFAULT NULL,
    PRIMARY KEY (`ID`),
    UNIQUE INDEX `email` (`email` ASC)
);

-- -----------------------------------------------------
-- Placeholder table for view `DeviceActivity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DeviceActivity` (
    `device` INT,
    `hour` INT,
    `updates` INT
);

-- -----------------------------------------------------
-- Placeholder table for view `DeviceStatus`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DeviceStatus` (
    `device` INT,
    `device_group` INT,
    `registrationDate` INT,
    `creationDate` INT,
    `memo` INT,
    `lastAnnouncementDate` INT,
    `elapsedMinutes` INT,
    `status` INT
);

-- -----------------------------------------------------
-- View `DeviceActivity`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `DeviceActivity` ;
DROP TABLE IF EXISTS `DeviceActivity`;
CREATE OR REPLACE SQL SECURITY DEFINER
VIEW `DeviceActivity` AS
    SELECT
        `Facts`.`device` AS `device`,
        `Facts`.`hour` AS `hour`,
        COUNT(0) AS `updates`
    FROM
        `Facts`
    WHERE
        (CAST(`Facts`.`creationDate` AS DATE) = CAST(NOW() AS DATE))
    GROUP BY `Facts`.`device` , `Facts`.`hour`
    ORDER BY `Facts`.`hour` DESC;

-- -----------------------------------------------------
-- View `DeviceStatus`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `DeviceStatus` ;
DROP TABLE IF EXISTS `DeviceStatus`;
CREATE OR REPLACE SQL SECURITY DEFINER
VIEW `DeviceStatus` AS
    SELECT
        `r`.`device` AS `device`,
        `r`.`device_group` AS `device_group`,
        `r`.`registrationDate` AS `registrationDate`,
        `r`.`creationDate` AS `creationDate`,
        `r`.`memo` AS `memo`,
        `r`.`type` AS `type`,
        `a`.`lastAnnouncementDate` AS `lastAnnouncementDate`,
        TIMESTAMPDIFF(MINUTE,
            `a`.`lastAnnouncementDate`,
            NOW()) AS `elapsedMinutes`,
        IF(ISNULL(`r`.`device_group`),
            'WAITING_APPROVE',
            IF((TIMESTAMPDIFF(MINUTE,
                    `a`.`lastAnnouncementDate`,
                    NOW()) < 5),
                'NORMAL',
                IF((TIMESTAMPDIFF(MINUTE,
                        `a`.`lastAnnouncementDate`,
                        NOW()) BETWEEN 6 AND 15),
                    'WARNING',
                    IF((TIMESTAMPDIFF(MINUTE,
                            `a`.`lastAnnouncementDate`,
                            NOW()) > 15),
                        'FAIL',
                        'UNKNOWN')))) AS `status`
    FROM
        (`Registration` `r`
        LEFT JOIN `Announcement` `a` ON ((`r`.`device` = `a`.`device`)));
