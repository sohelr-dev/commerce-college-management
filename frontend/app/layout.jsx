import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Commerce College — Management System',
  description: 'কমার্স কলেজের সম্পূর্ণ স্কুল/কলেজ ম্যানেজমেন্ট সিস্টেম',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
