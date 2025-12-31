import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Cancelled</CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment was cancelled. No charges have been made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You can return to your orders to try again, or continue shopping.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/orders")}
            className="w-full sm:w-auto"
          >
            View My Orders
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/products")}
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default CheckoutCancel;
