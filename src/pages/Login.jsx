import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authContext";
import { Button, Checkbox, Form, Input, message } from "antd";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (value) => {
    setFormData(value);
  };
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
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
        // navigate("/");
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

  // const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div>
      {contextHolder}
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Login</h2>

      <div>
        
      </div>

      <Form
        name="loginForm"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onValuesChange={handleChange}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          initialValue={"Abel"}
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          initialValue={"Abel123"}
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <div className="auth-links">
        <p>
          Don't have an account?
          <Link to="/register" className="register-link">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
