import api from "./api";

export const productPagination = async (params = {}) => {
  try {
    console.log("params", params);
    const response = await api.get("/products", {
      params: {
        page: params.current || 1,
        size: params.pageSize || 10,
        categoryId: params.categoryId || null,
        status: params.status || 1,
        sortBy: params.sortBy || "createdAt",
        sortDir: params.sortDir || "desc",
      }
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    console.error("❌ Product pagination failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch products",
    };
  }
};

export const searchProductByName = async (name) => {
  try {
    const response = await api.get(`/products/search`, {
      params: { name },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    console.error("❌ Product search failed:", error);
    return {
      success: false,
      message: error.message || "Failed to search products",
    };
  }
};
