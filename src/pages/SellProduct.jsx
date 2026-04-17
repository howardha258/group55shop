import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ImageUploader from '../components/sell/ImageUploader';
import AiScanResult from '../components/sell/AiScanResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScanEye, Loader2, Send, Tag, FileText, DollarSign, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SellProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('available');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [scanStatus, setScanStatus] = useState('pending');
  const [scanDetails, setScanDetails] = useState('');
  const [scanning, setScanning] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const isVerifiedCompany = user?.company_verification_status === 'approved';
  const minImages = isVerifiedCompany ? 3 : 5;

  const canScan = images.length >= minImages;
  const canPublish = canScan && scanStatus === 'passed' && name && description && price;

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
1. RELEVANCE: Only fail (failed_different) if an image is COMPLETELY unrelated to the product — e.g. a random landscape, a person with no relation, or a totally different category of item. If there is any reasonable connection to the product, it passes.
2. UNIQUENESS: Only fail (failed_similar) if images are EXACT duplicates (literally the same file repeated) or near-identical copies with no meaningful difference. Different angles, lighting, backgrounds, or zoom levels are all fine and should PASS.

When in doubt, always pass. Only reject if the violation is blatant and obvious.

Respond with a JSON object.`,
      file_urls: images,
      response_json_schema: {
        type: "object",
        properties: {
          result: {
            type: "string",
            enum: ["passed", "failed_different", "failed_similar"],
            description: "passed = all images are relevant and sufficiently unique, failed_different = some images are unrelated to the product, failed_similar = images are too similar/duplicated"
          },
          explanation: {
            type: "string",
            description: "Brief explanation of the scan result"
          }
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

  const handlePublish = async () => {
    if (!canPublish) return;

    setPublishing(true);

    let sellerEmail = '';
    try {
      const user = await base44.auth.me();
      sellerEmail = user.email;
    } catch {}

    await base44.entities.Product.create({
      name,
      description,
      price: parseFloat(price),
      status,
      category,
      images,
      published: true,
      ai_scan_result: 'passed',
      seller_email: sellerEmail,
    });

    toast.success('Product published successfully!');
    setPublishing(false);
    navigate('/my-listings');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-bold">Sell a Product</h1>
          {isVerifiedCompany && (
            <Badge className="bg-green-100 text-green-700 border-green-200 border gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Company — 3 images required
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          List your product with AI-verified images
          {!isVerifiedCompany && (
            <> · <Link to="/account" className="text-accent underline underline-offset-2 hover:no-underline">Verify your company</Link> to reduce image requirement to 3</>
          )}
        </p>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
        <ImageUploader images={images} onImagesChange={setImages} minImages={minImages} />
      </Card>

      {/* AI Scan */}
      <AiScanResult status={scanStatus} details={scanDetails} minImages={minImages} />

      <div className="flex gap-3">
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

        <Button
          onClick={handlePublish}
          disabled={!canPublish || publishing}
          className="flex-1 h-12 gap-2 bg-primary hover:bg-primary/90"
        >
          {publishing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
          ) : (
            <><Send className="w-5 h-5" /> Publish Product</>
          )}
        </Button>
      </div>

      {!canPublish && scanStatus !== 'passed' && images.length >= 5 && (
        <p className="text-sm text-center text-muted-foreground">
          You must pass the AI image scan before publishing
        </p>
      )}
    </div>
  );
}