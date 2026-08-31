import type { Metadata } from 'next';
import './globals.css'; 

export const metadata: Metadata = {
  title: 'Number System Converter',
  description: 'Number system converter and arithmetic calculator.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}