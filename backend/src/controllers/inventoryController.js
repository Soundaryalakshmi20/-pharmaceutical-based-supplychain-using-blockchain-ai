const inventoryService = require('../services/inventoryService');
const { sendSuccess } = require('../utils/response');

// GET /api/inventory — packs held by the caller's organisation (admins: all)
exports.list = async (req, res, next) => {
  try {
    const organizationId =
      req.query.organizationId || (req.user && req.user.role !== 'ADMIN' ? req.user.organizationId : null);
    const rows = await inventoryService.listInventory({ ...req.query, organizationId });
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/stock — quantity rows (org + batch)
exports.stock = async (req, res, next) => {
  try {
    const organizationId =
      req.query.organizationId || (req.user && req.user.role !== 'ADMIN' ? req.user.organizationId : null);
    const rows = await inventoryService.getStock({ organizationId });
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/receive  { serialNumber }
exports.receive = async (req, res, next) => {
  try {
    const organizationId = req.body.organizationId || req.user.organizationId;
    const result = await inventoryService.receive(
      { serialNumber: req.body.serialNumber, organizationId, actor: req.user },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return sendSuccess(res, result, 'Medicine received into stock', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/transfer { serialNumber, fromOrganizationId, toOrganizationId }
exports.transfer = async (req, res, next) => {
  try {
    const result = await inventoryService.transfer(
      {
        serialNumber: req.body.serialNumber,
        fromOrganizationId: req.body.fromOrganizationId || req.user.organizationId,
        toOrganizationId: req.body.toOrganizationId,
        actor: req.user,
      },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return sendSuccess(res, result, 'Medicine transferred', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/dispense { serialNumber, patientReference }
exports.dispense = async (req, res, next) => {
  try {
    const result = await inventoryService.dispense(
      {
        serialNumber: req.body.serialNumber,
        pharmacyId: req.body.pharmacyId || req.user.organizationId,
        patientReference: req.body.patientReference || null,
        actor: req.user,
      },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return sendSuccess(res, result, 'Medicine dispensed', 201);
  } catch (err) {
    next(err);
  }
};
