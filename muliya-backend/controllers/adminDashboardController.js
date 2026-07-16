import Product from "../models/Product.js";
import Appointment from "../models/Appointment.js";
import Enquiry from "../models/Enquiry.js";
import ExpertRequest from "../models/ExpertRequest.js";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://localhost:8000";

const GOLD_PREDICTION_SERVICE_URL =
  process.env.GOLD_PREDICTION_SERVICE_URL ||
  "http://localhost:8001";

const safeServiceCheck = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        online: false,
      };
    }

    const data = await response.json();

    return {
      online: true,
      data,
    };
  } catch {
    return {
      online: false,
    };
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalProducts,
      pendingAppointments,
      newEnquiries,
      newExpertRequests,
      recentAppointments,
      recentEnquiries,
      recentExpertRequests,
      products,
      imageSearchStatus,
      goldPredictionStatus,
    ] = await Promise.all([
      Product.countDocuments(),

      Appointment.countDocuments({
        status: "Pending",
      }),

      Enquiry.countDocuments({
        status: {
          $in: ["New", "Pending"],
        },
      }),

      ExpertRequest.countDocuments({
        status: "New",
      }),

      Appointment.find()
        .sort({
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      Enquiry.find()
        .sort({
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      ExpertRequest.find()
        .sort({
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      Product.find(
        {},
        {
          code: 1,
          name: 1,
          branchAvailability: 1,
        }
      ).lean(),

      safeServiceCheck(
        `${AI_SERVICE_URL}/health`
      ),

      safeServiceCheck(
        `${GOLD_PREDICTION_SERVICE_URL}/health`
      ),
    ]);

    const branches = [
      "Bengaluru",
      "Puttur",
      "Madikeri",
    ];

    const branchSummary = branches.map(
      (branch) => {
        const availableProducts =
          products.filter(
            (product) =>
              product.branchAvailability?.[
                branch
              ] === true
          );

        return {
          branch,
          availableProductCount:
            availableProducts.length,
          totalProductCount:
            products.length,
        };
      }
    );

    const recentActivity = [
      ...recentAppointments.map(
        (appointment) => ({
          type: "appointment",
          title: "New showroom appointment",
          description: `${
            appointment.name ||
            "A customer"
          } requested an appointment for ${
            appointment.preferredBranch ||
            "a showroom"
          }.`,
          createdAt:
            appointment.createdAt,
        })
      ),

      ...recentEnquiries.map(
        (enquiry) => ({
          type: "enquiry",
          title: "New customer enquiry",
          description:
            enquiry.message ||
            `${enquiry.name || "A customer"} submitted an enquiry.`,
          createdAt:
            enquiry.createdAt,
        })
      ),

      ...recentExpertRequests.map(
        (request) => ({
          type: "expert-request",
          title:
            "New jewellery expert request",
          description:
            request.question ||
            `${request.name || "A customer"} requested expert assistance.`,
          createdAt:
            request.createdAt,
        })
      ),
    ]
      .filter((item) => item.createdAt)
      .sort(
        (first, second) =>
          new Date(second.createdAt) -
          new Date(first.createdAt)
      )
      .slice(0, 8);

    return res.status(200).json({
      success: true,

      summary: {
        totalProducts,
        pendingAppointments,
        newEnquiries,
        newExpertRequests,
      },

      branches: branchSummary,

      recentActivity,

      services: {
        catalogue: {
          online: true,
        },

        imageSearch: {
          online:
            imageSearchStatus.online,
          indexedProducts:
            imageSearchStatus.data
              ?.indexedProducts || 0,
          indexedReferenceImages:
            imageSearchStatus.data
              ?.indexedReferenceImages || 0,
        },

        goldPrediction: {
          online:
            goldPredictionStatus.online,
          modelLoaded:
            goldPredictionStatus.data
              ?.modelLoaded || false,
          modelName:
            goldPredictionStatus.data
              ?.modelName || "",
        },

        chatbot: {
          online: true,
        },
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load the admin dashboard.",
      error: error.message,
    });
  }
};

export {
  getAdminDashboard,
};