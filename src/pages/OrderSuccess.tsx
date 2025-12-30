import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getPaymentManagement } from "@/api/payment-management/payment-management";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

function OrderSuccess() {
    const { orderId: paramOrderId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [orderId, setOrderId] = useState<string | null>(paramOrderId || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        logger.log("Am I in this page?");
        const sessionId = searchParams.get("session_id");

        logger.log("Fetching order by session ID:", sessionId);
        if (sessionId) {
            // Stripe redirect flow - fetch order by session ID
            setLoading(true);
            const paymentApi = getPaymentManagement();

            paymentApi.getPaymentBySessionId(sessionId)
            .then((response) => {
                    if (response.data?.orderId) {
                        setOrderId(response.data.orderId.toString());
                    } else {
                        toast.error("Unable to retrieve order information");
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch order by session ID:", error);
                    toast.error("Failed to retrieve order information");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-zinc-950/50 p-4">
                <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-md text-center">
                    <CardContent className="pt-10 pb-10">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading order details...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-zinc-950/50 p-4">
            <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-md text-center">
                <CardHeader className="flex flex-col items-center pt-10 pb-2">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Placed Successfully!</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Order ID: <span className="font-mono font-medium text-foreground">{orderId}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Your order has been received and is being processed.
                        We will send you an email confirmation shortly.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate("/products")}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => navigate("/orders")}
                    >
                        View My Orders
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default OrderSuccess;
