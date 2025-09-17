// import React, { useEffect, useState } from "react";
// import ProductForm from "./ProductForm";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import axios from "axios";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2, Plus, Trash2 } from "lucide-react";

// const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

// const cloudinaryOptions = [
//   {
//     name: "Primary Cloud",
//     endpoint: "/api/admin/getsignature" // This matches your server endpoint
//   },
//   {
//     name: "Secondary Cloud", 
//     endpoint: "/api/admin/getsignature" // Same endpoint, different cloudInstance parameter
//   }
// ];

// export default function Products() {
//   const [products, setProducts] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();

//   // Fetch all products and categories from backend
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const adminToken = localStorage.getItem("admin_token");
//         const res = await axios.get(`${API_URL}/admin/getproducts`, {
//           withCredentials: true,
//           headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
//         });
//         setProducts(res.data.product || []);
        
//       } catch (err: any) {
//         setProducts([]);
//         toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch products", variant: "destructive" });
//       } finally {
//         setLoading(false);
//       }
//     };
//     const fetchCategories = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/getcategories`, {
//           withCredentials: true,
//         });
//         // Standardize backend category structure to frontend expected structure
//         const transformedCategories = res.data.categories?.map((cat: any) => ({
//           id: cat.id || cat._id || cat.category,
//           name: cat.name || cat.category,
//           image: cat.image || cat.category_image,
//           description: cat.description || cat.category_description || ""
//         })) || [];
//         setCategories(transformedCategories);
//       } catch (err) {
//         // fallback to initial categories if backend not implemented
//         const fallbackCategories = [
//           { id: "pendants", name: "Pendants", image: "", description: "" },
//           { id: "earrings", name: "Earrings", image: "", description: "" },
//           { id: "jhumkas", name: "Jhumkas", image: "", description: "" },
//           { id: "bracelets", name: "Bracelets", image: "", description: "" },
//           { id: "hair-accessories", name: "Hair Accessories", image: "", description: "" },
//           { id: "hampers", name: "Hampers", image: "", description: "" },
//           { id: "customized-hampers", name: "Customized Hampers", image: "", description: "" },
//         ];
//         setCategories(fallbackCategories);
//       }
//     };
//     fetchProducts();
//     fetchCategories();
//   }, [toast]);

//   // Add product
//   const handleAddProduct = async (product: any) => {
//     setLoading(true);
//     try {
//       const adminToken = localStorage.getItem("admin_token");
//       // Map ProductForm fields to backend fields
//       const payload = {
//         Product_name: product.name,
//         Product_discription: product.description,
//         Product_price: Number(product.price),
//         Product_image: product.images,
//         Product_category: product.category,
//         Product_available: true,
//         Product_public_id: product.images?.[0] || "",
//       };
//       const res = await axios.post(`${API_URL}/admin/saveproduct`, payload, {
//         withCredentials: true,
//         headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
//       });
//       setProducts((prev) => [res.data.product, ...prev]);
//       setIsDialogOpen(false);
//       toast({
//         title: "Product Added",
//         description: "The product has been successfully added to your store.",
//         variant: "default"
//       });
//     } catch (err: any) {
//       toast({ title: "Error", description: err?.response?.data?.message || "Failed to add product", variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete product
//   const handleDelete = async (id: string, publicId: string) => {
//     setLoading(true);
//     try {
//       const adminToken = localStorage.getItem("admin_token");
//       await axios.post(`${API_URL}/admin/deleteproduct`, { _id: id, Product_public_id: publicId }, {
//         withCredentials: true,
//         headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
//       });
//       setProducts((prev) => prev.filter((p) => p._id !== id));
//       toast({
//         title: "Product Deleted",
//         description: "The product has been successfully removed from your store.",
//         variant: "default"
//       });
//     } catch (err: any) {
//       toast({ title: "Error", description: err?.response?.data?.message || "Failed to delete product", variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
//         <CardTitle className="text-2xl font-bold">Products</CardTitle>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-purple-600 hover:bg-purple-700">
//               <Plus className="mr-2 h-4 w-4" />
//               Add Product
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Add New Product</DialogTitle>
//               <DialogDescription>
//                 Fill in the product details below.
//               </DialogDescription>
//             </DialogHeader>

//             <ProductForm
//               onSubmit={handleAddProduct}
//               categories={categories}
//               cloudinaryOptions={cloudinaryOptions}
//             />

//             <DialogClose asChild>
//               <Button variant="outline" className="mt-4">
//                 Close
//               </Button>
//             </DialogClose>
//           </DialogContent>
//         </Dialog>
//       </CardHeader>

//       <CardContent>
//         {loading ? (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
//           </div>
//         ) : products.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No products found. Add your first product to get started.
//           </div>
//         ) : (
//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Images</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {products.map((product) => (
//                   <TableRow key={product._id}>
//                     <TableCell className="font-medium">{product.Product_name}</TableCell>
//                     <TableCell className="max-w-[300px] truncate">
//                       {product.Product_discription}
//                     </TableCell>
//                     <TableCell>₹{product.Product_price}</TableCell>
//                     <TableCell>
//                       <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
//                         {typeof product.Product_category === 'string' 
//                           ? product.Product_category 
//                           : product.Product_category?.category || 'Uncategorized'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex gap-1 flex-wrap">
//                         {product.Product_image?.map((img: string, idx: number) => (
//                           <img
//                             key={idx}
//                             src={img}
//                             alt="Product"
//                             className="w-10 h-10 object-cover rounded-md border border-gray-200"
//                           />
//                         ))}
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => handleDelete(product._id, product.Product_public_id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }









