import { useRouter, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import { LoginScreen } from "../components/LoginScreen";

export default function LoginRoute() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const handleSuccess = () => {
    const r = Array.isArray(redirect) ? redirect[0] : redirect;
    const target = r && String(r).startsWith("/") ? String(r) : "/";
    router.replace(target as "/");
  };

  return (
    <>
      <Head>
        <title>Sign In - myuzeTV</title>
        <meta name="description" content="Sign in to myuzeTV to stream premium short-form dramas." />
      </Head>
      <LoginScreen onSuccess={handleSuccess} />
    </>
  );
}
