import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Bot,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { sendChatMessage } from "../api/chatbotApi";
import { createExpertRequest } from "../api/expertRequestApi";

const initialMessage = {
  id: "welcome",
  sender: "bot",
  text:
    "Hello! I’m the Muliya customer assistant. I can help you search jewellery, view detailed product information, check branch availability, find showrooms, view metal prices, book appointments, submit enquiries, or connect you with a jewellery expert.",
  confidence: 1,
  intent: "greeting",
  details: [],
  products: [],
  actions: [],
  suggestions: [
    "Show me gold jewellery",
    "Where are your showrooms?",
    "What is the current gold price?",
    "Connect me with an expert",
  ],
  needsExpert: false,
  relatedProduct: null,
};

const emptyExpertForm = {
  name: "",
  email: "",
  phone: "",
  preferredBranch: "",
  question: "",
};

function Chatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const [showExpertForm, setShowExpertForm] = useState(false);
  const [expertForm, setExpertForm] = useState(emptyExpertForm);
  const [expertProductId, setExpertProductId] = useState("");
  const [expertSubmitting, setExpertSubmitting] = useState(false);
  const [expertError, setExpertError] = useState("");
  const [expertSuccess, setExpertSuccess] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    sending,
    isOpen,
    showExpertForm,
    expertError,
    expertSuccess,
  ]);

  const conversationContext = useMemo(() => {
    return messages
      .filter(
        (message) =>
          ["customer", "bot"].includes(message.sender) &&
          typeof message.text === "string" &&
          message.text.trim()
      )
      .slice(-10)
      .map((message) => ({
        sender: message.sender,
        text: message.text.trim(),
      }));
  }, [messages]);

  const submitMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    const customerMessage = {
      id: `customer-${Date.now()}`,
      sender: "customer",
      text: trimmedMessage,
      confidence: 1,
      intent: "customer_message",
      details: [],
      products: [],
      actions: [],
      suggestions: [],
      needsExpert: false,
      relatedProduct: null,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      customerMessage,
    ]);

    setInputText("");
    setSending(true);

    try {
      const response = await sendChatMessage(
        trimmedMessage,
        conversationContext
      );

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply,
        confidence: response.confidence ?? 0,
        intent: response.intent || "unknown",
        details: response.details || [],
        products: response.products || [],
        actions: response.actions || [],
        suggestions: response.suggestions || [],
        needsExpert: Boolean(response.needsExpert),
        relatedProduct: response.relatedProduct || null,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        botMessage,
      ]);
    } catch (error) {
      console.error("Chatbot request failed:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          text:
            error.message ||
            "The customer assistant is temporarily unavailable.",
          confidence: 0,
          intent: "system_error",
          details: [],
          products: [],
          actions: [
            {
              type: "expert",
              label: "Connect with a Jewellery Expert",
              url: "",
              data: {
                question: trimmedMessage,
                productId: null,
              },
            },
          ],
          suggestions: [
            "Try again",
            "Connect me with an expert",
          ],
          needsExpert: true,
          relatedProduct: null,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage(inputText);
  };

  const handleSuggestionClick = (suggestion) => {
    submitMessage(suggestion);
  };

  const openExpertForm = ({
    question = "",
    productId = "",
  } = {}) => {
    setExpertForm((currentForm) => ({
      ...currentForm,
      question:
        question ||
        currentForm.question ||
        [...messages]
          .reverse()
          .find((message) => message.sender === "customer")
          ?.text ||
        "",
    }));

    setExpertProductId(productId || "");
    setExpertError("");
    setExpertSuccess("");
    setShowExpertForm(true);
  };

  const closeExpertForm = () => {
    if (expertSubmitting) {
      return;
    }

    setShowExpertForm(false);
    setExpertError("");
    setExpertSuccess("");
  };

  const handleAction = (action) => {
    if (!action) {
      return;
    }

    if (
      action.type === "product" ||
      action.type === "branch" ||
      action.type === "internal"
    ) {
      if (action.url) {
        navigate(action.url);
        setIsOpen(false);
      }

      return;
    }

    if (action.type === "external") {
      if (action.url) {
        window.open(
          action.url,
          "_blank",
          "noopener,noreferrer"
        );
      }

      return;
    }

    if (action.type === "expert") {
      openExpertForm({
        question: action.data?.question || "",
        productId: action.data?.productId || "",
      });

      return;
    }

    if (action.type === "appointment") {
      const productId = action.data?.productId;

      if (productId) {
        navigate(`/product/${productId}`);
        setIsOpen(false);

        setTimeout(() => {
          alert(
            "Open the Branch Availability section and select Book Appointment."
          );
        }, 250);
      } else {
        navigate("/#stores");
        setIsOpen(false);
      }

      return;
    }

    if (action.type === "enquiry") {
      const productId = action.data?.productId;

      if (productId) {
        navigate(`/product/${productId}`);
        setIsOpen(false);

        setTimeout(() => {
          alert(
            "Select Enquire Now on the product page to submit your enquiry."
          );
        }, 250);
      } else {
        openExpertForm({
          question: "I would like to submit a jewellery enquiry.",
        });
      }

      return;
    }

    if (action.type === "retry") {
      setInputText("");
    }
  };

  const handleExpertChange = (event) => {
    const { name, value } = event.target;

    setExpertForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setExpertError("");
  };

  const handleExpertSubmit = async (event) => {
    event.preventDefault();

    if (
      !expertForm.name.trim() ||
      !expertForm.phone.trim() ||
      !expertForm.question.trim()
    ) {
      setExpertError(
        "Name, phone number, and question are required."
      );

      return;
    }

    try {
      setExpertSubmitting(true);
      setExpertError("");
      setExpertSuccess("");

      const response = await createExpertRequest({
        name: expertForm.name.trim(),
        email: expertForm.email.trim(),
        phone: expertForm.phone.trim(),
        preferredBranch: expertForm.preferredBranch,
        question: expertForm.question.trim(),
        conversationContext,
        productId: expertProductId || undefined,
        source: "Chatbot",
        priority: "Normal",
      });

      setExpertSuccess(
        response.message ||
          "Your request has been sent to a jewellery expert."
      );

      setExpertForm(emptyExpertForm);
      setExpertProductId("");
    } catch (error) {
      console.error(
        "Expert request submission failed:",
        error
      );

      setExpertError(
        error.message ||
          "Unable to connect with a jewellery expert."
      );
    } finally {
      setExpertSubmitting(false);
    }
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setShowExpertForm(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="chatbot-launch-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Muliya customer assistant"
        >
          <MessageCircle size={23} />
          <span>Ask Muliya</span>
        </button>
      )}

      {isOpen && (
        <section
          className="chatbot-window"
          aria-label="Muliya customer assistant"
        >
          <div className="chatbot-header">
            <div className="chatbot-header-icon">
              <Sparkles size={20} />
            </div>

            <div className="chatbot-header-content">
              <h2>Muliya Assistant</h2>
              <p>Jewellery and showroom support</p>
            </div>

            <button
              type="button"
              className="chatbot-minimize-button"
              onClick={closeChatbot}
              aria-label="Minimize assistant"
            >
              <ChevronDown size={20} />
            </button>

            <button
              type="button"
              className="chatbot-close-button"
              onClick={closeChatbot}
              aria-label="Close assistant"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                className={
                  message.sender === "customer"
                    ? "chatbot-message-row customer"
                    : "chatbot-message-row bot"
                }
                key={message.id}
              >
                {message.sender === "bot" && (
                  <div className="chatbot-avatar">
                    <Bot size={17} />
                  </div>
                )}

                <div className="chatbot-message-content">
                  <div className="chatbot-message-bubble">
                    <p>{message.text}</p>
                  </div>

                  {message.sender === "bot" &&
                    message.details.length > 0 && (
                      <div className="chatbot-details-card">
                        {message.details.map((detail, index) => (
                          <div
                            className="chatbot-detail-row"
                            key={`${message.id}-${detail.label}-${index}`}
                          >
                            <span>{detail.label}</span>
                            <strong>{detail.value}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                  {message.products.length > 0 && (
                    <div className="chatbot-products">
                      {message.products.map((product) => (
                        <Link
                          to={`/product/${product.id}`}
                          className="chatbot-product-card"
                          key={product.id}
                          onClick={closeChatbot}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                          />

                          <div>
                            <span>{product.code}</span>

                            <h3>{product.name}</h3>

                            <p>
                              {product.category} · {product.type}
                            </p>

                            <strong>{product.price}</strong>

                            <small>
                              {product.weight} · {product.purity}
                            </small>

                            {product.availableBranches?.length >
                              0 && (
                              <small>
                                Available:{" "}
                                {product.availableBranches.join(
                                  ", "
                                )}
                              </small>
                            )}

                            {product.unavailableBranches?.length >
                              0 && (
                              <small>
                                Unavailable:{" "}
                                {product.unavailableBranches.join(
                                  ", "
                                )}
                              </small>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {message.actions.length > 0 && (
                    <div className="chatbot-actions">
                      {message.actions.map((action, index) => (
                        <button
                          type="button"
                          key={`${message.id}-${action.type}-${index}`}
                          className={
                            action.type === "expert"
                              ? "chatbot-action-btn expert"
                              : "chatbot-action-btn"
                          }
                          onClick={() => handleAction(action)}
                        >
                          {action.type === "expert" && (
                            <UserRound size={14} />
                          )}

                          {action.label}

                          {action.type === "external" && (
                            <ExternalLink size={13} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.needsExpert && (
                    <div className="chatbot-expert-notice">
                      <UserRound size={17} />

                      <div>
                        <strong>Need personal assistance?</strong>

                        <p>
                          Send your question to a Muliya
                          jewellery expert.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openExpertForm({
                            question: message.text,
                            productId:
                              message.relatedProduct?.id || "",
                          })
                        }
                      >
                        Connect
                      </button>
                    </div>
                  )}

                  {message.suggestions.length > 0 && (
                    <div className="chatbot-suggestions">
                      {message.suggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={`${message.id}-${suggestion}`}
                          onClick={() =>
                            handleSuggestionClick(suggestion)
                          }
                          disabled={sending}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="chatbot-message-row bot">
                <div className="chatbot-avatar">
                  <Bot size={17} />
                </div>

                <div className="chatbot-message-content">
                  <div className="chatbot-message-bubble chatbot-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {showExpertForm && (
              <div className="chatbot-expert-form-card">
                <div className="chatbot-expert-form-header">
                  <div>
                    <p>Human assistance</p>
                    <h3>Connect with an Expert</h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeExpertForm}
                    disabled={expertSubmitting}
                    aria-label="Close expert form"
                  >
                    <X size={18} />
                  </button>
                </div>

                {expertSuccess ? (
                  <div className="chatbot-expert-success">
                    <UserRound size={28} />

                    <h3>Request Submitted</h3>

                    <p>{expertSuccess}</p>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={closeExpertForm}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form
                    className="chatbot-expert-form"
                    onSubmit={handleExpertSubmit}
                  >
                    <input
                      type="text"
                      name="name"
                      value={expertForm.name}
                      onChange={handleExpertChange}
                      placeholder="Full name"
                      required
                    />

                    <input
                      type="email"
                      name="email"
                      value={expertForm.email}
                      onChange={handleExpertChange}
                      placeholder="Email address (optional)"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={expertForm.phone}
                      onChange={handleExpertChange}
                      placeholder="Phone number"
                      required
                    />

                    <select
                      name="preferredBranch"
                      value={expertForm.preferredBranch}
                      onChange={handleExpertChange}
                    >
                      <option value="">
                        Select preferred branch
                      </option>
                      <option value="Bengaluru">
                        Bengaluru
                      </option>
                      <option value="Puttur">Puttur</option>
                      <option value="Madikeri">
                        Madikeri
                      </option>
                    </select>

                    <textarea
                      name="question"
                      value={expertForm.question}
                      onChange={handleExpertChange}
                      placeholder="Describe what you need help with"
                      rows="4"
                      required
                    />

                    {expertError && (
                      <p className="chatbot-expert-error">
                        {expertError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={expertSubmitting}
                    >
                      {expertSubmitting
                        ? "Sending Request..."
                        : "Send to Jewellery Expert"}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="chatbot-input-form"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={inputText}
              onChange={(event) =>
                setInputText(event.target.value)
              }
              placeholder="Ask about jewellery or showrooms..."
              maxLength={1000}
              disabled={sending}
            />

            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>

          <p className="chatbot-disclaimer">
            Product prices and branch availability should be
            confirmed with the showroom.
          </p>
        </section>
      )}
    </>
  );
}

export default Chatbot;