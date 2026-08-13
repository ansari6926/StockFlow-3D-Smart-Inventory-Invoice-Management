import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'StockFlow 3D — Smart Inventory & Invoice Management',
    template: '%s | StockFlow 3D',
  },
  description:
    'StockFlow 3D is a modern SaaS inventory and invoice management system with real-time stock tracking, atomic invoice creation, and 3D visualizations.',
  keywords: ['inventory management', 'invoice management', 'stock tracking', 'SaaS', 'StockFlow'],
  authors: [{ name: 'StockFlow 3D' }],
  openGraph: {
    title: 'StockFlow 3D — Smart Inventory & Invoice Management',
    description: 'Modern SaaS inventory and invoice management with real-time stock tracking.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
