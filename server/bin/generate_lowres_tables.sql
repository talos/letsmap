/* Generate lower resolution tables for Postgres/postgis. */

DROP TABLE IF EXISTS lowres;
CREATE TABLE lowres (
    year SMALLINT,
    n INTEGER,
    resolution SMALLINT
);

SELECT AddGeometryColumn(
    'lowres',
    'geometry',
    4326,
    'POINT',
    2
);

CREATE INDEX lowres_geom ON lowres USING GIST ( geometry );
CREATE INDEX lowres_res_year ON lowres ( resolution, year );

\set minx -73.7003786669091
\set rangex -.3399695202433
\set miny 40.5718835149637
\set rangey .3380437602730

-- todo loop this from 1 to 2056
\set resolution 2056

INSERT INTO lowres (year, n, resolution, geometry)
SELECT year, SUM(n), :resolution,
    ST_SetSRID(ST_Point(
            ((ROUND((((ST_X(geometry_4326) - :minx) / :rangex) * :resolution)::numeric)
                / :resolution) * :rangex) + :minx,
            ((ROUND((((ST_Y(geometry_4326) - :miny) / :rangey) * :resolution)::numeric)
                / :resolution) * :rangey) + :miny
        ),
    4326)
FROM mortgages
GROUP BY year,
        ((ROUND((((ST_X(geometry_4326) - :minx) / :rangex) * :resolution)::numeric)
            / :resolution) * :rangex) + :minx,
        ((ROUND((((ST_Y(geometry_4326) - :miny) / :rangey) * :resolution)::numeric)
            / :resolution) * :rangey) + :miny;

VACUUM ANALYZE lowres (resolution, geometry);

/* Sample queries */
SELECT count(*) from lowres
    WHERE resolution = :resolution;

SELECT count(*), year from lowres
    WHERE resolution = :resolution
    GROUP BY year
    ORDER BY year;

SELECT ST_X(geometry), ST_Y(geometry), n, year from lowres
    WHERE resolution = :resolution AND
        ST_Within(geometry, ST_MakeEnvelope(-73.9, 40.66, -73.84, 40.78, 4326)) ;

SELECT count(*) from lowres
    WHERE resolution = :resolution AND
        ST_Within(geometry, ST_MakeEnvelope(-73.9, 40.66, -73.84, 40.78, 4326)) ;

