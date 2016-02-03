
-- Create the IOTDB Schema
CREATE SCHEMA IOTDB ;
use IOTDB;

-- Create table facts
DROP TABLE Facts;

CREATE TABLE Facts (
    channel VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    day INT NOT NULL,
    week_day INT NOT NULL,
    hour INT NOT NULL,
    minute INT NOT NULL,
    second INT NOT NULL,
    device_group VARCHAR(20) NOT NULL,
    device VARCHAR(20) NOT NULL,
    sensor INT NOT NULL,
    data INT NOT NULL,
    creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create table Device Statistics
DROP TABLE DeviceStatistics;

CREATE TABLE DeviceStatistics (
    device VARCHAR(20),
    sensor INT,
    average FLOAT,
    deviation FLOAT,
    error FLOAT,
    creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create table Announcement
DROP TABLE Announcement;

CREATE TABLE Announcement (
  device VARCHAR(20) NOT NULL PRIMARY KEY,
  lastAnnouncementDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create table Registration
DROP TABLE Registration;

CREATE TABLE Registration (
  device VARCHAR(20) NOT NULL PRIMARY KEY,
  device_group VARCHAR(20),
  memo VARCHAR(1024) NULL,
  registrationDate DATETIME,
  creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the message table
DROP TABLE Messages;

CREATE TABLE Messages (
  ID int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  device VARCHAR(20) NOT NULL,
  sender VARCHAR(20) NOT NULL,
  delivery_type VARCHAR(20) NOT NULL,
  message VARCHAR(1024) NOT NULL,
  readDate DATETIME,
  creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create view DeviceActivity
DROP VIEW DeviceActivity;

CREATE OR REPLACE VIEW DeviceActivity AS
  SELECT   `device`, `hour`, count(*) as updates
  FROM     `Facts`
  WHERE    date(`creationDate`) = date(now())
  GROUP BY `device`, `hour`
  ORDER BY `hour` DESC;

-- Create the view DeviceStatus
DROP VIEW DeviceStatus;

CREATE OR REPLACE VIEW DeviceStatus AS
	select  r.*,  a.lastAnnouncementDate as lastAnnouncementDate,
				  timestampdiff(minute, a.lastAnnouncementDate, now()) as elapsedMinutes,
				  if(r.device_group is null, 'WAITING_APPROVE',
					 if(timestampdiff(minute, a.lastAnnouncementDate, now()) < 5, 'NORMAL',
					   if(timestampdiff(minute, a.lastAnnouncementDate, now()) between 6 and 15, 'WARNING',
						 if(timestampdiff(minute, a.lastAnnouncementDate, now()) > 15, 'FAIL', 'UNKNOWN'
						 )
					   )
					 )
				   ) as status
	from `Registration` as r, `Announcement` as a
	where r.device = a.device;

-- Create the table DeviceHistoryStatus
DROP TABLE DeviceHistoryStatus;

CREATE TABLE DeviceHistoryStatus (status varchar(20) NOT NULL,
    numberOfDevices int NOT NULL, creationDate datetime default now() );


-- Create the table User
DROP TABLE `User`; 

CREATE TABLE `ser` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `role` varchar(45) DEFAULT 'user',
  `hashedPassword` text NOT NULL,
  `salt` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;

