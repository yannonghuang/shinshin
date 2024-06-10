ALTER TABLE nodedb.projects
ADD COLUMN quantity1 int, 
ADD COLUMN quantity2 int, 
ADD COLUMN quantity3 int;

ALTER TABLE nodedb.surveys
CHANGE COLUMN stayBehindCount stayBehindCount VARCHAR(15);
