import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, MapPin, Plus, Truck, Loader2 } from "lucide-react";
import { useCart } from "../store/cartContext";
import orderService from "../services/orderService";
import addressService from "../services/addressService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Address } from "@/types";

// Address Schema
const addressSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  phone: z.string().min(1, "Phone is required"),
  isDefault: z.boolean().default(false),
});

function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Address Form
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    },
  });

  // Calculate totals
  const selectedItems = items.filter((item) => item.selected === 1);
  const subtotal = selectedItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Initialize
  useEffect(() => {
    async function initializeCheckout() {
      try {
        setLoadingAddresses(true);

        const addressResponse = await addressService.getUserAddresses();
        // Handle different response structures
        let addresses = addressResponse.data || addressResponse;
        if (addressResponse.success && addressResponse.data)
          addresses = addressResponse.data;

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddress = addresses.find(
            (addr: Address) => addr.isDefault === 1
          );
          setSelectedAddressId(
            defaultAddress ? defaultAddress.id : addresses[0].id
          );
        } else {
          setSavedAddresses([]);
          setShowAddressForm(true);
        }

        const tokenResponse = await orderService.generateOrderToken();
        const token = tokenResponse.data || tokenResponse;
        if (token) setOrderToken(token);
      } catch (error) {
        console.error("Initialize checkout error:", error);
        setShowAddressForm(true);
      } finally {
        setLoadingAddresses(false);
      }
    }

    initializeCheckout();
  }, []);

  const handleSaveNewAddress = async (values: Address) => {
    setLoading(true);
    try {
      const addressData = {
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        province: values.province,
        city: values.city,
        district: values.district,
        detailAddress: values.detailAddress,
        // postalCode: values.postalCode,
        isDefault: values.isDefault ? 1 : savedAddresses.length === 0 ? 1 : 0,
      };

      const addressResult = await addressService.createAddress(addressData);
      const newAddress = addressResult.data || addressResult;

      if (addressResult.success || newAddress) {
        toast.success("Address saved successfully!");
        setSavedAddresses([...savedAddresses, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddressForm(false);
        form.reset();
      } else {
        toast.error("Failed to save address");
      }
    } catch {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      if (!selectedAddressId) {
        toast.error("Please save your address first before placing order");
        setLoading(false);
        return;
      }

      if (!orderToken) {
        toast.error("Order token is missing. Please refresh the page.");
        setLoading(false);
        return;
      }

      const orderData = {
        addressId: selectedAddressId,
        comment: `Payment method: ${paymentMethod}`,
        freightType: "standard",
      };

      const orderResult = await orderService.createOrder(orderData, orderToken);

      if (orderResult.success) {
        toast.success("Order placed successfully!");
        await clearCart();
        navigate(`/order-success/${orderResult.data.id}`);
      } else {
        toast.error(orderResult.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl bg-gray-50/50 dark:bg-zinc-950/50 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card className="border-0 shadow-md bg-white/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAddresses ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                      className="space-y-3"
                    >
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-colors ${
                            selectedAddressId === address.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem value={address.id} id={address.id} />
                          <div className="grid gap-1.5 leading-none w-full">
                            <Label
                              htmlFor={address.id}
                              className="font-semibold cursor-pointer"
                            >
                              {address.receiverName}
                              {address.isDefault === 1 && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">
                                  (Default)
                                </span>
                              )}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {address.detailAddress}, {address.city},{" "}
                              {address.province} {address.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddressForm(true)}
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Address
                      </Button>
                    </RadioGroup>
                  )}

                  {showAddressForm && (
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Add New Address</h3>
                        {savedAddresses.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddressForm(false)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleSaveNewAddress)}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="+1 234 567 8900"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Set as default address</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={loading}>
                            {loading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}{" "}
                            Save Address
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-md bg-white/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="credit_card"
                    id="credit_card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="credit_card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Credit Card
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="paypal"
                    id="paypal"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="paypal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="mb-3 text-xl font-bold">Paypal</span>
                    PayPal
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="cash_on_delivery"
                    id="cod"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cod"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Truck className="mb-3 h-6 w-6" />
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Note: This is a demo payment. No actual payment will be
                processed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Summary */}
        <div>
          <Card className="sticky top-24 border-0 shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[300px] w-full rounded-md border p-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex gap-4 mb-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-sm text-primary">
                        ${(item.productPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowConfirmDialog(true)}
                disabled={
                  loading || showAddressForm || savedAddresses.length === 0
                }
              >
                Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to place this order for ${total.toFixed(2)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlaceOrder} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Confirm Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Checkout;
