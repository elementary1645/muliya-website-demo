import {
  createAppointmentAction,
  createChatbotResponse,
  createEnquiryAction,
  createExpertAction,
  createRetryAction,
} from "./responseBuilder.js";

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const isGreeting = (message) => {
  const greetings = [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
  ];

  return greetings.some((greeting) =>
    message === greeting || message.startsWith(`${greeting} `)
  );
};

const isAppointmentQuestion = (message) => {
  const keywords = [
    "appointment",
    "book visit",
    "showroom visit",
    "schedule visit",
    "visit showroom",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const isEnquiryQuestion = (message) => {
  const keywords = [
    "enquiry",
    "enquire",
    "inquiry",
    "ask about product",
    "contact about product",
    "more information",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const isWishlistQuestion = (message) => {
  const keywords = [
    "wishlist",
    "save product",
    "saved products",
    "heart icon",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const isCompareQuestion = (message) => {
  const keywords = [
    "compare",
    "comparison",
    "compare products",
    "side by side",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const isInstagramQuestion = (message) => {
  const keywords = [
    "instagram",
    "social media",
    "muliyajewels",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const isImageSearchQuestion = (message) => {
  const keywords = [
    "image search",
    "upload image",
    "find similar jewellery",
    "find similar jewelry",
    "camera search",
    "photo search",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const isExpertRequest = (message) => {
  const keywords = [
    "expert",
    "human",
    "person",
    "agent",
    "customer care",
    "call me",
    "contact me",
    "talk to someone",
    "connect me",
  ];

  return keywords.some((keyword) =>
    message.includes(keyword)
  );
};

const canHandleSupportIntent = (customerQuestion) => {
  const message = normalizeText(customerQuestion);

  return (
    isGreeting(message) ||
    isAppointmentQuestion(message) ||
    isEnquiryQuestion(message) ||
    isWishlistQuestion(message) ||
    isCompareQuestion(message) ||
    isInstagramQuestion(message) ||
    isImageSearchQuestion(message) ||
    isExpertRequest(message)
  );
};

const handleSupportIntent = async (
  customerQuestion
) => {
  const message = normalizeText(
    customerQuestion
  );

  if (isGreeting(message)) {
    return createChatbotResponse({
      reply:
        "Hello! I’m the Muliya customer assistant. I can help you search jewellery, view product details, check showroom availability, find store information, view live metal prices, book appointments, submit enquiries, or connect you with a jewellery expert.",

      confidence: 0.99,

      intent: "greeting",

      actions: [
        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Where are your showrooms?",
        "What is the current gold price?",
        "Connect me with an expert",
      ],
    });
  }

  if (isExpertRequest(message)) {
    return createChatbotResponse({
      reply:
        "I can connect you with a jewellery expert. Use the button below to submit your name, phone number, preferred branch, and question. The request will be saved for the showroom team.",

      confidence: 0.99,

      intent: "expert_handoff",

      actions: [
        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me bridal jewellery",
        "Book an appointment",
        "Find a showroom",
      ],

      needsExpert: true,
    });
  }

  if (isAppointmentQuestion(message)) {
    return createChatbotResponse({
      reply:
        "You can book a showroom appointment by selecting a branch, date, and time. Product-specific appointments can be made from a product page, while general showroom appointments can be booked from the Store Locator section.",

      confidence: 0.98,

      intent: "appointment_help",

      details: [
        {
          label: "Required Details",
          value:
            "Name, email, phone, branch, date, and time",
        },
        {
          label: "Appointment Status",
          value:
            "Requests are initially saved as Pending",
        },
        {
          label: "Product Selection",
          value:
            "Optional for general showroom appointments",
        },
      ],

      actions: [
        createAppointmentAction(),

        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Where are your showrooms?",
        "Show jewellery available in Bengaluru",
        "Connect me with an expert",
      ],
    });
  }

  if (isEnquiryQuestion(message)) {
    return createChatbotResponse({
      reply:
        "To enquire about a jewellery item, open its product page and select Enquire Now. You can enter your contact details, preferred showroom, and message. The enquiry is then saved for the showroom team.",

      confidence: 0.98,

      intent: "enquiry_help",

      details: [
        {
          label: "Required Details",
          value:
            "Name, email, phone number, and product",
        },
        {
          label: "Optional Details",
          value:
            "Preferred showroom and message",
        },
        {
          label: "Initial Status",
          value: "New",
        },
      ],

      actions: [
        createEnquiryAction(),

        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Show me diamond jewellery",
        "How do appointments work?",
      ],
    });
  }

  if (isWishlistQuestion(message)) {
    return createChatbotResponse({
      reply:
        "Use the heart icon on a product card or product page to add jewellery to your wishlist. The wishlist is currently saved in this browser using local storage, so it remains available after refreshing on the same device.",

      confidence: 0.97,

      intent: "wishlist_help",

      details: [
        {
          label: "Storage",
          value: "Browser local storage",
        },
        {
          label: "Account Required",
          value: "No",
        },
        {
          label: "Cross-device Sync",
          value:
            "Not available until customer accounts are implemented",
        },
      ],

      actions: [
        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "How does product comparison work?",
        "Show me trending jewellery",
      ],
    });
  }

  if (isCompareQuestion(message)) {
    return createChatbotResponse({
      reply:
        "You can add up to three jewellery items to Compare. The comparison page shows details such as price, category, collection, purity, weight, and availability side by side.",

      confidence: 0.97,

      intent: "compare_help",

      details: [
        {
          label: "Maximum Products",
          value: "3",
        },
        {
          label: "Compared Fields",
          value:
            "Price, category, collection, purity, weight, and availability",
        },
        {
          label: "Storage",
          value: "Browser local storage",
        },
      ],

      actions: [
        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me rings",
        "Show me bridal jewellery",
        "How does wishlist work?",
      ],
    });
  }

  if (isInstagramQuestion(message)) {
    return createChatbotResponse({
      reply:
        "The website includes a Muliya Instagram showcase linked to the official @muliyajewels profile. Live posts can be displayed when Meta Instagram API credentials are configured; otherwise, curated fallback content is shown.",

      confidence: 0.97,

      intent: "instagram_help",

      details: [
        {
          label: "Instagram Handle",
          value: "@muliyajewels",
        },
        {
          label: "Profile",
          value:
            "https://www.instagram.com/muliyajewels/",
        },
        {
          label: "Current Feed Mode",
          value:
            "Live when Meta API is configured, otherwise fallback",
        },
      ],

      actions: [
        {
          type: "external",
          label: "Visit @muliyajewels",
          url:
            "https://www.instagram.com/muliyajewels/",
          data: {},
        },

        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me bridal jewellery",
        "Show me trending jewellery",
      ],
    });
  }

  if (isImageSearchQuestion(message)) {
    return createChatbotResponse({
      reply:
        "The current image-search interface supports image upload, drag-and-drop, preview, and simulated similar results. The real AI image-search model, product embeddings, and vector similarity search are still pending.",

      confidence: 0.98,

      intent: "image_search_help",

      details: [
        {
          label: "Current Status",
          value: "Front-end simulation",
        },
        {
          label: "Working Features",
          value:
            "Upload, drag-and-drop, preview, and mock similar products",
        },
        {
          label: "Pending Features",
          value:
            "Vision embeddings, vector search, and real similarity ranking",
        },
      ],

      actions: [
        {
          type: "internal",
          label: "Open Image Search",
          url: "/#ai-search",
          data: {},
        },

        createExpertAction(
          customerQuestion
        ),
      ],

      suggestions: [
        "Show me gold jewellery",
        "Connect me with an expert",
      ],
    });
  }

  return createChatbotResponse({
    reply:
      "I could not find a reliable answer in the available Muliya information. You can ask another question or connect with a jewellery expert.",

    confidence: 0.2,

    intent: "support_unknown",

    actions: [
      createRetryAction(),

      createExpertAction(
        customerQuestion
      ),
    ],

    suggestions: [
      "Show me gold jewellery",
      "Where are your showrooms?",
      "How do I book an appointment?",
      "Connect me with an expert",
    ],

    needsExpert: true,
  });
};

export {
  canHandleSupportIntent,
  handleSupportIntent,
};