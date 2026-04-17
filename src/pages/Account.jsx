import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User, Mail, Camera, Loader2, Save, Building2,
  FileText, CheckCircle, Clock, XCircle, Upload, ShieldCheck, Smartphone, Globe
} from 'lucide-react';

const REGIONS = [
  { code: 'USD', label: '🇺🇸 USD — US Dollar' },
  { code: 'HKD', label: '🇭🇰 HKD — Hong Kong Dollar' },
  { code: 'EUR', label: '🇪🇺 EUR — Euro' },
  { code: 'GBP', label: '🇬🇧 GBP — British Pound' },
  { code: 'CNY', label: '🇨🇳 CNY — Chinese Yuan' },
  { code: 'JPY', label: '🇯🇵 JPY — Japanese Yen' },
  { code: 'KRW', label: '🇰🇷 KRW — Korean Won' },
  { code: 'AUD', label: '🇦🇺 AUD — Australian Dollar' },
  { code: 'CAD', label: '🇨🇦 CAD — Canadian Dollar' },
  { code: 'SGD', label: '🇸🇬 SGD — Singapore Dollar' },
];
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const verificationStatusConfig = {
  none: null,
  pending: { label: 'Under Review', icon: Clock, className: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Company Verified', icon: ShieldCheck, className: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function Account() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [mobile, setMobile] = useState('');
  const [region, setRegion] = useState('USD');
  const [companyName, setCompanyName] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.full_name || '');
      setBio(user.bio || '');
      setMobile(user.mobile || '');
      setRegion(user.region || 'USD');
      setCompanyName(user.company_name || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_picture: file_url });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    toast.success('Profile picture updated');
    setUploadingAvatar(false);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({
      company_document_url: file_url,
      company_name: companyName || user?.company_name || '',
      company_verification_status: 'pending',
      company_verified: false,
    });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    toast.success('Company document submitted for review');
    setUploadingDoc(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe({ username, bio });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    toast.success('Profile saved');
    setSaving(false);
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    await base44.auth.updateMe({ mobile, region });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    toast.success('Security & preferences saved');
    setSavingPrefs(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const verStatus = verificationStatusConfig[user?.company_verification_status || 'none'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and verification</p>
      </motion.div>

      {/* Profile Picture + Basic Info */}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-border">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {(user?.username || user?.full_name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-primary-foreground" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <p className="font-semibold">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            {verStatus && (
              <Badge className={`mt-2 ${verStatus.className} border text-xs`}>
                <verStatus.icon className="w-3 h-3 mr-1" />
                {verStatus.label}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Editable fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Your display name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell people a bit about yourself..."
              className="h-20 resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </Button>
      </Card>

      {/* Security & Preferences */}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold flex items-center gap-2"><Smartphone className="w-4 h-4" /> Security &amp; Preferences</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+1 234 567 8900"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Used for account security and login verification.</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Region &amp; Currency
            </Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select your region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r.code} value={r.code}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Product prices will be displayed in your selected currency.</p>
          </div>
        </div>

        <Button onClick={handleSavePrefs} disabled={savingPrefs} className="gap-2">
          {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </Button>
      </Card>

      {/* Company Verification */}
      <Card className="p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Verified companies only need <strong>3 images</strong> (instead of 5) when listing products.
            </p>
          </div>
          {user?.company_verification_status === 'approved' && (
            <Badge className="bg-green-100 text-green-700 border-green-200 border shrink-0">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
            </Badge>
          )}
        </div>

        <Separator />

        {user?.company_verification_status === 'approved' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-800 text-sm">Company verified!</p>
              <p className="text-xs text-green-700 mt-0.5">
                You are verified as <strong>{user?.company_name}</strong>. You can list products with just 3 images.
              </p>
            </div>
          </div>
        ) : user?.company_verification_status === 'pending' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-800 text-sm">Verification under review</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your documents have been submitted and are being reviewed. This may take 1–3 business days.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {user?.company_verification_status === 'rejected' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">Your previous submission was rejected. Please resubmit with valid documents.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Your official company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Company Document
              </Label>
              <p className="text-xs text-muted-foreground">
                Upload an official document (business registration, tax certificate, trade license, etc.) in PDF, PNG, or JPG format.
              </p>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${uploadingDoc ? 'border-accent/50 bg-accent/5' : 'border-muted-foreground/20 hover:border-accent/50 hover:bg-accent/5'}`}>
                {uploadingDoc ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">{uploadingDoc ? 'Uploading...' : 'Click to upload document'}</p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 20MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDoc || !companyName}
                />
              </label>
              {!companyName && (
                <p className="text-xs text-destructive">Please enter your company name before uploading</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}