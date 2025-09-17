import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  SortAsc,
  Grid,
  List,
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Sparkles,
  Crown,
} from 'lucide-react';
import Fuse from 'fuse.js';

interface Product {
  _id: string;
  Product_name: string;
  Product_price: number;
  Product_image: string[];
  Product_category: { category: string };
  Product_discription?: string;
  Product_available: boolean;
  score?: number;
  matches?: readonly any[];
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'name'>('relevance');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: 'Product_name', weight: 0.7 },
        { name: 'Product_category.category', weight: 0.2 },
        { name: 'Product_discription', weight: 0.1 },
      ],
      threshold: 0.6,
      minMatchCharLength: 1,
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true,
      findAllMatches: true,
      shouldSort: true,
      isCaseSensitive: false,
      distance: 100,
    }),
    []
  );

  const fuse = useMemo(() => {
    if (products.length === 0) return null;
    return new Fuse(products, fuseOptions);
  }, [products, fuseOptions]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/getproducts`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const productArray = data.products || [];
        setProducts(Array.isArray(productArray) ? productArray : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!query || products.length === 0 || !fuse) {
      setSearchResults([]);
      return;
    }
    try {
      const searchResponse = fuse.search(query);
      if (searchResponse.length === 0) {
        const manualResults = products
          .filter((product) => {
            const s = query.toLowerCase();
            return (
              (product.Product_name || '').toLowerCase().includes(s) ||
              (product.Product_discription || '').toLowerCase().includes(s) ||
              (product.Product_category?.category || '').toLowerCase().includes(s)
            );
          })
          .slice(0, 20);
        setSearchResults(
          manualResults.map((item) => ({ ...item, score: 0.5, matches: [] }))
        );
      } else {
        const results = searchResponse.slice(0, 20).map((r) => ({
          ...r.item,
          score: r.score,
          matches: r.matches,
        }));
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, [query, products, fuse]);

  const sortedResults = useMemo(() => {
    if (!searchResults.length) return [];
    const sorted = [...searchResults];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.Product_price || 0) - (b.Product_price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.Product_price || 0) - (a.Product_price || 0));
      case 'name':
        return sorted.sort((a, b) => (a.Product_name || '').localeCompare(b.Product_name || ''));
      case 'relevance':
      default:
        return sorted.sort((a, b) => (a.score || 0) - (b.score || 0));
    }
  }, [searchResults, sortBy]);

  const handleProductClick = (productId: string) => navigate(`/product/${productId}`);
  const handleGoBack = () => navigate(-1);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 border-t-rose-600"></div>
              <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-600" size={20} />
            </div>
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-2 border border-rose-200">
                <Crown className="w-4 h-4" />
                Curating Treasures
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">Searching Products...</h3>
              <p className="text-rose-700 text-sm">Handpicking the finest pieces for this query</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-3 text-rose-700 hover:text-rose-800 mb-8 transition-all hover:bg-rose-50 px-4 py-2 rounded-xl hover:shadow"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to browsing</span>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow border-2 border-rose-100 mb-4">
            <Search size={18} className="text-rose-600" />
            <span className="text-sm font-medium text-rose-700">Results for</span>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">"{query}"</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {sortedResults.length > 0 ? (
              <>
                Found {sortedResults.length} Treasure
                {sortedResults.length !== 1 ? 's' : ''}
              </>
            ) : (
              'No Treasures Found'
            )}
          </h1>
          {sortedResults.length > 0 && (
            <p className="text-rose-700 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              Discover a perfect match for this search
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white/90 rounded-2xl shadow border-2 border-rose-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* View mode */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-rose-800">View</span>
              <div className="flex items-center bg-rose-50 rounded-xl p-1 border border-rose-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-rose-700 hover:bg-white/70'
                  }`}
                >
                  <Grid size={16} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-rose-700 hover:bg-white/70'
                  }`}
                >
                  <List size={16} />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-rose-800">Sort by</span>
              <div className="relative">
                <SortAsc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-rose-50 border border-rose-200 rounded-xl pl-10 pr-8 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {sortedResults.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/90 rounded-3xl shadow-xl border-2 border-rose-100 p-12 max-w-md mx-auto">
              <div className="bg-rose-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-rose-200">
                <Search className="h-10 w-10 text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">No treasures found</h2>
              <p className="text-rose-700 mb-6 leading-relaxed">
                Couldn’t find items matching <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">"{query}"</span>.
                Try different keywords or explore our collections.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white rounded-xl hover:from-pink-700 hover:via-rose-700 hover:to-red-800 transition-all font-bold"
                >
                  Browse All Products
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full px-6 py-3 border-2 border-rose-200 text-rose-800 rounded-xl hover:bg-rose-50 transition-all font-bold"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'space-y-5'
            }
          >
            {sortedResults.map((product) => (
              <div
                key={product._id}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => handleProductClick(product._id)}
                className={`group bg-white/90 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-rose-100 hover:border-rose-200 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-64'
                  }`}
                >
                  <img
                    src={product.Product_image?.[0] || '/placeholder-product.jpg'}
                    alt={product.Product_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />

                  {/* Availability */}
                  {product.Product_available && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Available
                      </span>
                    </div>
                  )}

                  {/* Match score */}
                  {typeof product.score === 'number' && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full border border-rose-200">
                        <Star size={12} className="fill-current" />
                        {Math.round((1 - product.score) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Hover actions */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                      hoveredProduct === product._id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <button className="bg-white/90 hover:bg-white p-2 rounded-full transition">
                      <Eye size={18} className="text-gray-700" />
                    </button>
                    <button className="bg-white/90 hover:bg-white p-2 rounded-full transition">
                      <Heart size={18} className="text-rose-600" />
                    </button>
                    <button className="bg-white/90 hover:bg-white p-2 rounded-full transition">
                      <ShoppingCart size={18} className="text-rose-700" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="mb-3">
                    <h3 className="font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-700 transition-colors text-lg">
                      {product.Product_name}
                    </h3>
                    <p className="text-sm text-rose-700/80 mb-3 capitalize">
                      {product.Product_category?.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
                        {formatPrice(product.Product_price || 0)}
                      </p>
                      {typeof product.score === 'number' && (
                        <p className="text-xs text-rose-600 mt-1">
                          {Math.round((1 - product.score) * 100)}% match
                        </p>
                      )}
                    </div>

                    {viewMode === 'grid' && (
                      <button className="bg-rose-100 hover:bg-rose-200 text-rose-700 p-2 rounded-full transition-colors">
                        <ShoppingCart size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {sortedResults.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/90 px-6 py-3 rounded-full shadow border-2 border-rose-100">
              <Sparkles size={16} className="text-yellow-500" />
              <span className="text-sm text-rose-700">
                Showing {sortedResults.length} results for "{query}"
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
