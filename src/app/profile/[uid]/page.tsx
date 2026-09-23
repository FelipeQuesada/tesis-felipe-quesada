import PageClient from './page-client';

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default async function Page({ params }: PageProps) {
  const resolved = await params;
  return <PageClient uid={resolved.uid} />;
}