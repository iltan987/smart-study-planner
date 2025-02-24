import LoginForm from '@/components/auth/login-form';
// import { headers } from 'next/headers';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let callbackUrl = '/';
  const srchParams = await searchParams;
  if (srchParams && srchParams.callbackUrl) {
    callbackUrl = srchParams.callbackUrl as string;
  } // else {
  //   const headersList = await headers();
  //   const referer = headersList.get('referer');
  //   if (referer) {
  //     callbackUrl = referer;
  //   }
  // } MAYBE LATER?
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
