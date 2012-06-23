.mode tabs

DROP TABLE IF EXISTS output;

CREATE TABLE output (
    SCOPE INTEGER PRIMARY KEY,
    SOURCE INTEGER,
    ONE_TO_MANY BOOLEAN,
    NAME VARCHAR,
    VALUE VARCHAR
);

.import output.txt output

