import React, { useState, useEffect } from "react";
import { useParams, useNavigate, RouterProvider } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  Button,
  InputNumber,
  Typography,
  Spin,
  message,
  Breadcrumb,
  Divider,
  Tag,
  Rate,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { getProductById } from "../services/productService";
import { useCart } from "../store/cartContext";

const { Title, Text, Paragraph } = Typography;

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getProductById(id);

        if (result.success) {
          setProduct(result.data);
          setSelectedImage(result.data.mainImage);
        } else {
          message.error("Failed to load product details");
          navigate("/products");
        }
      } catch (error) {
        message.error("Failed to load product details");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    console.log("🛒 Adding to cart...");
    messageApi.success("123123");
    const result = await addItem({
      productId: product.id,
      quantity: quantity,
    });

    console.log("📦 Add to cart result:", result);

    if (result && result.success) {
      console.log("✅ Success! Showing message...");
      navigate("/cart");
      message.success("Product added to cart successfully!");
      // Wait for message to show before navigating
    } else {
      console.log("❌ Failed! Showing error...");
      message.error(result?.message || "Failed to add product to cart");
    }
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Title level={3}>Product not found</Title>
        <Button type="primary" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 50px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
        <Breadcrumb.Item>
          {product.category?.name || "Category"}
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[32, 32]}>
        {/* Left Side - Images */}
        <Col xs={24} md={12}>
          <div style={{ position: "sticky", top: "20px" }}>
            {/* Main Image */}
            <div
              style={{
                marginBottom: "16px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "500px",
                  objectFit: "cover",
                }}
                preview={{
                  mask: "Click to view",
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 0 && (
              <Row gutter={8}>
                <Col span={6}>
                  <div
                    onClick={() => setSelectedImage(product.mainImage)}
                    style={{
                      cursor: "pointer",
                      border:
                        selectedImage === product.mainImage
                          ? "2px solid #1890ff"
                          : "1px solid #f0f0f0",
                      borderRadius: "4px",
                      overflow: "hidden",
                      padding: "4px",
                    }}
                  >
                    <img
                      src={product.mainImage}
                      alt="Main"
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </Col>
                {product.images.slice(0, 3).map((image, index) => (
                  <Col span={6} key={index}>
                    <div
                      onClick={() => setSelectedImage(image)}
                      style={{
                        cursor: "pointer",
                        border:
                          selectedImage === image
                            ? "2px solid #1890ff"
                            : "1px solid #f0f0f0",
                        borderRadius: "4px",
                        overflow: "hidden",
                        padding: "4px",
                      }}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Col>

        {/* Right Side - Product Details */}
        <Col xs={24} md={12}>
          {/* Product Name */}
          <Title level={2} style={{ marginBottom: "8px" }}>
            {product.name}
          </Title>

          {/* Brand */}
          {product.brand && (
            <Text
              type="secondary"
              style={{
                fontSize: "16px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Brand: <Text strong>{product.brand}</Text>
            </Text>
          )}

          {/* Rating */}
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Rate disabled defaultValue={4.5} allowHalf />
            <Text type="secondary">(4.5 out of 5)</Text>
            <Text type="secondary">836 ratings</Text>
          </div>

          {/* Best Seller Tag */}
          <div style={{ marginBottom: "16px" }}>
            <Tag
              color="orange"
              style={{ fontSize: "12px", padding: "2px 8px" }}
            >
              #1 Best Seller
            </Tag>
            <Text type="secondary" style={{ marginLeft: "8px" }}>
              in {product.category?.name || "Category"}
            </Text>
          </div>

          <Divider />

          {/* Price */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={2} style={{ color: "#B12704", marginBottom: "0" }}>
              ${product.price.toFixed(2)}
            </Title>
            <Text type="secondary">All prices include VAT.</Text>
          </div>

          {/* Stock Status */}
          <div style={{ marginBottom: "16px" }}>
            {product.stock > 0 ? (
              <Text style={{ color: "#067d62", fontSize: "18px" }}>
                <strong>In Stock</strong>
              </Text>
            ) : (
              <Text style={{ color: "#B12704", fontSize: "18px" }}>
                <strong>Out of Stock</strong>
              </Text>
            )}
          </div>

          {/* Product Specifications */}
          {product.specifications && (
            <div
              style={{
                background: "#f9f9f9",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "16px",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                Product Specifications
              </Text>
              <table style={{ width: "100%" }}>
                <tbody>
                  {product.category && (
                    <tr>
                      <td style={{ padding: "8px 0", width: "40%" }}>
                        <Text type="secondary">Category</Text>
                      </td>
                      <td style={{ padding: "8px 0" }}>
                        <Text>{product.category.name}</Text>
                      </td>
                    </tr>
                  )}
                  {product.brand && (
                    <tr>
                      <td style={{ padding: "8px 0" }}>
                        <Text type="secondary">Brand Name</Text>
                      </td>
                      <td style={{ padding: "8px 0" }}>
                        <Text>{product.brand}</Text>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: "8px 0" }}>
                      <Text type="secondary">Material</Text>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      <Text>{product.material || "Stainless Steel"}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0" }}>
                      <Text type="secondary">Color</Text>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      <Text>{product.color || "Navy"}</Text>
                    </td>
                  </tr>
                  {product.capacity && (
                    <tr>
                      <td style={{ padding: "8px 0" }}>
                        <Text type="secondary">Capacity</Text>
                      </td>
                      <td style={{ padding: "8px 0" }}>
                        <Text>{product.capacity}</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Quantity Selector and Add to Cart */}
          <div
            style={{
              background: "#f0f2f5",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Quantity:
              </Text>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                style={{ width: "100px" }}
              />
              <Text type="secondary" style={{ marginLeft: "12px" }}>
                ({product.stock} available)
              </Text>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              block
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "12px",
              }}
            >
              Add to Cart
            </Button>

            <Button
              size="large"
              block
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "500",
              }}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>

          {/* Additional Actions */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <Button icon={<HeartOutlined />} style={{ flex: 1 }}>
              Add to Wishlist
            </Button>
            <Button icon={<ShareAltOutlined />} style={{ flex: 1 }}>
              Share
            </Button>
          </div>

          <Divider />

          {/* Product Description */}
          <div>
            <Title level={4}>About this item</Title>
            <Paragraph style={{ fontSize: "14px", lineHeight: "1.6" }}>
              {product.description ||
                "This product features premium quality materials and excellent craftsmanship. Perfect for everyday use and makes a great gift."}
            </Paragraph>

            {/* Additional Features */}
            <ul style={{ fontSize: "14px", lineHeight: "1.8" }}>
              <li>High-quality construction for durability</li>
              <li>Easy to clean and maintain</li>
              <li>Vacuum insulated to keep drinks hot or cold for hours</li>
              <li>Leak-proof lid for worry-free transport</li>
              <li>Fits most cup holders</li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ProductDetail;
