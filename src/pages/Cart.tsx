import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cartContext";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Cart() {
  const navigate = useNavigate();
  const {
    items,
    totalItems: _totalItems,
    removeItem,
    updateQuantity,
    updateItemSelection,
  } = useCart();
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});

  // Initialize all items as selected when cart loads
  useEffect(() => {
    const initialSelected: Record<number, boolean> = {};
    items.forEach((item) => {
      initialSelected[item.id] = item.selected === 1;
    });
    setSelectedItems(initialSelected);
  }, [items]);

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    // Debouncing could be added here if needed, but for now direct update
    await updateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (productId: number) => {
    await removeItem(productId);
  };

  const handleItemSelect = async (itemId: number, checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: isChecked,
    }));
    await updateItemSelection(itemId, isChecked ? 1 : 0);
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    const newSelected: Record<number, boolean> = {};
    items.forEach((item) => {
      newSelected[item.id] = isChecked;
      updateItemSelection(item.id, isChecked ? 1 : 0); // Update backend/store
    });
    setSelectedItems(newSelected);
  };

  // Calculate totals based on selected items
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  // Ensure we rely on backend/store 'selected' state mostly, but for immediate UI feedback we use local state or store data
  const selectedTotal = items.reduce((total, item) => {
    return item.selected ? total + item.product.price * item.quantity : total;
  }, 0);

  const allSelected = items.length > 0 && items.every(item => item.selected === 1);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <Button onClick={() => navigate("/products")}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl bg-gray-50/50 dark:bg-zinc-950/50 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Cart Items */}
        <div className="flex-1 space-y-4">
          <Card className="border-0 shadow-md bg-white/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked)}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select All ({items.length} items)
                </label>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 pt-6">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start pt-2">
                    <Checkbox
                      checked={item.selected === 1} // Sync with store item state which should be updated
                      onCheckedChange={(checked) => handleItemSelect(item.id, checked)}
                    />
                  </div>
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-white">
                    <img
                      src={item.product?.mainImage || ''}
                      alt={item.product?.name || 'Product'}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-foreground">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="mt-1 text-sm text-green-600 font-medium">In stock</p>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="w-12 text-center text-sm font-medium">
                          {item.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Summary */}
        <div className="lg:w-80 xl:w-96">
          <Card className="sticky top-24 border-0 shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>${selectedTotal.toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </div>
            </CardContent>
            <Separator className="my-2" />
            <CardFooter className="flex flex-col gap-4 pt-4">
              <div className="flex justify-between w-full text-lg font-bold">
                <span>Total</span>
                <span>${selectedTotal.toFixed(2)}</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate("/checkout")}
                disabled={selectedTotal === 0}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Cart;
