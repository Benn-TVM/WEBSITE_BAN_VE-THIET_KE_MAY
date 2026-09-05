import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
    </>
  );
}
