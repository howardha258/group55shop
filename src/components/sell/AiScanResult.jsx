import React from 'react';
import { ShieldCheck, ShieldAlert, Loader2, ScanEye } from 'lucide-react';
import { Card } from '@/components/ui/card';

const configs = {
  pending: {
    icon: ScanEye,
    title: 'Not Scanned Yet',
    description: 'Upload at least 5 images and click "Scan Images" to verify.',
    className: 'border-border bg-muted/50',
    iconClass: 'text-muted-foreground',
  },
  scanning: {
    icon: Loader2,
    title: 'AI Scanning Images...',
    description: 'Checking for relevance and similarity between your product images.',
    className: 'border-accent/30 bg-accent/5',
    iconClass: 'text-accent animate-spin',
  },
  passed: {
    icon: ShieldCheck,
    title: 'Images Verified',
    description: 'All images are relevant to the product and sufficiently unique. You can publish!',
    className: 'border-green-200 bg-green-50',
    iconClass: 'text-green-600',
  },
  failed_different: {
    icon: ShieldAlert,
    title: 'Images Too Different',
    description: 'Some images appear unrelated to the product. Please replace them with relevant photos.',
    className: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600',
  },
  failed_similar: {
    icon: ShieldAlert,
    title: 'Images Too Similar',
    description: 'Some images are nearly identical. Please add more unique angles or perspectives.',
    className: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600',
  },
};

export default function AiScanResult({ status, details }) {
  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <Card className={`p-4 ${config.className} border`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className={`w-5 h-5 ${config.iconClass}`} />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{config.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
          {details && (
            <p className="text-xs mt-2 p-2 bg-background rounded border">{details}</p>
          )}
        </div>
      </div>
    </Card>
  );
}