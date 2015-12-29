-- Create table facts
CREATE TABLE Facts ( fact   varchar(50),
                     year   int,
                     month  int,
                     day          int,
                     week_day    int,
                     hour         int,
                     minute       int,
                     second      int,
                     group      int,
                     device    int,
                     sensor     int,
                     data        int,
                     creationDate datetime );

-- Create table Device Statistics
CREATE TABLE DeviceStatistics ( device     int,
                                  sensor     int,
                                  average     float,
                                  deviation       float,
                                  error         float,
                                  creationDate datetime);
