const { StatusCodes } = require("http-status-codes");
const { pool } = require("../config/db");
const locationModel = require("../models/location.model");
const { createAdminLog } = require("../models/admin-log.model");
const { ApiError } = require("../utils/api-error");

async function getLocations(query) {
  const limit = Math.min(Number(query.limit || 12), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;

  return locationModel.findAll({
    search: query.search?.trim() || "",
    categoryId: query.categoryId ? Number(query.categoryId) : null,
    limit,
    offset
  });
}

async function getLocationById(id) {
  const location = await locationModel.findById(id);
  if (!location) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Location not found.");
  }
  return location;
}

async function createLocation(payload, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Keep location creation and admin audit logging in one transaction.
    const locationId = await locationModel.createLocation(client, {
      ...payload,
      createdBy: adminId
    });
    await createAdminLog(client, {
      adminId,
      action: "CREATE",
      targetTable: "locations",
      targetId: locationId
    });
    await client.query("COMMIT");
    return getLocationById(locationId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateLocation(id, payload, adminId) {
  await getLocationById(id);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Replacing media inside the same transaction prevents partial updates.
    await locationModel.updateLocation(client, id, payload);
    await createAdminLog(client, {
      adminId,
      action: "UPDATE",
      targetTable: "locations",
      targetId: id
    });
    await client.query("COMMIT");
    return getLocationById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteLocation(id, adminId) {
  await getLocationById(id);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await locationModel.deleteLocation(client, id);
    await createAdminLog(client, {
      adminId,
      action: "DELETE",
      targetTable: "locations",
      targetId: id
    });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getLocations, getLocationById, createLocation, updateLocation, deleteLocation };
