import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authContext";
import { Button, Checkbox, Form, Input, message, Row, Col, Card } from "antd";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const { login, register, logout, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (value) => {
    setFormData(value);
  };
  const [messageApi, contextHolder] = message.useMessage();

  const onLoginFinish = async (values) => {
    try {
      // Send login request to server using auth context
      const result = await login(values.username, values.password);
      console.log("result", result);
      if (result.success) {
        // Redirect user on success
        messageApi.open({
          type: "success",
          content: "Login successful!",
        });
        navigate("/products");
        // message.success("Login successful!");
      } else {
        messageApi.open({
          type: "error",
          content: result.message || "Login failed",
        });
      }
    } catch (error) {
      // Handle login failure
      messageApi.open({
        type: "error",
        content: result.message || "Login failed",
      });
    }
  };

  const onRegisterFinish = async (values) => {
    try {
      const result = await register(values);
      console.log("register result", result);
      // Handle registration logic here
      if (result.success) {
        messageApi.open({
          type: "success",
          content: "Registration successful!",
        });
        setIsLogin(true); // Switch to login after successful registration
      } else {
        messageApi.open({
          type: "error",
          content: result.message || "Register failed",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Registration failed",
      });
    }
  };

  // const isFormValid = formData.username.trim() && formData.password.trim();

  const LoginForm = () => (
    <Form
      name="loginForm"
      layout="vertical"
      initialValues={{ remember: true }}
      onValuesChange={handleChange}
      onFinish={onLoginFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="username"
        initialValue={"Abel"}
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        initialValue={"Abel123"}
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked">
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isLoading}
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = () => (
    <Form
      name="registerForm"
      layout="vertical"
      onFinish={onRegisterFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input size="large" />
      </Form.Item>
      <Form.Item
        label="Phone"
        name="phone"
        rules={[
          { required: false, message: "Please input your phone!" },
          { type: "phone", message: "Please enter a valid phone!" },
        ]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please input your password!" },
          { min: 6, message: "Password must be at least 6 characters!" },
          { max: 20, message: "Password cannot exceed 20 characters!" }
        ]}
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block>
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{ margin: 0, padding: 0, overflow: false }}>
      {contextHolder}
      <Row style={{ minHeight: "100%", margin: 0, width: "70vw" }}>
        {/* Left side - Image */}
        <Col
          xs={0}
          md={12}
          lg={12}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            // backgroundColor: '#f0f2f5'
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "3rem",
                margin: "0 0 2rem 0",
                color: "#1890ff",
              }}
            >
              TechMart
            </h1>
            <img
              src="/TechMart.png"
              alt="TechMart Logo"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "400px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </Col>

        {/* Right side - Form */}
        <Col
          xs={24}
          md={12}
          lg={12}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            backgroundColor: "#fff",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p style={{ color: "#666", marginTop: "0.5rem" }}>
                {isLogin
                  ? "Sign in to your account"
                  : "Sign up for a new account"}
              </p>
            </div>

            {isLogin ? <LoginForm /> : <RegisterForm />}

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Button
                type="link"
                onClick={() => {
                  if (isLogin) {
                    // Clear token when switching to register
                    logout();
                  }
                  setIsLogin(!isLogin);
                }}
                style={{ padding: 0 }}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
