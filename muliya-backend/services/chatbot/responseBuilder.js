const createAction = ({
  type,
  label,
  url = "",
  data = {},
}) => {
  return {
    type,
    label,
    url,
    data,
  };
};

const createDetail = (label, value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return {
    label,
    value: String(value),
  };
};

const createChatbotResponse = ({
  reply,
  confidence = 1,
  intent = "general",
  details = [],
  products = [],
  actions = [],
  suggestions = [],
  needsExpert = false,
  relatedProduct = null,
}) => {
  return {
    reply,

    confidence,

    intent,

    details: details.filter(Boolean),

    products,

    actions,

    suggestions,

    needsExpert,

    relatedProduct,
  };
};

const createExpertAction = (
  question = "",
  productId = null
) => {
  return createAction({
    type: "expert",

    label: "Connect with a Jewellery Expert",

    data: {
      question,
      productId,
    },
  });
};

const createProductAction = (product) => {
  return createAction({
    type: "product",

    label: "View Product",

    url: `/product/${product._id || product.id}`,

    data: {
      productId: String(product._id || product.id),
      productCode: product.code || "",
    },
  });
};

const createAppointmentAction = (
  product = null,
  branch = ""
) => {
  return createAction({
    type: "appointment",

    label: "Book Appointment",

    data: {
      productId: product?._id
        ? String(product._id)
        : product?.id
          ? String(product.id)
          : null,

      productCode: product?.code || "",

      branch,
    },
  });
};

const createEnquiryAction = (
  product = null,
  branch = ""
) => {
  return createAction({
    type: "enquiry",

    label: "Submit Enquiry",

    data: {
      productId: product?._id
        ? String(product._id)
        : product?.id
          ? String(product.id)
          : null,

      productCode: product?.code || "",

      branch,
    },
  });
};

const createBranchAction = (branch) => {
  return createAction({
    type: "branch",

    label: `View ${branch} Collection`,

    url: `/branch/${encodeURIComponent(branch)}`,

    data: {
      branch,
    },
  });
};

const createDirectionsAction = ({
  showroom,
  address,
}) => {
  const destination = encodeURIComponent(
    `${showroom}, ${address}`
  );

  return createAction({
    type: "external",

    label: "Get Directions",

    url:
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${destination}`,
  });
};

const createRetryAction = () => {
  return createAction({
    type: "retry",

    label: "Ask Another Question",
  });
};

export {
  createAction,
  createDetail,
  createChatbotResponse,
  createExpertAction,
  createProductAction,
  createAppointmentAction,
  createEnquiryAction,
  createBranchAction,
  createDirectionsAction,
  createRetryAction,
};