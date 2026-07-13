import Appointment from "../models/Appointment.js";
import Product from "../models/Product.js";

const createAppointment = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      preferredBranch,
      appointmentDate,
      appointmentTime,
      message,
      productId,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !preferredBranch ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, branch, appointment date, and appointment time are required.",
      });
    }

    const selectedDate = new Date(appointmentDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past.",
      });
    }

    let product = null;

    if (productId) {
      product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Selected product not found.",
        });
      }
    }

    const appointment = await Appointment.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredBranch,
      appointmentDate: selectedDate,
      appointmentTime,
      message: message?.trim() || "",
      product: product?._id || null,
      productCode: product?.code || "",
      productName: product?.name || "",
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    if (error.name === "ValidationError") {
      const validationMessage = Object.values(error.errors)
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit appointment request.",
      error: error.message,
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate(
        "product",
        "name code category type collection price image"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve appointments.",
      error: error.message,
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    ).populate(
      "product",
      "name code category type collection price image"
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment ID.",
      error: error.message,
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status.",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to update appointment status.",
      error: error.message,
    });
  }
};

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};