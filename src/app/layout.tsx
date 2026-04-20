import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { FirebaseClientRoot } from '@/components/FirebaseClientRoot';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthWrapper } from '@/components/AuthWrapper';

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MiTaller - Plataforma de Talleres Presenciales',
  description: 'Encuentra y crea talleres presenciales en Argentina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={roboto.className}>
        <FirebaseClientRoot>
          <AuthProvider>
            <AuthWrapper>{children}</AuthWrapper>
          </AuthProvider>
        </FirebaseClientRoot>
      </body>
    </html>
  );
}
