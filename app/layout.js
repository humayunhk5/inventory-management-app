import './globals.css';

export const metadata = {
  title: 'BizStock Inventory SaaS',
  description: 'Professional inventory, sales, purchase and subscription management app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
