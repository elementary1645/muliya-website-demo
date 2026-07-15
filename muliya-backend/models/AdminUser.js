import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required."],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Admin email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    password: {
      type: String,
      required: [true, "Admin password is required."],
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "Super Admin",
        "Catalog Manager",
        "Showroom Manager",
        "Support Manager",
      ],
      default: "Showroom Manager",
    },

    branch: {
      type: String,
      enum: [
        "All",
        "Bengaluru",
        "Puttur",
        "Madikeri",
      ],
      default: "All",
    },

    permissions: {
      products: {
        view: {
          type: Boolean,
          default: true,
        },

        create: {
          type: Boolean,
          default: false,
        },

        update: {
          type: Boolean,
          default: false,
        },

        delete: {
          type: Boolean,
          default: false,
        },
      },

      appointments: {
        view: {
          type: Boolean,
          default: true,
        },

        update: {
          type: Boolean,
          default: true,
        },
      },

      enquiries: {
        view: {
          type: Boolean,
          default: true,
        },

        update: {
          type: Boolean,
          default: true,
        },
      },

      expertRequests: {
        view: {
          type: Boolean,
          default: true,
        },

        update: {
          type: Boolean,
          default: true,
        },
      },

      inventory: {
        view: {
          type: Boolean,
          default: true,
        },

        update: {
          type: Boolean,
          default: false,
        },
      },

      analytics: {
        view: {
          type: Boolean,
          default: true,
        },
      },

      admins: {
        view: {
          type: Boolean,
          default: false,
        },

        manage: {
          type: Boolean,
          default: false,
        },
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

adminUserSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

adminUserSchema.pre(
  "save",
  async function hashPassword(next) {
    if (!this.isModified("password")) {
      next();
      return;
    }

    const saltRounds = 12;

    this.password = await bcrypt.hash(
      this.password,
      saltRounds
    );

    this.passwordChangedAt = new Date();

    next();
  }
);

adminUserSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

adminUserSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    role: this.role,
    branch: this.branch,
    permissions: this.permissions,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const AdminUser = mongoose.model(
  "AdminUser",
  adminUserSchema
);

export default AdminUser;