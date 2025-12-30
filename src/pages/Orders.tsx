import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import orderService from "../services/orderService";
import type { OrderResponse } from "@/api/models";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // Order status mapping
  const ORDER_STATUS: Record<number, { text: string; color: string }> = {
    0: { text: "Pending Payment", color: "bg-orange-500 hover:bg-orange-600" },
    1: { text: "Paid", color: "bg-blue-500 hover:bg-blue-600" },
    2: { text: "Shipped", color: "bg-cyan-500 hover:bg-cyan-600" },
    3: { text: "Completed", color: "bg-green-500 hover:bg-green-600" },
    4: { text: "Cancelled", color: "bg-red-500 hover:bg-red-600" },
  };

  // Fetch orders
  const fetchOrders = useCallback(
    async (page = 1, status?: number) => {
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
        logger.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    const statusFilter = activeTab === "all" ? undefined : parseInt(activeTab);
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, activeTab, fetchOrders]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // View order details
  const viewOrderDetail = (orderId: number) => {
    navigate(`/order-details/${orderId}`);
  };

  // Cancel order
  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      fetchOrders(
        currentPage,
        activeTab === "all" ? undefined : parseInt(activeTab)
      );
    } catch (error: any) {
      logger.error("Failed to cancel order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // Pay order - Navigate to checkout/payment page
  const handlePayOrder = (orderId: number) => {
    // Navigate to checkout page with the order ID
    navigate(`/checkout?orderId=${orderId}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            My Orders
          </CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full mt-4"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-6 h-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="0">Pending</TabsTrigger>
              <TabsTrigger value="1">Paid</TabsTrigger>
              <TabsTrigger value="2">Shipped</TabsTrigger>
              <TabsTrigger value="3">Completed</TabsTrigger>
              <TabsTrigger value="4">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No orders found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border bg-white/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order No</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNo}
                        </TableCell>
                        <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              ORDER_STATUS[order.status ?? 0]?.color || "bg-gray-500"
                            } text-white border-0`}
                          >
                            {ORDER_STATUS[order.status ?? 0]?.text || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.items?.length ?? 0}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt ?? "").toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetail(order.id ?? 0)}
                          >
                            Details
                          </Button>
                          {order.status === 0 && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePayOrder(order.id ?? 0)}
                              >
                                Pay Now
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelOrder(order.id ?? 0)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {order.status === 1 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id ?? 0)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="flex justify-end items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
