import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

const getTokenFromRequest = (req) => {
  const authorizationHeader =
    req.headers.authorization || "";

  if (
    authorizationHeader.startsWith("Bearer ")
  ) {
    return authorizationHeader.slice(7).trim();
  }

  if (req.cookies?.muliya_admin_token) {
    return req.cookies.muliya_admin_token;
  }

  return null;
};

const protectAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication is required.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message:
          "Admin authentication is not configured.",
      });
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(
        token,
        jwtSecret
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Admin session has expired. Please log in again."
            : "Invalid admin session.",
      });
    }

    const admin = await AdminUser.findById(
      decodedToken.adminId
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message:
          "Admin account was not found.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This admin account has been disabled.",
      });
    }

    req.admin = {
      adminId: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      branch: admin.branch,
      permissions: admin.permissions,
    };

    next();
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify the admin session.",
      error: error.message,
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication is required.",
      });
    }

    if (
      !allowedRoles.includes(req.admin.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

const requirePermission = (
  section,
  action
) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication is required.",
      });
    }

    if (req.admin.role === "Super Admin") {
      next();
      return;
    }

    const sectionPermissions =
      req.admin.permissions?.[section];

    const hasPermission =
      sectionPermissions?.[action] === true;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message:
          `You do not have permission to ${action} ${section}.`,
      });
    }

    next();
  };
};

const restrictToAdminBranch = (
  requestedBranch
) => {
  if (!requestedBranch) {
    return false;
  }

  return (
    requestedBranch !== "All" &&
    requestedBranch !== undefined
  );
};

const canAccessBranch = (
  admin,
  branch
) => {
  if (!admin || !branch) {
    return false;
  }

  if (
    admin.role === "Super Admin" ||
    admin.branch === "All"
  ) {
    return true;
  }

  return admin.branch === branch;
};

const requireBranchAccess = (
  branchResolver
) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication is required.",
      });
    }

    const branch =
      typeof branchResolver === "function"
        ? branchResolver(req)
        : req.params.branch ||
          req.body.preferredBranch ||
          req.query.branch;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message:
          "A branch is required for this operation.",
      });
    }

    if (
      !canAccessBranch(
        req.admin,
        branch
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this branch.",
      });
    }

    next();
  };
};

export {
  protectAdmin,
  requireRole,
  requirePermission,
  requireBranchAccess,
  canAccessBranch,
  restrictToAdminBranch,
};