import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuoteCartProvider } from "@/contexts/QuoteCartContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductCategory from "./pages/ProductCategory";
import ProductDetail from "./pages/ProductDetail";
import Materials from "./pages/Materials";
import MaterialDetail from "./pages/MaterialDetail";
import Industries from "./pages/Industries";
import IndustryDetail from "./pages/IndustryDetail";
import QuoteCart from "./pages/QuoteCart";
import Contact from "./pages/Contact";
import About from "./pages/About";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminRotatingMessages from "./pages/admin/AdminRotatingMessages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <QuoteCartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:categoryId" element={<ProductCategory />} />
            <Route path="/products/:categoryId/:productId" element={<ProductDetail />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/materials/:materialId" element={<MaterialDetail />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/:industryId" element={<IndustryDetail />} />
            <Route path="/quote-cart" element={<QuoteCart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProducts />} />
            <Route path="/admin/materials" element={<AdminMaterials />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/rotating-messages" element={<AdminRotatingMessages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QuoteCartProvider>
  </QueryClientProvider>
);

export default App;
