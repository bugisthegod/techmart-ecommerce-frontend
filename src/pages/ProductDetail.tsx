import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";
import { getCategoryById } from "../services/categoryService";
import { useCart } from "../store/cartContext";
import {
  Loader2,
  ShoppingCart,
  Heart,
  Share2,
  Home,
  Star,
  Minus,
  Plus,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Product, Category } from "@/types";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getProductById(Number(id));

        if (result.success && result.data) {
          setProduct(result.data);
          setSelectedImage(result.data.mainImage || "");
          
          // Fetch category if categoryId exists
          if (result.data.categoryId) {
            const categoryResult = await getCategoryById(result.data.categoryId);
            if (categoryResult.success && categoryResult.data) {
              setCategory(categoryResult.data);
            }
          }
        } else {
          toast.error("Failed to load product details");
          navigate("/products");
        }
      } catch {
        toast.error("Failed to load product details");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;
    
    const result = await addItem({
      productId: product.id,
      quantity: quantity,
      selected: 0
    });

    if (result && result.success) {
      toast.success("Product added to cart successfully!");
      if (buyNow) {
        navigate("/cart");
      }
    } else {
      toast.error(result?.message || "Failed to add product to cart");
    }
  };

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (!product) return;

    if (type === 'inc') {
      if (quantity < product.stock) setQuantity(prev => prev + 1);
    } else {
      if (quantity > 1) setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{category?.name || "Category"}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Images */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
          </div>

          {product.mainImage && product.mainImage.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div
                onClick={() => setSelectedImage(product.mainImage)}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage === product.mainImage ? 'border-primary' : 'border-transparent'} hover:border-primary/50 transition-colors`}
              >
                <img src={product.mainImage} alt="Main" className="w-full h-20 object-cover" />
              </div>
              {/* // TODO: might add more images support later */}
              {/* {product.imageUrl.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage === image ? 'border-primary' : 'border-transparent'} hover:border-primary/50 transition-colors`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                </div>
              ))} */}
            </div>
          )}
        </div>

        {/* Right Side - Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-5 w-5 ${star <= 4 ? 'fill-current' : star === 5 ? 'fill-current opacity-50' : ''}`} />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">(4.5 out of 5) • 836 ratings</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-orange-600 bg-orange-100 hover:bg-orange-200 border-0">
              #1 Best Seller
            </Badge>
            <span className="text-sm text-muted-foreground">in {category?.name || "Category"}</span>
          </div>

          <Separator />

          <div>
            <div className="text-4xl font-bold text-primary mb-1">${product.price.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">All prices include VAT.</p>
          </div>

          <div>
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-600 font-medium text-lg">
                <Check className="h-5 w-5" /> In Stock
              </div>
            ) : (
              <div className="text-destructive font-medium text-lg">Out of Stock</div>
            )}
          </div>

          {/* Specifications Table look-alike
          {product.specifications && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <h3 className="font-semibold mb-2">Product Specifications</h3>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Material</span>
                <span>{product.material || "Stainless Steel"}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Color</span>
                <span>{product.color || "Navy"}</span>
              </div>
              {product.capacity && (
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Capacity</span>
                  <span>{product.capacity}</span>
                </div>
              )}
            </div>
          )} */}

          {/* Actions */}
          <div className="p-6 bg-muted/30 rounded-xl border space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none border-r-0" onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1}>
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="h-8 min-w-[3rem] px-2 flex items-center justify-center border-y bg-background text-sm font-medium">
                  {quantity}
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none border-l-0" onClick={() => handleQuantityChange('inc')} disabled={quantity >= product.stock}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">({product.stock} available)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button size="lg" className="w-full" onClick={() => handleAddToCart(false)} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={() => handleAddToCart(true)} disabled={product.stock === 0}>
                Buy Now
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Heart className="mr-2 h-4 w-4" /> Add to Wishlist
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-bold">About this item</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "This product features premium quality materials and excellent craftsmanship. Perfect for everyday use and makes a great gift."}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>High-quality construction for durability</li>
              <li>Easy to clean and maintain</li>
              <li>Vacuum insulated to keep drinks hot or cold for hours</li>
              <li>Leak-proof lid for worry-free transport</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
