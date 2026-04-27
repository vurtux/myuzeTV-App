import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { TermsOfServiceScreen } from "../components/TermsOfServiceScreen";

export default function TermsRoute() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Terms of Service - myuzeTV</title>
        <meta name="description" content="myuzeTV Terms of Service - Terms and conditions for using our streaming service." />
      </Head>
      <TermsOfServiceScreen onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/profile");
        }
      }} />
    </>
  );
}
