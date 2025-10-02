import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, InputNumber, Typography, Empty, Divider, Checkbox } from "antd";
import { useCart } from "../store/cartContext";

const { Title, Text } = Typography;

function Cart(){
    const { items, totalItems, totalPrice, removeItem, updateQuantity, loadCart } = useCart();
    const [selectedItems, setSelectedItems] = useState({});

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
        if(result.success){
               async () => {await loadCart()};
        }
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
    const selectedTotal = items.reduce((total, item) => {
        if (selectedItems[item.id]) {
            return total + (item.productPrice * item.quantity);
        }
        return total;
    }, 0);

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
        <div style={{ padding: "20px" }}>
            <Row gutter={[24, 24]} style={{ maxWidth: "1800px", margin: "0 auto" }}>
                {/* Left side - Cart items list */}
                <Col xs={24} lg={18}>
                    <Title level={2}>Shopping Basket</Title>

                    {/* Select All checkbox */}
                    <div style={{ marginBottom: "16px" }}>
                        <Checkbox
                            checked={allSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        >
                            Select All ({items.length} item{items.length > 1 ? 's' : ''})
                        </Checkbox>
                    </div>

                    {items.map((item) => (
                        <Card key={item.id} style={{ marginBottom: "16px" }} bordered>
                            <Row align="middle" gutter={[16, 16]}>
                                {/* Checkbox */}
                                <Col xs={2} sm={1}>
                                    <Checkbox
                                        checked={selectedItems[item.id] || false}
                                        onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                                    />
                                </Col>

                                {/* Product image */}
                                <Col xs={6} sm={4}>
                                    <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        style={{
                                            width: "100%",
                                            maxWidth: "120px",
                                            height: "120px",
                                            objectFit: "cover"
                                        }}
                                    />
                                </Col>

                                {/* Product details */}
                                <Col xs={10} sm={13}>
                                    <Title level={4} style={{ marginBottom: "4px" }}>{item.productName}</Title>
                                    <Text type="secondary">In stock</Text>
                                    <div style={{ marginTop: "12px" }}>
                                        <InputNumber
                                            min={1}
                                            value={item.quantity}
                                            onChange={(value) => handleQuantityChange(item.id, value)}
                                            style={{ width: "60px", marginRight: "8px" }}
                                        />
                                        <Button type="link" onClick={() => handleRemoveItem(item.id)}>Delete</Button>
                                    </div>
                                </Col>

                                {/* Price */}
                                <Col xs={6} sm={6} style={{ textAlign: "right" }}>
                                    <Text strong style={{ fontSize: "18px" }}>
                                        ${(item.productPrice * item.quantity).toFixed(2)}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>
                    ))}

                    <Divider />
                    <Text strong style={{ fontSize: "18px" }}>
                        Subtotal ({selectedCount} selected item{selectedCount !== 1 ? 's' : ''}): ${selectedTotal.toFixed(2)}
                    </Text>
                </Col>

                {/* Right side - Sticky checkout summary */}
                <Col xs={24} lg={6}>
                    <Card style={{ position: "sticky", top: "16px" }}>
                        <Text strong style={{ fontSize: "18px", display: "block", marginBottom: "8px" }}>
                            Subtotal ({selectedCount} item{selectedCount !== 1 ? 's' : ''}): ${selectedTotal.toFixed(2)}
                        </Text>
                        <Button
                            type="primary"
                            size="large"
                            block
                            disabled={selectedCount === 0}
                        >
                            Proceed to Checkout
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Cart;