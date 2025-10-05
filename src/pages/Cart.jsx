import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, InputNumber, Typography, Empty, Divider, Checkbox } from "antd";
import { useCart } from "../store/cartContext";

const { Title, Text } = Typography;

function Cart(){
    const { items, totalItems, totalPrice, removeItem, updateQuantity, loadCart } = useCart();
    const [selectedItems, setSelectedItems] = useState({});

    console.log('totalItems',totalItems);

    // Initialize all items as selected when cart loads
    useEffect(() => {
        const initialSelected = {};
        items.forEach(item => {
            initialSelected[item.id] = true;
        });
        setSelectedItems(initialSelected);
    }, [items.length]);

    const handleQuantityChange = async ( cartItemId, newQuantity) => {
        const result = await updateQuantity( cartItemId, newQuantity);
    };

    const handleRemoveItem = async (productId) => {
        await removeItem(productId);
    };

    const handleItemSelect = (itemId, checked) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: checked
        }));
    };

    const handleSelectAll = (checked) => {
        const newSelected = {};
        items.forEach(item => {
            newSelected[item.id] = checked;
        });
        setSelectedItems(newSelected);
    };

    // Calculate totals based on selected items
    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    const selectedTotal = Array.isArray(items) ? items.reduce((total, item) => {
        if (selectedItems[item.id]) {
            return total + (item.productPrice * item.quantity);
        }
        return total;
    }, 0) : 0;

    if (items.length === 0) {
        return (
            <div style={{ padding: "20px" }}>
                <Title level={2}>Shopping Cart</Title>
                <Empty description="Your cart is empty" />
            </div>
        );
    }

    const allSelected = items.length > 0 && selectedCount === items.length;

    return (
        <div style={{ padding: "20px", width: "100%", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <Row gutter={[20, 20]} style={{ maxWidth: "1600px", margin: "0 auto" }}>
                {/* Left side - Shopping cart items */}
                <Col xs={24} lg={17}>
                    <div style={{ backgroundColor: "white", padding: "20px" }}>
                        <Title level={2} style={{ margin: "0 0 20px 0" }}>Shopping Basket</Title>

                        {/* Select All checkbox */}
                        <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e8e8e8" }}>
                            <Checkbox
                                checked={allSelected}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            >
                                Select All ({items.length} item{items.length > 1 ? 's' : ''})
                            </Checkbox>
                        </div>

                        {items.map((item) => (
                            <div key={item.id} style={{ borderBottom: "1px solid #e8e8e8", padding: "20px 0" }}>
                                <Row align="middle" gutter={[16, 16]}>
                                    {/* Checkbox */}
                                    <Col flex="30px">
                                        <Checkbox
                                            checked={selectedItems[item.id] || false}
                                            onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                                        />
                                    </Col>

                                    {/* Product image */}
                                    <Col flex="180px">
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            style={{
                                                width: "160px",
                                                height: "160px",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </Col>

                                    {/* Product details */}
                                    <Col flex="auto">
                                        <Title level={4} style={{ marginBottom: "8px" }}>{item.productName}</Title>
                                        <Text type="secondary" style={{ display: "block", marginBottom: "12px" }}>In stock</Text>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <InputNumber
                                                min={1}
                                                value={item.quantity}
                                                onChange={(value) => handleQuantityChange(item.id, value)}
                                                style={{ width: "80px" }}
                                            />
                                            <Button type="link" onClick={() => handleRemoveItem(item.id)} style={{ padding: 0 }}>
                                                Delete
                                            </Button>
                                        </div>
                                    </Col>

                                    {/* Price */}
                                    <Col flex="120px" style={{ textAlign: "right" }}>
                                        <Text strong style={{ fontSize: "22px" }}>
                                            ${(item.productPrice * item.quantity).toFixed(2)}
                                        </Text>
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        {/* Bottom subtotal */}
                        <div style={{ padding: "20px 0", textAlign: "right" }}>
                            <Text strong style={{ fontSize: "18px" }}>
                                Subtotal ({selectedCount} item{selectedCount !== 1 ? 's' : ''}): ${selectedTotal.toFixed(2)}
                            </Text>
                        </div>
                    </div>
                </Col>

                {/* Right side - Checkout summary */}
                <Col xs={24} lg={7}>
                    <div style={{ backgroundColor: "white", padding: "20px", position: "sticky", top: "20px" }}>
                        <Text strong style={{ fontSize: "18px", display: "block", marginBottom: "12px" }}>
                            Subtotal ({selectedCount} item{selectedCount !== 1 ? 's' : ''}):
                        </Text>
                        <Text strong style={{ fontSize: "24px", display: "block", marginBottom: "20px" }}>
                            ${selectedTotal.toFixed(2)}
                        </Text>
                        <Button
                            type="primary"
                            size="large"
                            block
                            disabled={selectedCount === 0}
                            style={{ marginBottom: "12px" }}
                        >
                            Proceed to Checkout
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default Cart;
