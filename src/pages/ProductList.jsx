import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row, Spin, Pagination } from "antd";
import { productPagination } from "../services/productService";

const { Meta } = Card;

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const onChange = async (current, pageSize) => {
    console.log("Page: values", current, pageSize);
    const result = await productPagination({
      current: current,
      pageSize: pageSize
    });
    if (result.success) {
      setProducts(result.data.content);
    }
  };

  useEffect(() => {
    // Define an async function
    const fetchProducts = async () => {
      try {
        const result = await productPagination();
        console.log("productList", result);
        if (result.success) {
          setProducts(result.data.content);
        }
      } catch (error) {}
    };

    // Call it
    fetchProducts();
  }, []);

  //   if (loading) {
  //     return (
  //       <Spin
  //         size="large"
  //         style={{ display: "block", textAlign: "center", marginTop: "50px" }}
  //       />
  //     );
  //   }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Products</h1>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.mainImage} />}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <Meta title={product.name} description={`$${product.price}`} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row>
        <Pagination
          showQuickJumper
          defaultCurrent={2}
          total={500}
          onChange={onChange}
        />
      </Row>
    </div>
  );
}

export default ProductList;
