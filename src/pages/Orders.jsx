import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, message, Spin, Empty, Tabs } from 'antd';
import orderService from '../services/orderService';
import './Orders.css';

const { TabPane } = Tabs;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Order status mapping
  const ORDER_STATUS = {
    0: { text: 'Pending Payment', color: 'orange' },
    1: { text: 'Paid', color: 'blue' },
    2: { text: 'Shipped', color: 'cyan' },
    3: { text: 'Completed', color: 'green' },
    4: { text: 'Cancelled', color: 'red' },
  };

  // Fetch orders
  const fetchOrders = async (page = 1, status = null) => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders(
        page - 1, // Backend uses 0-based pages
        pageSize,
        status
      );

      if (response.data) {
        setOrders(response.data.content || []);
        setTotal(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const statusFilter = activeTab === 'all' ? null : parseInt(activeTab);
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, activeTab]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // View order details
  const viewOrderDetail = (orderId) => {
    navigate(`/order-success/${orderId}`);
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      message.success('Order cancelled successfully');
      fetchOrders(currentPage, activeTab === 'all' ? null : parseInt(activeTab));
    } catch (error) {
      console.error('Failed to cancel order:', error);
      message.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Pay order
  const handlePayOrder = async (orderId) => {
    try {
      await orderService.payOrder(orderId);
      message.success('Payment successful');
      fetchOrders(currentPage, activeTab === 'all' ? null : parseInt(activeTab));
    } catch (error) {
      console.error('Failed to pay order:', error);
      message.error(error.response?.data?.message || 'Payment failed');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Order No',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 200,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount?.toFixed(2)}`,
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={ORDER_STATUS[status]?.color}>
          {ORDER_STATUS[status]?.text || 'Unknown'}
        </Tag>
      ),
      width: 150,
    },
    {
      title: 'Items',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="order-actions">
          <Button
            type="link"
            onClick={() => viewOrderDetail(record.id)}
          >
            View Details
          </Button>
          {record.status === 0 && (
            <>
              <Button
                type="link"
                onClick={() => handlePayOrder(record.id)}
              >
                Pay Now
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleCancelOrder(record.id)}
              >
                Cancel
              </Button>
            </>
          )}
          {record.status === 1 && record.canBeCancelled && (
            <Button
              type="link"
              danger
              onClick={() => handleCancelOrder(record.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="orders-container">
      <Card title="My Orders" className="orders-card">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="All Orders" key="all" />
          <TabPane tab="Pending Payment" key="0" />
          <TabPane tab="Paid" key="1" />
          <TabPane tab="Shipped" key="2" />
          <TabPane tab="Completed" key="3" />
          <TabPane tab="Cancelled" key="4" />
        </Tabs>

        <Spin spinning={loading}>
          {orders.length === 0 ? (
            <Empty description="No orders found" />
          ) : (
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: handlePageChange,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} orders`,
              }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Orders;
