# 💎 Muliya Jewellers — Website & Inventory Management System

A modern, responsive jewellery catalogue and management platform developed as part of a six-week internship at **Muliya Jewellers**.

The project explores how a traditional jewellery retail business can improve its digital presence, streamline product management, and provide customers with a more intuitive jewellery discovery experience.

Built using **React.js, Vite, and JavaScript**, the application focuses on creating a scalable foundation for a customer-facing jewellery website and an integrated administrative dashboard.

---

## 📌 Project Overview

**Muliya Jewellers** is an established jewellery retailer with operations in Bengaluru and Puttur, Karnataka.

The project was undertaken to evaluate the existing digital experience and develop a modern website prototype addressing key requirements in jewellery discovery, catalogue management, and branch-level inventory visibility.

The proposed solution brings together three major components:

1. **Customer Website** — An interactive platform for browsing and discovering jewellery collections.
2. **Admin Dashboard** — A centralized interface for managing products and website content.
3. **Inventory Management** — A proposed system for tracking stock across multiple showroom locations.

The primary objective was to develop a practical, extensible digital solution aligned with the operational needs of a jewellery retail business.

## 🎯 Project Objectives

- Improve the usability and visual appeal of the existing jewellery website.
- Develop a responsive interface for desktop, tablet, and mobile devices.
- Organize jewellery collections through intuitive navigation.
- Simplify product discovery using search, filtering, and sorting.
- Design an administrative interface for catalogue management.
- Explore branch-specific stock tracking and inventory workflows.
- Investigate AI-assisted jewellery discovery.
- Establish a maintainable frontend architecture for future development.

## ✨ Features & Functional Scope

### 1. Customer-Facing Website

**Jewellery Catalogue**

A structured interface for exploring jewellery across different collections and product categories.

Core design requirements include:

- Product listing and category pages
- Jewellery images and product descriptions
- Collection-based navigation
- Featured and trending jewellery sections
- Responsive product cards
- Individual product detail views

**Search and Product Discovery**

The platform is designed around an improved product discovery experience.

Planned capabilities include:

- Keyword-based product search
- Category and collection filters
- Product sorting
- Paginated catalogue navigation
- Wishlist functionality
- Product comparison

**AI-Powered Image Search — Proposed Enhancement**

An AI-assisted discovery feature was explored as a potential future enhancement.

The proposed workflow allows customers to upload an image of jewellery and discover visually similar products from the catalogue.

Potential implementation:

1. Accept a customer-uploaded reference image.
2. Extract visual features using an image-embedding model.
3. Compare embeddings against catalogue images.
4. Rank visually similar jewellery products.
5. Display matching products and availability information.

This feature represents a proposed extension rather than a verified production integration.

### 2. Administrative Dashboard

The administrative interface is designed to support catalogue operations through a centralized management experience.

**Product Management**

Functional requirements include:

- Add new jewellery products
- Edit existing product information
- Delete catalogue entries
- Manage product categories
- Upload and manage product images
- Mark products as featured or trending
- Validate product information

**Bulk Data Operations**

Proposed support for:

- CSV-based product imports
- CSV exports
- Bulk catalogue updates

**Dashboard Analytics**

The dashboard concept includes visual summaries for:

- Total products
- Products by category
- Branch-level inventory
- Low-stock items
- Catalogue distribution

### 3. Multi-Branch Inventory Management

A proposed inventory module designed around Muliya Jewellers' Bengaluru and Puttur operations.

| Feature | Description |
|---|---|
| Branch Inventory | Maintain stock information for individual showrooms |
| Stock Quantities | Track available quantities by product |
| Low-Stock Alerts | Identify products requiring replenishment |
| Inventory History | Record stock changes and movements |
| Branch Transfers | Support inventory transfers between locations |
| Stock Availability | Display showroom-level availability |

The module is intended to reduce manual catalogue coordination and improve stock visibility across locations.

### 4. Customer Engagement Features

Additional features considered for the customer experience include:

- Showroom appointment booking
- Branch and showroom information
- Contact and enquiry options
- Jewellery wishlist
- Product comparison
- Store availability enquiries
- Customer support information

The project primarily focuses on catalogue discovery and retail operations rather than online payment processing.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Component-based frontend development |
| Vite | Development server and frontend build tooling |
| JavaScript | Application logic and interactions |
| HTML5 | Semantic page structure |
| CSS3 | Styling and responsive layouts |
| Node.js | Local JavaScript development environment |
| npm | Dependency and package management |
| Git | Version control |
| GitHub | Source code hosting and collaboration |

**Architecture:** React-based single-page application with reusable components and modular page organization.

## 🏗️ Application Architecture

