import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authContext";
import { Button, Checkbox, Form, Input } from "antd";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  console.log(formData);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (value) => {
    setFormData(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.username, formData.password);

    if (result.success) {
      // Redirect to home page after successful login
      navigate("/");
    }
    // Error handling is automatic through context
  };

  const onFinish = (value) => {
    console.log("Form values:", value);
  };

  // const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Login</h2>

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
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" onSubmit={handleSubmit} htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
