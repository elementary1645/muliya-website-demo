import {
  createBranchAction,
  createChatbotResponse,
  createDetail,
  createDirectionsAction,
  createExpertAction,
  createAppointmentAction,
} from "./responseBuilder.js";

const showroomInformation = {
  bengaluru: {
    key: "bengaluru",
    city: "Bengaluru",
    showroom: "Muliya Gold & Diamonds",
    address: "Jayanagar, Bengaluru, Karnataka",
    phone: "+91 98765 43210",
    hours: "10:00 AM - 8:30 PM",
  },

  puttur: {
    key: "puttur",
    city: "Puttur",
    showroom: "Muliya Gold & Diamonds",
    address: "Main Road, Puttur, Karnataka",
    phone: "+91 98765 43211",
    hours: "10:00 AM - 8:30 PM",
  },

  madikeri: {
    key: "madikeri",
    city: "Madikeri",
    showroom: "Muliya Gold & Diamonds",
    address: "Madikeri Town, Karnataka",
    phone: "+91 98765 43212",
    hours: "10:00 AM - 8:30 PM",
  },
};

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const findMentionedShowroom = (customerQuestion) => {
  const message = normalizeText(customerQuestion);

  return Object.values(showroomInformation).find(
    (showroom) => message.includes(showroom.key)
  );
};

const isShowroomQuestion = (customerQuestion) => {
  const message = normalizeText(customerQuestion);

  const showroomKeywords = [
    "showroom",
    "showrooms",
    "store",
    "stores",
    "branch",
    "branches",
    "location",
    "locations",
    "address",
    "timing",
    "timings",
    "hours",
    "open",
    "close",
    "phone",
    "contact number",
    "directions",
    "direction",
    "where are you",
    "where is",
    "visit",
  ];

  return showroomKeywords.some((keyword) =>
    message.includes(keyword)
  );
};

const buildShowroomDetails = (showroom) => {
  return [
    createDetail("Showroom", showroom.showroom),

    createDetail("City", showroom.city),

    createDetail("Address", showroom.address),

    createDetail("Phone", showroom.phone),

    createDetail("Opening Hours", showroom.hours),
  ];
};

const buildShowroomActions = (
  showroom,
  customerQuestion
) => {
  return [
    createBranchAction(showroom.city),

    createAppointmentAction(
      null,
      showroom.city
    ),

    createDirectionsAction({
      showroom: showroom.showroom,
      address: showroom.address,
    }),

    createExpertAction(customerQuestion),
  ];
};

const getSpecificShowroomResponse = (
  showroom,
  customerQuestion
) => {
  return createChatbotResponse({
    reply:
      `The ${showroom.city} showroom is located at ` +
      `${showroom.address}. It is listed as open from ` +
      `${showroom.hours}. You can contact the showroom at ` +
      `${showroom.phone}.`,

    confidence: 0.98,

    intent: "showroom_details",

    details: buildShowroomDetails(showroom),

    actions: buildShowroomActions(
      showroom,
      customerQuestion
    ),

    suggestions: [
      `Show jewellery available in ${showroom.city}`,
      `Book an appointment in ${showroom.city}`,
      `Get directions to ${showroom.city}`,
    ],
  });
};

const getAllShowroomsResponse = (
  customerQuestion
) => {
  const showrooms = Object.values(
    showroomInformation
  );

  return createChatbotResponse({
    reply:
      "The website currently lists Muliya showrooms in Bengaluru, Puttur, and Madikeri. You can view jewellery by branch, book an appointment, get directions, or connect with a jewellery expert.",

    confidence: 0.97,

    intent: "showroom_list",

    details: showrooms.flatMap((showroom) => [
      createDetail(
        `${showroom.city} Address`,
        showroom.address
      ),

      createDetail(
        `${showroom.city} Hours`,
        showroom.hours
      ),

      createDetail(
        `${showroom.city} Phone`,
        showroom.phone
      ),
    ]),

    actions: [
      ...showrooms.map((showroom) =>
        createBranchAction(showroom.city)
      ),

      createExpertAction(customerQuestion),
    ],

    suggestions: [
      "Bengaluru showroom details",
      "Puttur showroom details",
      "Madikeri showroom details",
      "Book an appointment",
    ],
  });
};

