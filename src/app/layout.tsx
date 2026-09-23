import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { FirebaseClientRoot } from '@/components/FirebaseClientRoot';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthWrapper } from '@/components/AuthWrapper';

const nunito = Nunito({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
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
      <body className={`${nunito.variable} ${nunito.className}`}>
        <FirebaseClientRoot>
          <AuthProvider>
            <AuthWrapper>{children}</AuthWrapper>
          </AuthProvider>
        </FirebaseClientRoot>
      </body>
    </html>
  );
}
