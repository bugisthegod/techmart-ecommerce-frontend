import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Row, Col, Typography, Divider, Radio, message } from "antd";
import { useCart } from "../store/cartContext";
import orderService from "../services/orderService";
import addressService from "../services/addressService";

const { Title, Text } = Typography;

function Checkout() {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("credit_card");

    // Calculate totals
    const subtotal = items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    const onFinish = async (values) => {
        setLoading(true);

        try {
            // Step 1: Create address
            const addressData = {
                receiverName: values.fullName,
                phone: values.phone,
                province: values.state,
                city: values.city,
                district: values.city, // Using city as district for simplicity
                detailAddress: values.address,
                postalCode: values.postalCode,
                isDefault: false,
            };

            const addressResult = await addressService.createAddress(addressData);

            if (!addressResult.success) {
                message.error("Failed to save address");
                setLoading(false);
                return;
            }

            const addressId = addressResult.data.id;

            // Step 2: Create order with the address ID
            const orderData = {
                addressId: addressId,
                comment: `Payment method: ${paymentMethod}`,
                freightType: "standard",
            };

            const orderResult = await orderService.createOrder(orderData);

            if (orderResult.success) {
                message.success("Order placed successfully!");
                await clearCart();
                // Navigate to success page with order ID
                navigate(`/order-success/${orderResult.data.id}`);
            } else {
                message.error(orderResult.message || "Failed to place order");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            message.error("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <Title level={3}>Your cart is empty</Title>
                <Button type="primary" onClick={() => navigate("/products")}>
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Title level={2}>Checkout</Title>

                <Row gutter={[20, 20]}>
                    {/* Left side - Shipping and Payment forms */}
                    <Col xs={24} lg={16}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            {/* Shipping Address */}
                            <Card title="Shipping Address" style={{ marginBottom: "20px" }}>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item
                                            label="Full Name"
                                            name="fullName"
                                            rules={[{ required: true, message: "Please enter your full name" }]}
                                        >
                                            <Input placeholder="John Doe" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            label="Address"
                                            name="address"
                                            rules={[{ required: true, message: "Please enter your address" }]}
                                        >
                                            <Input placeholder="123 Main Street" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="City"
                                            name="city"
                                            rules={[{ required: true, message: "Please enter your city" }]}
                                        >
                                            <Input placeholder="New York" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="State"
                                            name="state"
                                            rules={[{ required: true, message: "Please enter your state" }]}
                                        >
                                            <Input placeholder="NY" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Postal Code"
                                            name="postalCode"
                                            rules={[{ required: true, message: "Please enter your postal code" }]}
                                        >
                                            <Input placeholder="10001" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Phone"
                                            name="phone"
                                            rules={[{ required: true, message: "Please enter your phone number" }]}
                                        >
                                            <Input placeholder="+1 234 567 8900" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Payment Method */}
                            <Card title="Payment Method" style={{ marginBottom: "20px" }}>
                                <Radio.Group
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    style={{ width: "100%" }}
                                >
                                    <Radio value="credit_card" style={{ display: "block", marginBottom: "10px" }}>
                                        Credit Card
                                    </Radio>
                                    <Radio value="paypal" style={{ display: "block", marginBottom: "10px" }}>
                                        PayPal
                                    </Radio>
                                    <Radio value="cash_on_delivery" style={{ display: "block" }}>
                                        Cash on Delivery
                                    </Radio>
                                </Radio.Group>
                                <Text type="secondary" style={{ display: "block", marginTop: "15px" }}>
                                    Note: This is a demo payment. No actual payment will be processed.
                                </Text>
                            </Card>
                        </Form>
                    </Col>

                    {/* Right side - Order Summary */}
                    <Col xs={24} lg={8}>
                        <Card title="Order Summary">
                            {/* Order items */}
                            <div style={{ marginBottom: "20px" }}>
                                {items.map((item) => (
                                    <div key={item.id} style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <Text strong style={{ display: "block", fontSize: "14px" }}>
                                                {item.productName}
                                            </Text>
                                            <Text type="secondary">Qty: {item.quantity}</Text>
                                            <Text strong style={{ display: "block" }}>
                                                ${(item.productPrice * item.quantity).toFixed(2)}
                                            </Text>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Divider />

                            {/* Price breakdown */}
                            <div style={{ marginBottom: "10px" }}>
                                <Row justify="space-between">
                                    <Text>Subtotal:</Text>
                                    <Text>${subtotal.toFixed(2)}</Text>
                                </Row>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <Row justify="space-between">
                                    <Text>Shipping:</Text>
                                    <Text>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</Text>
                                </Row>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <Row justify="space-between">
                                    <Text>Tax (10%):</Text>
                                    <Text>${tax.toFixed(2)}</Text>
                                </Row>
                            </div>

                            <Divider />

                            <div style={{ marginBottom: "20px" }}>
                                <Row justify="space-between">
                                    <Text strong style={{ fontSize: "18px" }}>Total:</Text>
                                    <Text strong style={{ fontSize: "18px" }}>${total.toFixed(2)}</Text>
                                </Row>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={() => form.submit()}
                                loading={loading}
                            >
                                {loading ? "Processing..." : "Place Order"}
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Checkout;
