import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { PrivacyPolicyScreen } from "../components/PrivacyPolicyScreen";

export default function PrivacyRoute() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Privacy Policy - myuzeTV</title>
        <meta name="description" content="myuzeTV Privacy Policy - How we collect, use, and protect your personal information." />
      </Head>
      <PrivacyPolicyScreen onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/profile");
        }
      }} />
    </>
  );
}
