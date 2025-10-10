import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Radio,
  message,
  Select,
  Space,
  Spin,
  Checkbox,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCart } from "../store/cartContext";
import orderService from "../services/orderService";
import addressService from "../services/addressService";

const { Title, Text } = Typography;
const { Option } = Select;

function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [orderToken, setOrderToken] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Calculate totals
  const subtotal = items
    .filter(checkSelectedItem())
    .reduce((total, item) => total + item.productPrice * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Debug state changes
  useEffect(() => {
    console.log("State changed:", {
      loadingAddresses,
      showAddressForm,
      savedAddressesCount: savedAddresses.length,
      selectedAddressId,
    });
  }, [loadingAddresses, showAddressForm, savedAddresses, selectedAddressId]);

  // Load addresses and generate order token on mount
  useEffect(() => {
    async function initializeCheckout() {
      try {
        setLoadingAddresses(true);

        // Fetch saved addresses
        const addressResponse = await addressService.getUserAddresses();
        console.log("Address response:", addressResponse);

        // Handle different response structures
        let addresses = [];
        if (addressResponse.success && addressResponse.data) {
          addresses = addressResponse.data;
        } else if (addressResponse.data) {
          // Response might just have data without success flag
          addresses = addressResponse.data;
        } else if (Array.isArray(addressResponse)) {
          // Response might be the array directly
          addresses = addressResponse;
        }

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);

          // Auto-select default address if exists
          const defaultAddress = addresses.find((addr) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else {
            // If no default, select first address
            setSelectedAddressId(addresses[0].id);
          }
        } else {
          // No addresses, show form
          console.log("No saved addresses found, showing address form");
          setSavedAddresses([]);
          setShowAddressForm(true);
        }

        // Generate order token for idempotency
        const tokenResponse = await orderService.generateOrderToken();
        console.log("Order token response:", tokenResponse);

        if (tokenResponse.success) {
          setOrderToken(tokenResponse.data);
        } else if (tokenResponse.data) {
          // Handle case where response structure is different
          setOrderToken(tokenResponse.data);
        }
      } catch (error) {
        console.error("Initialize checkout error:", error);
        console.error("Error details:", error.response || error);

        // Show address form if loading fails
        setShowAddressForm(true);

        // Only show error if it's not a "no addresses" scenario
        if (error.response?.status !== 404) {
          message.error("Failed to load checkout data");
        }
      } finally {
        setLoadingAddresses(false);
      }
    }

    initializeCheckout();
  }, []);

  // Handle saving a new address (separate from placing order)
  const handleSaveNewAddress = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields([
        "fullName",
        "address",
        "city",
        "state",
        "postalCode",
        "phone",
        "isDefault",
      ]);

      setLoading(true);

      // Create new address
      const addressData = {
        receiverName: values.fullName,
        receiverPhone: values.phone,
        province: values.state,
        city: values.city,
        district: values.city,
        detailAddress: values.address,
        postalCode: values.postalCode,
        isDefault:
          values.isDefault !== undefined
            ? values.isDefault == true? 1: 0
            : savedAddresses.length === 0,
      };

      const addressResult = await addressService.createAddress(addressData);

      if (addressResult.success || addressResult.data) {
        const newAddress = addressResult.data;
        message.success("Address saved successfully!");

        // Add to saved addresses list
        setSavedAddresses([...savedAddresses, newAddress]);

        // Select the newly created address
        setSelectedAddressId(newAddress.id);

        // Hide the form and show saved addresses
        setShowAddressForm(false);

        // Clear form
        form.resetFields();
      } else {
        message.error("Failed to save address");
      }
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        message.error("Please fill in all required fields");
      } else {
        console.error("Save address error:", error);
        message.error("Failed to save address. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    setLoading(true);

    try {
      // Step 1: Validate that a saved address is selected
      if (!selectedAddressId) {
        message.error("Please save your address first before placing order");
        setLoading(false);
        return;
      }

      const addressId = selectedAddressId;

      // Validate order token
      if (!orderToken) {
        message.error("Order token is missing. Please refresh the page.");
        setLoading(false);
        return;
      }

      // Step 2: Create order with the address ID and token
      const orderData = {
        addressId: addressId,
        comment: `Payment method: ${paymentMethod}`,
        freightType: "standard",
      };

      const orderResult = await orderService.createOrder(orderData, orderToken);

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

  function checkSelectedItem() {
    return function (item) {
      return item.selected === 1;
    };
  }

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
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
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
                {loadingAddresses ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin tip="Loading addresses..." />
                  </div>
                ) : (
                  <>
                    {/* Show saved addresses if user has any */}
                    {!showAddressForm && savedAddresses.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "10px" }}
                        >
                          Select delivery address:
                        </Text>
                        <Radio.Group
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          style={{ width: "100%" }}
                        >
                          {savedAddresses.map((address) => (
                            <Radio
                              key={address.id}
                              value={address.id}
                              style={{
                                display: "block",
                                marginBottom: "15px",
                                padding: "12px",
                                border:
                                  selectedAddressId === address.id
                                    ? "2px solid #1890ff"
                                    : "1px solid #d9d9d9",
                                borderRadius: "4px",
                              }}
                            >
                              <div style={{ marginLeft: "8px" }}>
                                <Text strong>{address.receiverName}</Text>
                                {address.isDefault && (
                                  <Text
                                    type="secondary"
                                    style={{
                                      marginLeft: "8px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    (Default)
                                  </Text>
                                )}
                                <br />
                                <Text type="secondary">
                                  {address.detailAddress}, {address.city},{" "}
                                  {address.province} {address.postalCode}
                                </Text>
                                <br />
                                <Text type="secondary">
                                  Phone: {address.phone}
                                </Text>
                              </div>
                            </Radio>
                          ))}
                        </Radio.Group>
                        <Button
                          type="link"
                          icon={<PlusOutlined />}
                          onClick={() => setShowAddressForm(true)}
                          style={{ marginTop: "10px", padding: 0 }}
                        >
                          Add new address
                        </Button>
                      </div>
                    )}

                    {/* Show address form for new address or when user has no addresses */}
                    {showAddressForm && (
                      <div>
                        {savedAddresses.length > 0 && (
                          <Button
                            type="link"
                            onClick={() => setShowAddressForm(false)}
                            style={{ marginBottom: "10px", padding: 0 }}
                          >
                            ← Use saved address
                          </Button>
                        )}
                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item
                              label="Full Name"
                              name="fullName"
                              rules={[
                                {
                                  required: showAddressForm,
                                  message: "Please enter your full name",
                                },
                              ]}
                            >
                              <Input placeholder="John Doe" />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              label="Address"
                              name="address"
                              rules={[
                                {
                                  required: showAddressForm,
                                  message: "Please enter your address",
                                },
                              ]}
                            >
                              <Input placeholder="123 Main Street" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="City"
                              name="city"
                              rules={[
                                {
                                  required: showAddressForm,
                                  message: "Please enter your city",
                                },
                              ]}
                            >
                              <Input placeholder="New York" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="State"
                              name="state"
                              rules={[
                                {
                                  required: showAddressForm,
                                  message: "Please enter your state",
                                },
                              ]}
                            >
                              <Input placeholder="NY" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Postal Code"
                              name="postalCode"
                              rules={[
                                {
                                  required: showAddressForm,
                                  message: "Please enter your postal code",
                                },
                              ]}
                            >
                              <Input placeholder="10001" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Phone"
                              name="phone"
                              rules={[
                                {
                                  required: showAddressForm,
                                  message: "Please enter your phone number",
                                },
                              ]}
                            >
                              <Input placeholder="+1 234 567 8900" />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              name="isDefault"
                              valuePropName="checked"
                              initialValue={savedAddresses.length === 0}
                            >
                              <Checkbox disabled={savedAddresses.length === 0}>
                                Set as default address
                                {savedAddresses.length === 0 && (
                                  <Text
                                    type="secondary"
                                    style={{
                                      marginLeft: "8px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    (This will be your first address)
                                  </Text>
                                )}
                              </Checkbox>
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Action buttons for new address form */}
                        <div
                          style={{
                            marginTop: "15px",
                            padding: "10px",
                            backgroundColor: "#f0f2f5",
                            borderRadius: "4px",
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{
                              display: "block",
                              marginBottom: "10px",
                              fontSize: "13px",
                            }}
                          >
                            💡 Save your address first, then you can place the
                            order
                          </Text>
                          <Space>
                            <Button
                              type="primary"
                              onClick={handleSaveNewAddress}
                              loading={loading}
                            >
                              Save Address
                            </Button>
                            {savedAddresses.length > 0 && (
                              <Button
                                onClick={() => {
                                  setShowAddressForm(false);
                                  form.resetFields();
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Space>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Payment Method */}
              <Card title="Payment Method" style={{ marginBottom: "20px" }}>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Radio
                    value="credit_card"
                    style={{ display: "block", marginBottom: "10px" }}
                  >
                    Credit Card
                  </Radio>
                  <Radio
                    value="paypal"
                    style={{ display: "block", marginBottom: "10px" }}
                  >
                    PayPal
                  </Radio>
                  <Radio value="cash_on_delivery" style={{ display: "block" }}>
                    Cash on Delivery
                  </Radio>
                </Radio.Group>
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: "15px" }}
                >
                  Note: This is a demo payment. No actual payment will be
                  processed.
                </Text>
              </Card>
            </Form>
          </Col>

          {/* Right side - Order Summary */}
          <Col xs={24} lg={8}>
            <Card title="Order Summary">
              {/* Order items */}
              <div style={{ marginBottom: "20px" }}>
                {items.filter(checkSelectedItem()).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: "15px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text
                        strong
                        style={{ display: "block", fontSize: "14px" }}
                      >
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
                  <Text>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </Text>
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
                  <Text strong style={{ fontSize: "18px" }}>
                    Total:
                  </Text>
                  <Text strong style={{ fontSize: "18px" }}>
                    ${total.toFixed(2)}
                  </Text>
                </Row>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={() => form.submit()}
                loading={loading}
                disabled={showAddressForm}
                title={showAddressForm ? "Please save your address first" : ""}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
              {showAddressForm && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginTop: "10px",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  Please save your address first
                </Text>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Checkout;