import React, { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Gift, Package } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const cloudinaryOptions = [
  {
    name: "Primary Cloud",
    endpoint: "/api/admin/getsignature"
  },
  {
    name: "Secondary Cloud", 
    endpoint: "/api/admin/getsignature"
  }
];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all products and categories from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const adminToken = localStorage.getItem("admin_token");
        const res = await axios.get(`${API_URL}/admin/getproducts`, {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        });
        setProducts(res.data.product || []);
        
      } catch (err: any) {
        setProducts([]);
        toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch products", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/getcategories`, {
          withCredentials: true,
        });
        const transformedCategories = res.data.categories?.map((cat: any) => ({
          id: cat.id || cat._id || cat.category,
          name: cat.name || cat.category,
          image: cat.image || cat.category_image,
          description: cat.description || cat.category_description || ""
        })) || [];
        setCategories(transformedCategories);
      } catch (err) {
        const fallbackCategories = [
          { id: "pendants", name: "Pendants", image: "", description: "" },
          { id: "earrings", name: "Earrings", image: "", description: "" },
          { id: "jhumkas", name: "Jhumkas", image: "", description: "" },
          { id: "bracelets", name: "Bracelets", image: "", description: "" },
          { id: "hair-accessories", name: "Hair Accessories", image: "", description: "" },
          { id: "hampers", name: "Hampers", image: "", description: "" },
          { id: "customized-hampers", name: "Customized Hampers", image: "", description: "" },
        ];
        setCategories(fallbackCategories);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [toast]);

  // ✅ Enhanced add product with hamper support
  const handleAddProduct = async (product: any) => {
  setLoading(true);
  try {
    const adminToken = localStorage.getItem("admin_token");
    
    const payload = {
      Product_name: product.name,
      Product_discription: product.description,
      Product_price: Number(product.price),
      Hamper_price: product.hamperPrice ? Number(product.hamperPrice) : undefined,
      Product_image: product.images,
      Product_category: product.category,
      Product_available: product.isAvailable,
      isHamper_product: product.isHamperProduct,
      Product_public_id: product.images?.[0] || "",
    };

    // ✅ ADD THIS DEBUG LOG
    console.log('🔍 PAYLOAD BEING SENT TO BACKEND:', payload);
    console.log('🔍 Hamper Price:', payload.Hamper_price);
    console.log('🔍 Is Hamper Product:', payload.isHamper_product);

    const res = await axios.post(`${API_URL}/admin/saveproduct`, payload, {
      withCredentials: true,
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
    });


      setProducts((prev) => [res.data.product, ...prev]);
      setIsDialogOpen(false);
      
      toast({
        title: "Product Added Successfully!",
        description: `${product.name} has been added to your store${product.isHamperProduct ? ' and is available for custom hampers' : ''}.`,
        variant: "default"
      });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string, publicId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.post(`${API_URL}/admin/deleteproduct`, { _id: id, Product_public_id: publicId }, {
        withCredentials: true,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast({
        title: "Product Deleted",
        description: "The product has been successfully removed from your store.",
        variant: "default"
      });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to delete product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to calculate hamper discount
  const getHamperDiscount = (regularPrice: number, hamperPrice: number) => {
    if (!hamperPrice || hamperPrice >= regularPrice) return null;
    const discount = regularPrice - hamperPrice;
    const percentage = ((discount / regularPrice) * 100).toFixed(1);
    return { discount, percentage };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-2xl font-bold">Products</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Manage your jewelry products and hamper pricing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details below. Enable hamper pricing to make products available for custom hampers.
              </DialogDescription>
            </DialogHeader>

            <ProductForm
              onSubmit={handleAddProduct}
              categories={categories}
              cloudinaryOptions={cloudinaryOptions}
            />

            <DialogClose asChild>
              <Button variant="outline" className="mt-4">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <Package className="h-16 w-16 mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-sm">Add your first product to get started with your jewelry store.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Regular Price</TableHead>
                  <TableHead>Hamper Price</TableHead>
                  <TableHead>Hamper Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const hamperDiscount = product.Hamper_price ? 
                    getHamperDiscount(product.Product_price, product.Hamper_price) : null;
                  
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.Product_name}</div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">
                            {product.Product_discription}
                          </div>
                          {!product.Product_available && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium">₹{product.Product_price?.toLocaleString()}</span>
                      </TableCell>
                      
                      <TableCell>
                        {product.Hamper_price ? (
                          <div className="space-y-1">
                            <span className="font-medium text-green-600">
                              ₹{product.Hamper_price.toLocaleString()}
                            </span>
                            {hamperDiscount && (
                              <div className="text-xs text-green-700">
                                Save ₹{hamperDiscount.discount} ({hamperDiscount.percentage}% off)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {product.isHamper_product ? (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Gift className="w-3 h-3 mr-1" />
                            Hamper Eligible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Regular Only</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                          {typeof product.Product_category === 'string' 
                            ? product.Product_category 
                            : product.Product_category?.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {product.Product_image?.slice(0, 3).map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Product"
                              className="w-10 h-10 object-cover rounded-md border border-gray-200"
                            />
                          ))}
                          {product.Product_image?.length > 3 && (
                            <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                              +{product.Product_image.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product._id, product.Product_public_id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}








