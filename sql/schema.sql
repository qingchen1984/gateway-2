
-- Create the IOTDB Schema
CREATE SCHEMA IOTDB ;
use IOTDB;

-- Create table facts
CREATE TABLE Facts (
    fact VARCHAR(50) NOT NULL,
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
    creationDate DATETIME NOT NULL
);

-- Create table Device Statistics
CREATE TABLE DeviceStatistics (
    device VARCHAR(20),
    sensor INT,
    average FLOAT,
    deviation FLOAT,
    error FLOAT,
    creationDate DATETIME
);

-- Create table Announcement
CREATE TABLE Announcement (
  device VARCHAR(20) NOT NULL,
  lastAnnouncementDate DATETIME
)

-- Create table Registration
CREATE TABLE Registration (
  device_group VARCHAR(20),
  device VARCHAR(20),
  registrationDate DATETIME
)
