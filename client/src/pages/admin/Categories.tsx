import React, { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Loader2, Plus, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const cloudinaryOptions = [
  {
    name: "Primary Cloud",
    endpoint: "/api/admin/getsignature" // This matches your server endpoint
  },
  {
    name: "Secondary Cloud", 
    endpoint: "/api/admin/getsignature" // Same endpoint, different cloudInstance parameter
  }
];

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch categories from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/getcategories`, {
          withCredentials: true,
        });
        // Standardize backend category structure to frontend expected structure
        const transformedCategories = res.data.categories?.map((cat: any) => ({
          id: cat.id || cat._id || cat.category,
          name: cat.name || cat.category,
          image: cat.image || cat.category_image,
          description: cat.description || cat.category_description || ""
        })) || [];
        setCategories(transformedCategories);
      } catch (err: any) {
        setCategories([]);
        toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch categories", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  // Add category (connect to backend)
  const handleAddCategory = async (category: any) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      // Map CategoryForm fields to backend fields
      const payload = {
        category: category.name,
        category_image: category.image,
        category_description: category.description,
      };
      const res = await axios.post(`${API_URL}/admin/addcategory`, payload, {
        withCredentials: true,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      });
      // Standardize new category object
      const newCategory = {
        id: res.data.category.id || res.data.category._id || res.data.category.category,
        name: res.data.category.name || res.data.category.category,
        image: res.data.category.image || res.data.category.category_image,
        description: res.data.category.description || res.data.category.category_description || ""
      };
      setCategories((prev) => [newCategory, ...prev]);
      setOpen(false);
      toast({
        title: "Category Added",
        description: "The category has been successfully added to your store.",
        variant: "default"
      });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.post(
        `${API_URL}/admin/deletecategory`,
        { _id: id },
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        }
      );

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Category Deleted",
        description: "The category has been successfully removed.",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-bold">Categories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleAddCategory}
              cloudinaryOptions={cloudinaryOptions}
            />
            <DialogClose asChild>
              <Button variant="outline" className="mt-4">Cancel</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Add your first category to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category._id || category.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                        {category.category || category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      {category.category_image?.[0] || category.image ? (
                        <div className="h-10 w-10 rounded-md border border-gray-200 overflow-hidden">
                          <img
                            src={category.category_image?.[0] || category.image}
                            alt={category.category || category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category._id || category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
