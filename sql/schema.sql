
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
  registrationDate DATETIME,
  creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  memo VARCHAR(200) NULL
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
