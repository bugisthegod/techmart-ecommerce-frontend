import { useNavigate } from "react-router-dom";
import { User, Wrench, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center pt-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight mb-2">
            Profile Page
          </CardTitle>
          <p className="text-muted-foreground text-lg">Coming Soon</p>
        </CardHeader>
        <CardContent className="text-center pb-12">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-muted-foreground">
              We're working hard to bring you an amazing profile management experience.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Wrench className="h-4 w-4 animate-pulse" />
                Under Construction
              </div>
            </div>
            <div className="pt-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">Coming features:</p>
              <ul className="space-y-1">
                <li>• Edit profile information</li>
                <li>• Change password</li>
                <li>• Manage addresses</li>
                <li>• View order history</li>
                <li>• Account preferences</li>
              </ul>
            </div>
            <div className="pt-8 flex gap-3 justify-center">
              <Button onClick={() => navigate("/products")}>
                Browse Products
              </Button>
              <Button variant="outline" onClick={() => navigate("/orders")}>
                View Orders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