The frontend follows a component-based architecture intended to separate customer experiences, administrative operations, and shared UI elements.

```text
Muliya Jewellers Platform
│
├── Customer Website
│   ├── Home
│   ├── Collections
│   ├── Product Catalogue
│   ├── Product Details
│   ├── Search & Filters
│   └── Customer Enquiries
│
├── Admin Dashboard
│   ├── Dashboard Overview
│   ├── Product Management
│   ├── Category Management
│   ├── Product Images
│   └── Catalogue Operations
│
└── Proposed Extensions
    ├── Multi-Branch Inventory
    ├── Inventory Analytics
    ├── Appointment Booking
    └── AI Image Search
```

This diagram represents the intended logical architecture, not necessarily the exact current repository structure.

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed:

- Node.js
- npm
- Git
- A modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/elementary1645/muliya-website-demo.git
```

### 2. Navigate to the Project

```bash
cd muliya-website-demo
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Vite will display a local development URL in the terminal, typically:

```text
http://localhost:5173/
```

Open the URL in your browser.

**Note:** These commands assume the React/Vite application is located at the repository root. If the application is contained in a subdirectory, navigate to that directory before installing dependencies.

## 💻 Development Approach

The project followed a practical, requirement-driven development process.

**Phase 1 — Website Assessment**

Reviewed the existing Muliya Jewellers website to identify opportunities in navigation, product discovery, user experience, and catalogue presentation.

**Phase 2 — Requirements Analysis**

Identified customer-facing requirements and operational needs associated with managing jewellery catalogues across multiple branches.

**Phase 3 — Frontend Development**

Worked on the React-based website prototype, focusing on reusable components, responsive layouts, and catalogue-related user interfaces.

**Phase 4 — Administrative System Design**

Explored product management workflows, dashboard requirements, and data organization for administrative operations.

**Phase 5 — Future Enhancements**

Outlined additional opportunities involving inventory synchronization, image-based product discovery, and customer engagement tools.

## 🧩 Key Engineering Considerations

### Component Reusability

Reusable React components help maintain consistent styling and behavior while reducing duplication across pages.

### Responsive Design

The interface is intended to support multiple screen sizes, particularly mobile devices commonly used for product browsing.

### Catalogue Scalability

Product categories, filters, and pagination are designed to support expansion as the jewellery catalogue grows.

### Separation of Concerns

Customer-facing pages and administrative workflows are logically separated to simplify future maintenance.

### Data Consistency

Branch-level stock visibility and product management require consistent product identifiers and structured inventory data.

### Extensibility

The architecture provides a foundation for future backend integrations, authentication, inventory services, and AI-assisted features.

## 📈 Expected Business Impact

The project was designed to support improvements in several areas.

| Area | Expected Benefit |
|---|---|
| Customer Experience | Easier navigation and jewellery discovery |
| Product Visibility | Improved presentation of jewellery collections |
| Catalogue Management | Reduced effort in maintaining product information |
| Inventory Operations | Better visibility into branch-level stock |
| Customer Engagement | More convenient showroom enquiries and appointments |
| Digital Transformation | A foundation for future retail technology integrations |

These are intended benefits, not measured production outcomes.

## 🔮 Future Scope

Potential enhancements include:

- AI-powered visual jewellery search
- Backend API and database integration
- Secure role-based admin authentication
- Real-time inventory synchronization
- Customer accounts and saved wishlists
- Appointment scheduling integration
- Advanced dashboard analytics
- Image optimization and CDN delivery
- Automated catalogue imports
- SEO improvements
- Accessibility enhancements
- Cloud deployment and monitoring

## 🎓 Internship Context

This project was developed during a **six-week internship at Muliya Jewellers**, involving exposure to the business requirements of jewellery retail and practical frontend development.

The internship provided an opportunity to connect software engineering concepts with real-world business challenges, particularly in digital catalogue management, customer experience, and multi-branch retail operations.

### Key Learning Outcomes

- React component-based development
- Frontend application architecture
- Responsive web design
- Requirements gathering and analysis
- Retail product catalogue workflows
- Administrative interface design
- Inventory system planning
- Translating business requirements into technical solutions
- Git and GitHub-based project management

## 👨‍💻 Developer

**Aditya Arun Karadi**

Software Developer | AI & ML Enthusiast

GitHub: [@elementary1645](https://github.com/elementary1645)

## ⚠️ Disclaimer

This repository contains a development prototype created for educational and internship purposes.

It is not presented as the official production website of Muliya Jewellers. Brand references are included solely to describe the project context.

All trademarks, brand names, and associated intellectual property belong to their respective owners.

---

**Built with React and Vite as part of a real-world jewellery retail website development project.**
