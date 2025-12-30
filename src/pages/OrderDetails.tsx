import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CreditCard, MapPin, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getOrderManagement } from "@/api/order-management/order-management";
import type { OrderResponse } from "@/api/models";
import { useAuth } from "@/store/authContext";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const ORDER_STATUS: Record<number, { text: string; color: string }> = {
    0: { text: "Pending Payment", color: "bg-orange-500 hover:bg-orange-600" },
    1: { text: "Paid", color: "bg-blue-500 hover:bg-blue-600" },
    2: { text: "Shipped", color: "bg-cyan-500 hover:bg-cyan-600" },
    3: { text: "Completed", color: "bg-green-500 hover:bg-green-600" },
    4: { text: "Cancelled", color: "bg-red-500 hover:bg-red-600" },
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user?.id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderApi = getOrderManagement();
        const response = await orderApi.getOrderById(parseInt(orderId), { userId: user.id });

        if (response.data) {
          setOrder(response.data);
        } else {
          setError(true);
          toast.error("Order not found");
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError(true);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user?.id]);

  const handleCancelOrder = async () => {
    if (!order?.id || !user?.id) return;

    try {
      const orderApi = getOrderManagement();
      await orderApi.cancelOrder(order.id, { userId: user.id });
      toast.success("Order cancelled successfully");

      // Refresh order details
      const response = await orderApi.getOrderById(order.id, { userId: user.id });
      if (response?.data) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS[order.status ?? 0] || { text: "Unknown", color: "bg-gray-500" };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>

      {/* Order Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">Order Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Order Number: <span className="font-mono font-semibold">{order.orderNo}</span>
              </p>
            </div>
            <Badge className={`${statusInfo.color} text-white border-0 w-fit`}>
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Payment Time */}
            {order.paymentTime && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Time</p>
                  <p className="font-medium">
                    {new Date(order.paymentTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Time */}
            {order.deliveryTime && (
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Time</p>
                  <p className="font-medium">
                    {new Date(order.deliveryTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{order.receiverName}</p>
            <p className="text-muted-foreground">{order.receiverPhone}</p>
            <p className="text-muted-foreground">{order.receiverAddress}</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items ({order.totalItems ?? order.items?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-white/40">
                <img
                  src={item.productImage || "/placeholder.png"}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    ${item.productPrice?.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${((order.totalAmount ?? 0) - (order.freightAmount ?? 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>${order.freightAmount?.toFixed(2) ?? "0.00"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">${order.totalAmount?.toFixed(2)}</span>
            </div>
            {order.payAmount !== undefined && order.payAmount !== order.totalAmount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid Amount</span>
                <span className="text-green-600 font-medium">${order.payAmount?.toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Comment */}
      {order.comment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.comment}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {order.canBeCancelled && (
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleCancelOrder}>
            Cancel Order
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