const getDirectionsResponse = (
  showroom,
  customerQuestion
) => {
  if (!showroom) {
    return createChatbotResponse({
      reply:
        "Please tell me which showroom you need directions to: Bengaluru, Puttur, or Madikeri.",

      confidence: 0.72,

      intent: "showroom_directions_branch_required",

      actions: [
        createExpertAction(customerQuestion),
      ],

      suggestions: [
        "Directions to Bengaluru showroom",
        "Directions to Puttur showroom",
        "Directions to Madikeri showroom",
      ],
    });
  }

  return createChatbotResponse({
    reply:
      `You can use the directions button below to navigate to the ${showroom.city} showroom at ${showroom.address}.`,

    confidence: 0.98,

    intent: "showroom_directions",

    details: buildShowroomDetails(showroom),

    actions: [
      createDirectionsAction({
        showroom: showroom.showroom,
        address: showroom.address,
      }),

      createAppointmentAction(
        null,
        showroom.city
      ),

      createExpertAction(customerQuestion),
    ],

    suggestions: [
      `Show jewellery available in ${showroom.city}`,
      `Book an appointment in ${showroom.city}`,
    ],
  });
};

const getShowroomHoursResponse = (
  showroom,
  customerQuestion
) => {
  if (!showroom) {
    return createChatbotResponse({
      reply:
        "The listed showroom timings are currently 10:00 AM to 8:30 PM. For branch-specific confirmation, select Bengaluru, Puttur, or Madikeri.",

      confidence: 0.9,

      intent: "showroom_hours_general",

      details: Object.values(
        showroomInformation
      ).map((item) =>
        createDetail(
          `${item.city} Hours`,
          item.hours
        )
      ),

      actions: [
        createExpertAction(customerQuestion),
      ],

      suggestions: [
        "Bengaluru showroom timings",
        "Puttur showroom timings",
        "Madikeri showroom timings",
      ],
    });
  }

  return createChatbotResponse({
    reply:
      `The listed opening hours for the ${showroom.city} showroom are ${showroom.hours}.`,

    confidence: 0.98,

    intent: "showroom_hours",

    details: buildShowroomDetails(showroom),

    actions: buildShowroomActions(
      showroom,
      customerQuestion
    ),

    suggestions: [
      `Book an appointment in ${showroom.city}`,
      `Get directions to ${showroom.city}`,
      `Show jewellery available in ${showroom.city}`,
    ],
  });
};

const getShowroomPhoneResponse = (
  showroom,
  customerQuestion
) => {
  if (!showroom) {
    return createChatbotResponse({
      reply:
        "Please tell me which showroom you want to contact: Bengaluru, Puttur, or Madikeri.",

      confidence: 0.72,

      intent: "showroom_phone_branch_required",

      actions: [
        createExpertAction(customerQuestion),
      ],

      suggestions: [
        "Bengaluru showroom phone number",
        "Puttur showroom phone number",
        "Madikeri showroom phone number",
      ],
    });
  }

  return createChatbotResponse({
    reply:
      `The listed phone number for the ${showroom.city} showroom is ${showroom.phone}.`,

    confidence: 0.98,

    intent: "showroom_phone",

    details: [
      createDetail("Showroom", showroom.city),
      createDetail("Phone", showroom.phone),
      createDetail("Address", showroom.address),
      createDetail("Opening Hours", showroom.hours),
    ],

    actions: [
      createAppointmentAction(
        null,
        showroom.city
      ),

      createDirectionsAction({
        showroom: showroom.showroom,
        address: showroom.address,
      }),

      createExpertAction(customerQuestion),
    ],

    suggestions: [
      `Book an appointment in ${showroom.city}`,
      `Get directions to ${showroom.city}`,
    ],
  });
};

const handleShowroomIntent = async (
  customerQuestion
) => {
  const message = normalizeText(
    customerQuestion
  );

  const showroom =
    findMentionedShowroom(customerQuestion);

  const asksDirections =
    message.includes("direction") ||
    message.includes("navigate") ||
    message.includes("map");

  const asksHours =
    message.includes("timing") ||
    message.includes("hour") ||
    message.includes("open") ||
    message.includes("close");

  const asksPhone =
    message.includes("phone") ||
    message.includes("contact number") ||
    message.includes("call");

  if (asksDirections) {
    return getDirectionsResponse(
      showroom,
      customerQuestion
    );
  }

  if (asksHours) {
    return getShowroomHoursResponse(
      showroom,
      customerQuestion
    );
  }

  if (asksPhone) {
    return getShowroomPhoneResponse(
      showroom,
      customerQuestion
    );
  }

  if (showroom) {
    return getSpecificShowroomResponse(
      showroom,
      customerQuestion
    );
  }

  return getAllShowroomsResponse(
    customerQuestion
  );
};

export {
  showroomInformation,
  findMentionedShowroom,
  isShowroomQuestion,
  handleShowroomIntent,
};