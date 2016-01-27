CREATE FUNCTION `F_DEVICE_STATUS` (lastAnnouncementDate timestamp, warning int, fail int)
RETURNS varchar(20)
BEGIN
  DECLARE s VARCHAR(20);
  IF timestampdiff( minute, lastAnnouncementDate, now() ) < warning
  THEN
   SET s = 'NORMAL';
  END IF;
  RETURN s;
END
