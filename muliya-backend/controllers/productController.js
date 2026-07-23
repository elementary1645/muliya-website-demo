import mongoose from "mongoose";

import Product from "../models/Product.js";

const escapeRegExp = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createExactRegex = (value) => {
  return new RegExp(`^${escapeRegExp(value)}$`, "i");
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalizedValue)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalizedValue)) {
    return false;
  }

  return undefined;
};

const parsePrice = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleanedValue = String(value || "")
    .replace(/,/g, "")
    .match(/-?\d+(\.\d+)?/);

  if (!cleanedValue) {
    return 0;
  }

  const numericValue = Number(cleanedValue[0]);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

const branchFieldMap = {
  bengaluru: "branchAvailability.Bengaluru",
  bangalore: "branchAvailability.Bengaluru",
  puttur: "branchAvailability.Puttur",
  madikeri: "branchAvailability.Madikeri",
};

const buildProductFilter = (queryParams) => {
  const {
    q,
    category,
    type,
    purity,
    collection,
    availability,
    branch,
    featured,
    trending,
  } = queryParams;

  const filter = {};

  const cleanedSearchText = String(q || "").trim();

  if (cleanedSearchText) {
    const searchRegex = new RegExp(
      escapeRegExp(cleanedSearchText),
      "i",
    );

    filter.$or = [
      { name: searchRegex },
      { code: searchRegex },
      { category: searchRegex },
      { type: searchRegex },
      { collection: searchRegex },
      { purity: searchRegex },
      { availability: searchRegex },
      { weight: searchRegex },
    ];
  }

  if (category) {
    filter.category = createExactRegex(category);
  }

  if (type) {
    filter.type = createExactRegex(type);
  }

  if (purity) {
    filter.purity = createExactRegex(purity);
  }

  if (collection) {
    filter.collection = createExactRegex(collection);
  }

  if (availability) {
    filter.availability = createExactRegex(
      availability,
    );
  }

  const featuredValue = parseBoolean(featured);

  if (featuredValue !== undefined) {
    filter.featured = featuredValue;
  }

  const trendingValue = parseBoolean(trending);

  if (trendingValue !== undefined) {
    filter.trending = trendingValue;
  }

  if (branch) {
    const normalizedBranch = String(branch)
      .trim()
      .toLowerCase();

    const branchField =
      branchFieldMap[normalizedBranch];

    if (branchField) {
      filter[branchField] = true;
    }
  }

  return filter;
};

const sortProducts = (products, sortOption) => {
  const sortedProducts = [...products];

  switch (sortOption) {
    case "price-asc":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          parsePrice(firstProduct.price) -
          parsePrice(secondProduct.price),
      );

    case "price-desc":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          parsePrice(secondProduct.price) -
          parsePrice(firstProduct.price),
      );

    case "name-asc":
      return sortedProducts.sort((firstProduct, secondProduct) =>
        String(firstProduct.name || "").localeCompare(
          String(secondProduct.name || ""),
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );

    case "name-desc":
      return sortedProducts.sort((firstProduct, secondProduct) =>
        String(secondProduct.name || "").localeCompare(
          String(firstProduct.name || ""),
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );

    case "oldest":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          new Date(firstProduct.createdAt).getTime() -
          new Date(secondProduct.createdAt).getTime(),
      );

    case "newest":
    default:
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          new Date(secondProduct.createdAt).getTime() -
          new Date(firstProduct.createdAt).getTime(),
      );
  }
};

