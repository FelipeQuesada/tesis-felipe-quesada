import PageClient from './page-client';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const resolved = await params;
  return <PageClient id={resolved.id} />;
}