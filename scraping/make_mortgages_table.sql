/*DROP TABLE IF EXISTS records;

CREATE TABLE records (
    `SOURCE` INTEGER PRIMARY KEY,
    `Block` INTEGER,
    `Borough` INTEGER,
    `CRFN` INTEGER,
    `Corrected/ Remarks` VARCHAR,
    `Doc Amount` VARCHAR,
    `Doc ID` INTEGER,
    `Document Type` VARCHAR,
    `Lot` INTEGER,
    `More Party 1/2 Names` VARCHAR,
    `Pages` INTEGER,
    `Partial` VARCHAR,
    `Party 3/ Other` VARCHAR,
    `Party1` VARCHAR,
    `Party2` VARCHAR,
    `Recorded / Filed` VARCHAR,
    `Reel/Pg/File` VARCHAR,
    CONSTRAINT BBL_Doc_ID UNIQUE (Borough, Block, Lot, `Doc ID`)
);

INSERT INTO records (Source)
SELECT DISTINCT Source FROM output;
*/

UPDATE records SET
    Block = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Block'),
    Borough = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Borough'),
    CRFN = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'CRFN'),
    `Corrected/ Remarks` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Corrected/ Remarks'),
    `Doc Amount` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Doc Amount'),
    `Doc ID` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Doc ID'),
    `Document Type` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Document Type'),
    `Lot` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Lot'),
    `More Party 1/2 Names` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'More Party 1/2 Names'),
    `Pages` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Pages'),
    `Partial` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Partial'),
    `Party 3/ Other` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Party 3/ Other'),
    `Party1` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Party1'),
    `Party2` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Party2'),
    `Recorded / Filed` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Recorded / Filed'),
    `Reel/Pg/File` = (SELECT VALUE FROM output WHERE records.SOURCE = output.SOURCE AND NAME = 'Reel/Pg/File');