const getProducts = async (req, res) => {
  try {
    const filter = buildProductFilter(req.query);

    const requestedPage = Number.parseInt(
      req.query.page,
      10,
    );

    const requestedLimit = Number.parseInt(
      req.query.limit,
      10,
    );

    const page =
      Number.isFinite(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    /*
     * A missing limit returns every matching product.
     * This preserves compatibility with existing pages that call
     * getProducts() without pagination.
     */
    const limit =
      Number.isFinite(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 0;

    const sortOption = String(
      req.query.sort || "newest",
    ).trim();

    const matchingProducts = await Product.find(
      filter,
    ).lean();

    const sortedProducts = sortProducts(
      matchingProducts,
      sortOption,
    );

    const total = sortedProducts.length;

    let products = sortedProducts;
    let totalPages = total > 0 ? 1 : 0;

    if (limit > 0) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      products = sortedProducts.slice(
        startIndex,
        endIndex,
      );

      totalPages = Math.ceil(total / limit);
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      limit: limit || total,
      totalPages,
      hasNextPage:
        limit > 0 && page < totalPages,
      hasPreviousPage:
        limit > 0 && page > 1,
      filters: {
        q: req.query.q || "",
        category: req.query.category || "",
        type: req.query.type || "",
        purity: req.query.purity || "",
        collection: req.query.collection || "",
        availability:
          req.query.availability || "",
        branch: req.query.branch || "",
        featured: req.query.featured || "",
        trending: req.query.trending || "",
        sort: sortOption,
      },
      products,
    });
  } catch (error) {
    console.error(
      "Unable to fetch products:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
      error: error.message,
    });
  }
};

const getProductSuggestions = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (query.length < 2) {
      return res.status(200).json({
        success: true,
        query,
        count: 0,
        suggestions: [],
      });
    }

    const requestedLimit = Number.parseInt(
      req.query.limit,
      10,
    );

    const limit =
      Number.isFinite(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 10)
        : 6;

    const searchRegex = new RegExp(
      escapeRegExp(query),
      "i",
    );

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { category: searchRegex },
        { type: searchRegex },
        { collection: searchRegex },
        { purity: searchRegex },
      ],
    })
      .select(
        [
          "name",
          "code",
          "category",
          "type",
          "collection",
          "purity",
          "price",
          "image",
          "branchAvailability",
          "featured",
          "trending",
        ].join(" "),
      )
      .limit(30)
      .lean();

    const normalizedQuery = query.toLowerCase();

    const rankedProducts = products
      .map((product) => {
        const name = String(
          product.name || "",
        ).toLowerCase();

        const code = String(
          product.code || "",
        ).toLowerCase();

        const category = String(
          product.category || "",
        ).toLowerCase();

        const type = String(
          product.type || "",
        ).toLowerCase();

        const collection = String(
          product.collection || "",
        ).toLowerCase();

        let score = 0;

        if (code === normalizedQuery) {
          score += 120;
        } else if (
          code.startsWith(normalizedQuery)
        ) {
          score += 95;
        } else if (
          code.includes(normalizedQuery)
        ) {
          score += 70;
        }

        if (name === normalizedQuery) {
          score += 110;
        } else if (
          name.startsWith(normalizedQuery)
        ) {
          score += 90;
        } else if (
          name.includes(normalizedQuery)
        ) {
          score += 65;
        }

        if (
          category === normalizedQuery
        ) {
          score += 55;
        } else if (
          category.includes(
            normalizedQuery,
          )
        ) {
          score += 35;
        }

        if (type === normalizedQuery) {
          score += 50;
        } else if (
          type.includes(normalizedQuery)
        ) {
          score += 30;
        }

        if (
          collection.includes(
            normalizedQuery,
          )
        ) {
          score += 25;
        }

        if (product.featured) {
          score += 8;
        }

        if (product.trending) {
          score += 5;
        }

        return {
          ...product,
          score,
        };
      })
      .sort(
        (firstProduct, secondProduct) =>
          secondProduct.score -
          firstProduct.score,
      )
      .slice(0, limit)
      .map(({ score, ...product }) => product);

    return res.status(200).json({
      success: true,
      query,
      count: rankedProducts.length,
      suggestions: rankedProducts,
    });
  } catch (error) {
    console.error(
      "Unable to fetch product suggestions:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve product suggestions.",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(
      id,
    ).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Unable to fetch product:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch the product.",
      error: error.message,
    });
  }
};

export {
  getProducts,
  getProductSuggestions,
  getProductById,
};