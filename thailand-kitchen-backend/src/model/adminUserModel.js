const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "editor"],
      default: "admin",
    },
  },
  { timestamps: true, collection: "admin_users" }
);

adminUserSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

adminUserSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

adminUserSchema.methods.toPublic = function toPublic() {
  const initials = this.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    role: this.role,
    initials: initials || "AD",
  };
};

module.exports = mongoose.model("AdminUser", adminUserSchema);
