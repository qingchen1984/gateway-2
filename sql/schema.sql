CREATE SCHEMA IOTDB ;
use IOTDB;
-- Create table facts
CREATE TABLE Facts (
    fact VARCHAR(50),
    year INT,
    month INT,
    day INT,
    week_day INT,
    hour INT,
    minute INT,
    second INT,
    device_group INT,
    device INT,
    sensor INT,
    data INT,
    creationDate DATETIME
);

-- Create table Device Statistics
CREATE TABLE DeviceStatistics (
    device INT,
    sensor INT,
    average FLOAT,
    deviation FLOAT,
    error FLOAT,
    creationDate DATETIME
);
