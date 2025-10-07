import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

function OrderSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: "40px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", padding: "40px" }}>
                <Result
                    status="success"
                    title="Order Placed Successfully!"
                    subTitle={`Order ID: ${orderId}. Your order has been received and is being processed.`}
                    extra={[
                        <Button type="primary" key="products" onClick={() => navigate("/products")}>
                            Continue Shopping
                        </Button>,
                        <Button key="cart" onClick={() => navigate("/cart")}>
                            View Cart
                        </Button>,
                    ]}
                />
            </div>
        </div>
    );
}

export default OrderSuccess;
