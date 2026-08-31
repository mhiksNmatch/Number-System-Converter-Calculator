import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Number System Converter',
  description: 'Number system converter and arithmetic calculator.',
  openGraph: {
    title: 'Number System Converter',
    description: 'Number system converter and arithmetic calculator.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Number System Converter',
    description: 'Number system converter and arithmetic calculator.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}