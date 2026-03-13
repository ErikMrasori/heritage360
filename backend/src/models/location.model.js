const { pool } = require("../config/db");

function mapLocationRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    city: row.city,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    categoryId: row.category_id,
    categoryName: row.category_name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: row.media || []
  };
}

async function findAll({ search, categoryId, limit, offset }) {
  const values = [search ? `%${search}%` : null, categoryId || null, limit, offset];
  const query = `
    SELECT
      l.id, l.title, l.description, l.city, l.address, l.latitude, l.longitude, l.category_id,
      l.created_by, l.created_at, l.updated_at, c.name AS category_name,
      COALESCE(
        json_agg(
          json_build_object(
            'id', lm.id,
            'mediaType', lm.media_type,
            'mediaUrl', lm.media_url,
            'caption', lm.caption
          )
        ) FILTER (WHERE lm.id IS NOT NULL),
        '[]'
      ) AS media
    FROM locations l
    JOIN categories c ON c.id = l.category_id
    LEFT JOIN location_media lm ON lm.location_id = l.id
    WHERE (
      $1::text IS NULL
      OR l.title ILIKE $1
      OR l.description ILIKE $1
      OR l.city ILIKE $1
      OR l.address ILIKE $1
    )
    AND ($2::bigint IS NULL OR l.category_id = $2)
    GROUP BY l.id, c.name
    ORDER BY l.updated_at DESC, l.created_at DESC
    LIMIT $3 OFFSET $4
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM locations l
    WHERE (
      $1::text IS NULL
      OR l.title ILIKE $1
      OR l.description ILIKE $1
      OR l.city ILIKE $1
      OR l.address ILIKE $1
    )
    AND ($2::bigint IS NULL OR l.category_id = $2)
  `;

  const [rowsResult, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, values.slice(0, 2))
  ]);

  return {
    items: rowsResult.rows.map(mapLocationRow),
    total: countResult.rows[0].total
  };
}

async function findById(id) {
  const query = `
    SELECT
      l.id, l.title, l.description, l.city, l.address, l.latitude, l.longitude, l.category_id,
      l.created_by, l.created_at, l.updated_at, c.name AS category_name,
      COALESCE(
        json_agg(
          json_build_object(
            'id', lm.id,
            'mediaType', lm.media_type,
            'mediaUrl', lm.media_url,
            'caption', lm.caption
          )
        ) FILTER (WHERE lm.id IS NOT NULL),
        '[]'
      ) AS media
    FROM locations l
    JOIN categories c ON c.id = l.category_id
    LEFT JOIN location_media lm ON lm.location_id = l.id
    WHERE l.id = $1
    GROUP BY l.id, c.name
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] ? mapLocationRow(result.rows[0]) : null;
}

async function createLocation(client, payload) {
  const insertLocationQuery = `
    INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;

  const locationResult = await client.query(insertLocationQuery, [
    payload.title,
    payload.description,
    payload.city,
    payload.address,
    payload.latitude,
    payload.longitude,
    payload.categoryId,
    payload.createdBy
  ]);

  const locationId = locationResult.rows[0].id;

  if (payload.media?.length) {
    const mediaInsertQuery = `
      INSERT INTO location_media (location_id, media_type, media_url, caption)
      VALUES ($1, $2, $3, $4)
    `;

    for (const media of payload.media) {
      await client.query(mediaInsertQuery, [locationId, media.mediaType, media.mediaUrl, media.caption || null]);
    }
  }

  return locationId;
}

async function updateLocation(client, id, payload) {
  const updateQuery = `
    UPDATE locations
    SET title = $1, description = $2, city = $3, address = $4, latitude = $5, longitude = $6, category_id = $7, updated_at = NOW()
    WHERE id = $8
  `;

  await client.query(updateQuery, [
    payload.title,
    payload.description,
    payload.city,
    payload.address,
    payload.latitude,
    payload.longitude,
    payload.categoryId,
    id
  ]);

  await client.query("DELETE FROM location_media WHERE location_id = $1", [id]);

  if (payload.media?.length) {
    const mediaInsertQuery = `
      INSERT INTO location_media (location_id, media_type, media_url, caption)
      VALUES ($1, $2, $3, $4)
    `;

    for (const media of payload.media) {
      await client.query(mediaInsertQuery, [id, media.mediaType, media.mediaUrl, media.caption || null]);
    }
  }
}

async function deleteLocation(client, id) {
  await client.query("DELETE FROM locations WHERE id = $1", [id]);
}

module.exports = { findAll, findById, createLocation, updateLocation, deleteLocation };
