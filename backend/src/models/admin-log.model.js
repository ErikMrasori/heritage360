async function createAdminLog(client, { adminId, action, targetTable, targetId }) {
  const query = `
    INSERT INTO admin_logs (admin_id, action, target_table, target_id)
    VALUES ($1, $2, $3, $4)
  `;
  await client.query(query, [adminId, action, targetTable, targetId]);
}

module.exports = { createAdminLog };
