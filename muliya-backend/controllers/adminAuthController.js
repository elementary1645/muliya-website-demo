import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

const createToken = (admin) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured in the backend environment."
    );
  }

  return jwt.sign(
    {
      adminId: String(admin._id),
      role: admin.role,
      branch: admin.branch,
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
};

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
  };
};

const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      branch,
      permissions,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Admin password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingAdmin = await AdminUser.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "An admin account already exists with this email.",
      });
    }

    const admin = await AdminUser.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || "Showroom Manager",
      branch: branch || "All",
      permissions,
    });

    const token = createToken(admin);

    res.cookie(
      "muliya_admin_token",
      token,
      getCookieOptions()
    );

    return res.status(201).json({
      success: true,
      message:
        "Admin account created successfully.",
      token,
      admin: admin.toSafeObject(),
    });
  } catch (error) {
    console.error(
      "Register admin error:",
      error
    );

    if (error.name === "ValidationError") {
      const validationMessage = Object.values(
        error.errors
      )
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An admin account already exists with this email.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create the admin account.",
      error: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await AdminUser.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin email or password.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This admin account has been disabled.",
      });
    }

    const passwordMatches =
      await admin.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin email or password.",
      });
    }

    admin.lastLoginAt = new Date();

    await admin.save({
      validateBeforeSave: false,
    });

    const token = createToken(admin);

    res.cookie(
      "muliya_admin_token",
      token,
      getCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message:
        "Admin login successful.",
      token,
      admin: admin.toSafeObject(),
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to log in to the admin dashboard.",
      error: error.message,
    });
  }
};

const logoutAdmin = async (req, res) => {
  res.clearCookie(
    "muliya_admin_token",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    }
  );

  return res.status(200).json({
    success: true,
    message:
      "Admin logged out successfully.",
  });
};

const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await AdminUser.findById(
      req.admin.adminId
    );

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message:
          "Admin account is unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      admin: admin.toSafeObject(),
    });
  } catch (error) {
    console.error(
      "Get current admin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve admin account details.",
      error: error.message,
    });
  }
};

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
};