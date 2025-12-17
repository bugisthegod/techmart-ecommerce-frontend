import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

function OrderSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();

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
