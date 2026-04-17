import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ImageUploader from '../components/sell/ImageUploader';
import AiScanResult from '../components/sell/AiScanResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScanEye, Loader2, Save, Tag, FileText, DollarSign, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('available');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [scanStatus, setScanStatus] = useState('passed');
  const [scanDetails, setScanDetails] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => base44.entities.Product.filter({ id }),
  });

  const product = products[0];

  useEffect(() => {
    if (product && !loaded) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price?.toString() || '');
      setStatus(product.status || 'available');
      setCategory(product.category || '');
      setImages(product.images || []);
      setScanStatus(product.ai_scan_result === 'passed' ? 'passed' : 'pending');
      setLoaded(true);
    }
  }, [product, loaded]);

  const isVerifiedCompany = user?.company_verification_status === 'approved';
  const minImages = isVerifiedCompany ? 3 : 5;

  const canScan = images.length >= minImages;
  const canSave = name && description && price && images.length >= minImages && scanStatus === 'passed';

  // If images changed from original, require re-scan
  const imagesChanged = loaded && JSON.stringify(images) !== JSON.stringify(product?.images || []);

  const handleScanImages = async () => {
    if (!canScan) {
      toast.error(`Please upload at least ${minImages} images first`);
      return;
    }

    setScanning(true);
    setScanStatus('scanning');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a lenient AI image verification system for an e-commerce platform. Analyze these ${images.length} product images.

Product name: "${name}"
Product description: "${description}"

Your task — be generous and only fail in obvious cases:
1. RELEVANCE: Only fail (failed_different) if an image is COMPLETELY unrelated to the product.
2. UNIQUENESS: Only fail (failed_similar) if images are EXACT duplicates.

When in doubt, always pass. Only reject if the violation is blatant and obvious.

Respond with a JSON object.`,
      file_urls: images,
      response_json_schema: {
        type: "object",
        properties: {
          result: {
            type: "string",
            enum: ["passed", "failed_different", "failed_similar"],
          },
          explanation: { type: "string" }
        }
      }
    });

    setScanStatus(result.result);
    setScanDetails(result.explanation);
    setScanning(false);

    if (result.result === 'passed') {
      toast.success('Images verified successfully!');
    } else {
      toast.error('Image verification failed. See details below.');
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    await base44.entities.Product.update(id, {
      name,
      description,
      price: parseFloat(price),
      status,
      category,
      images,
      ai_scan_result: 'passed',
    });

    queryClient.invalidateQueries({ queryKey: ['my-products'] });
    queryClient.invalidateQueries({ queryKey: ['product', id] });
    toast.success('Product updated successfully!');
    setSaving(false);
    navigate('/my-listings');
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold">Product not found</p>
        <Link to="/my-listings">
          <Button variant="outline" className="mt-4">Back to Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/my-listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Listings
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-bold">Edit Product</h1>
          {isVerifiedCompany && (
            <Badge className="bg-green-100 text-green-700 border-green-200 border gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified — 3 images required
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">Update your product details</p>
      </motion.div>

      {/* Basic Info */}
      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2"><Tag className="w-4 h-4" /> Product Name</Label>
          <Input id="name" placeholder="e.g. Vintage Leather Wallet" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc" className="flex items-center gap-2"><FileText className="w-4 h-4" /> Description</Label>
          <Textarea id="desc" placeholder="Describe your product in detail..." className="h-28" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Price (USD)</Label>
            <Input id="price" type="number" min="0" step="0.01" placeholder="29.99" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="nearly_sold_out">Nearly Sold Out</SelectItem>
                <SelectItem value="sold_out">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category (optional)</Label>
          <Input placeholder="e.g. Fashion, Electronics, Home..." value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
      </Card>

      {/* Image Upload */}
      <Card className="p-5">
        <ImageUploader images={images} onImagesChange={(newImages) => {
          setImages(newImages);
          if (JSON.stringify(newImages) !== JSON.stringify(product?.images || [])) {
            setScanStatus('pending');
          }
        }} minImages={minImages} />
      </Card>

      {/* AI Scan */}
      {imagesChanged && (
        <AiScanResult status={scanStatus} details={scanDetails} minImages={minImages} />
      )}

      <div className="flex gap-3">
        {imagesChanged && (
          <Button
            onClick={handleScanImages}
            disabled={!canScan || scanning}
            variant="outline"
            className="flex-1 h-12 gap-2"
          >
            {scanning ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</>
            ) : (
              <><ScanEye className="w-5 h-5" /> Scan Images with AI</>
            )}
          </Button>
        )}

        <Button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex-1 h-12 gap-2 bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </Button>
      </div>

      {imagesChanged && scanStatus !== 'passed' && (
        <p className="text-sm text-center text-muted-foreground">
          Images have changed — please run the AI scan before saving
        </p>
      )}
    </div>
  );
}