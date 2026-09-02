import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScamAlert.pk - Official Fraud Registry',
  description: 'Verify Pakistani online stores and file structured fraud disputes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
