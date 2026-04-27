import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Smartphone, ChevronDown } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { fetchDramas } from "../api/dramas";
import { LOGO_IMAGE, type Drama } from "../lib/drama-data";
import { analyticsService } from "../lib/analytics-service";

const PLACEHOLDER_POSTERS = [
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=1",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=2",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=3",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=4",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=5",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=6",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=7",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=8",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=9",
  "https://placehold.co/80x140/1a1a2e/ff4d4d?text=10",
];

const COUNTRIES = [
  { flag: "\u{1F1EC}\u{1F1ED}", code: "+233", name: "Ghana" },
  { flag: "\u{1F1EE}\u{1F1F3}", code: "+91", name: "India" },
  { flag: "\u{1F1F3}\u{1F1EC}", code: "+234", name: "Nigeria" },
  { flag: "\u{1F1F0}\u{1F1EA}", code: "+254", name: "Kenya" },
  { flag: "\u{1F1FF}\u{1F1E6}", code: "+27", name: "South Africa" },
  { flag: "\u{1F1FA}\u{1F1F8}", code: "+1", name: "United States" },
  { flag: "\u{1F1EC}\u{1F1E7}", code: "+44", name: "United Kingdom" },
];

type Step = "main" | "phone" | "otp";

export function LoginScreen({ onSuccess }: { onSuccess?: () => void }) {
  const { signInWithGoogle, sendPhoneOtp, verifyPhoneOtp, setGuestMode } = useAuth();

  const { data: dramas = [] } = useQuery({
    queryKey: ["dramas"],
    queryFn: fetchDramas,
  });

  const posters = dramas.length > 0 ? (dramas as Drama[]).map((d: Drama) => d.image) : PLACEHOLDER_POSTERS;

  const [step, setStep] = useState<Step>("main");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState<unknown>(null);
  const [countryCode, setCountryCode] = useState("+91");
  const [countryFlag, setCountryFlag] = useState("\u{1F1EE}\u{1F1F3}");
  const [showPicker, setShowPicker] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Stagger animation (manual — no Reanimated Babel plugin needed)
  const brandOpacity = useSharedValue(0);
  const brandTranslateY = useSharedValue(12);
  const loginOpacity = useSharedValue(0);
  const loginTranslateY = useSharedValue(12);

  useEffect(() => {
    brandOpacity.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
    brandTranslateY.value = withDelay(100, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }));
    loginOpacity.value = withDelay(250, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
    loginTranslateY.value = withDelay(250, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }));
  }, []);

  const brandAnimStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandTranslateY.value }],
  }));
  const loginAnimStyle = useAnimatedStyle(() => ({
    opacity: loginOpacity.value,
    transform: [{ translateY: loginTranslateY.value }],
  }));

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone.replace(/\D/g, "")}`;
  const isPhoneValid = fullPhone.replace(/\D/g, "").length >= 10;
  const formattedPhone = phone.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");

  const handlePhoneInput = (val: string) => {
    setPhone(val.replace(/\D/g, "").slice(0, 10));
  };

  const handleSendOtp = async () => {
    if (!isPhoneValid) return;
    setError(null);
    setLoading("send");
    try {
      const result = await sendPhoneOtp(fullPhone);
      setConfirmationResult(result);
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setOtpError(false);
      setStep("otp");
      analyticsService.trackEvent("login_phone_otp_sent", { phone: fullPhone });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
      analyticsService.trackEvent("login_phone_otp_failed", { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(null);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    setOtpError(false);
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val.length > 0 && index < 5) {
      setTimeout(() => otpInputRefs.current[index + 1]?.focus(), 0);
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (!confirmationResult || code.length < 6) return;
    setError(null);
    setLoading("verify");
    try {
      await verifyPhoneOtp(confirmationResult, code);
      analyticsService.trackEvent("login_phone_success");
      onSuccess?.();
    } catch (err) {
      setOtpError(true);
      setError(err instanceof Error ? err.message : "Invalid OTP");
      analyticsService.trackEvent("login_phone_failed", { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading("google");
    try {
      await signInWithGoogle();
      analyticsService.trackEvent("login_google_success");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      analyticsService.trackEvent("login_google_failed", { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(null);
    }
  };

  const handleGuest = () => {
    analyticsService.trackEvent("login_guest_click");
    setGuestMode();
    onSuccess?.();
  };

  // OTP step — full-screen dark background, no poster grid
  if (step === "otp") {
    return (
      <View style={s.root}>
        {Platform.OS === "web" &&
          React.createElement("div", { id: "recaptcha-container", style: { display: "none" } })}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.otpFullScreen}>
            <View style={s.otpTopRow}>
              <Pressable testID="login-back-btn" onPress={() => setStep("phone")} style={s.backBtn}>
                <ArrowLeft size={20} color="#f5f5f5" />
              </Pressable>
              <Text style={s.otpTopTitle}>Enter Code</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={s.otpContent}>
              <Text style={s.otpSubtitle}>Enter the 6-digit code sent to</Text>
              <Text style={s.otpPhone}>{countryCode} {formattedPhone || phone}</Text>
              <Pressable onPress={() => setStep("phone")}>
                <Text style={s.changeLink}>Change</Text>
              </Pressable>

              <View testID="otp-container" style={s.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { otpInputRefs.current[i] = el; }}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(i, v)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(i, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={[s.otpBox, otpError && s.otpBoxError]}
                    placeholderTextColor="#71717a"
                  />
                ))}
              </View>

              {otpError && (
                <Text style={s.otpErrorText}>Invalid code. Please try again.</Text>
              )}

              <View style={{ marginTop: 20 }}>
                {resendTimer > 0 ? (
                  <Text style={s.resendText}>
                    Resend code in <Text style={s.resendTimer}>0:{resendTimer.toString().padStart(2, "0")}</Text>
                  </Text>
                ) : (
                  <Pressable onPress={() => { handleSendOtp(); }}>
                    <Text style={s.resendLink}>Didn't receive code? Resend</Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                testID="verify-otp-btn"
                onPress={handleVerifyOtp}
                disabled={otp.join("").length < 6 || !!loading}
                style={[s.primaryBtn, { width: "100%", marginTop: 24 }, otp.join("").length < 6 && s.primaryBtnDisabled]}
              >
                {loading === "verify" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[s.primaryBtnText, otp.join("").length < 6 && s.primaryBtnTextDisabled]}>
                    Verify & Continue
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Phone input step
  if (step === "phone") {
    return (
      <View style={s.root}>
        {Platform.OS === "web" &&
          React.createElement("div", { id: "recaptcha-container", style: { display: "none" } })}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.otpFullScreen}>
            <View style={s.otpTopRow}>
              <Pressable testID="login-back-btn" onPress={() => setStep("main")} style={s.backBtn}>
                <ArrowLeft size={20} color="#f5f5f5" />
              </Pressable>
              <Text style={s.otpTopTitle}>Enter Phone Number</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={s.otpContent}>
              <View style={s.phoneIcon}>
                <Smartphone size={32} color="#ff4d4d" />
              </View>
              <Text style={[s.otpSubtitle, { marginBottom: 24 }]}>
                We'll send you a verification code
              </Text>

              <View style={[s.phoneInputRow, { width: "100%" }]}>
                <Pressable testID="country-picker" onPress={() => setShowPicker(!showPicker)} style={s.countryPicker}>
                  <Text style={{ fontSize: 18 }}>{countryFlag}</Text>
                  <Text style={s.countryCode}>{countryCode}</Text>
                  <ChevronDown size={12} color="#71717a" />
                </Pressable>
                <TextInput
                  testID="phone-input"
                  value={phone}
                  onChangeText={handlePhoneInput}
                  placeholder="Enter phone number"
                  placeholderTextColor="#71717a"
                  keyboardType="phone-pad"
                  style={s.phoneInput}
                />
              </View>

              {showPicker && (
                <View>
                  <ScrollView style={[s.countryList, { width: "100%" }]}>
                    {COUNTRIES.map((c) => (
                      <Pressable
                        key={c.code}
                        onPress={() => {
                          setCountryFlag(c.flag);
                          setCountryCode(c.code);
                          setShowPicker(false);
                        }}
                        style={[s.countryItem, countryCode === c.code && { backgroundColor: "rgba(255,77,77,0.1)" }]}
                      >
                        <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                        <Text style={s.countryName}>{c.name}</Text>
                        <Text style={s.countryCodeText}>{c.code}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {error && (
                <View style={[s.errorBox, { width: "100%" }]}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                testID="send-otp-btn"
                onPress={handleSendOtp}
                disabled={!isPhoneValid || !!loading}
                style={[s.primaryBtn, (!isPhoneValid || !!loading) && s.primaryBtnDisabled, { marginTop: 20 }]}
              >
                {loading === "send" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[s.primaryBtnText, !isPhoneValid && s.primaryBtnTextDisabled]}>
                    Send Code
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Main login screen (DramaWave-style)
  return (
    <View style={s.root}>
      {Platform.OS === "web" &&
        React.createElement("div", { id: "recaptcha-container", style: { display: "none" } })}

      {/* Full-screen poster collage background — fixed behind scroll */}
      <PosterBackground posters={posters} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top — branding (takes remaining space, pushes login to bottom) */}
          <Animated.View
            style={[s.brandSection, { flex: 1, justifyContent: "center" }, brandAnimStyle]}
          >
            <Image
              source={LOGO_IMAGE}
              alt="myuzeTV"
              style={{ width: 160, height: 50 }}
              contentFit="contain"
            />
            <Text style={s.tagline}>Watch. Binge. Fall in Love.</Text>
          </Animated.View>

          {/* Bottom — login options (fixed height, scrollable) */}
          <Animated.View
            style={[s.loginSection, loginAnimStyle]}
          >
            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {/* Phone input */}
            <Text style={s.signInTitle}>Sign in to start watching</Text>
            <Text style={s.signInSubtitle}>We'll send a verification code to your phone</Text>

            <View style={s.phoneInputRow}>
              <Pressable testID="country-picker" onPress={() => setShowPicker(!showPicker)} style={s.countryPicker}>
                <Text style={{ fontSize: 18 }}>{countryFlag}</Text>
                <Text style={s.countryCode}>{countryCode}</Text>
                <ChevronDown size={12} color="#71717a" />
              </Pressable>
              <TextInput
                testID="phone-input"
                value={phone}
                onChangeText={handlePhoneInput}
                placeholder="Enter phone number"
                placeholderTextColor="#71717a"
                keyboardType="phone-pad"
                style={s.phoneInput}
              />
            </View>

            {showPicker && (
              <View>
                <ScrollView style={s.countryList} nestedScrollEnabled>
                  {COUNTRIES.map((c) => (
                    <Pressable
                      key={c.code}
                      onPress={() => {
                        setCountryFlag(c.flag);
                        setCountryCode(c.code);
                        setShowPicker(false);
                      }}
                      style={[s.countryItem, countryCode === c.code && { backgroundColor: "rgba(255,77,77,0.1)" }]}
                    >
                      <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                      <Text style={s.countryName}>{c.name}</Text>
                      <Text style={s.countryCodeText}>{c.code}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <Pressable
              testID="send-otp-btn"
              onPress={handleSendOtp}
              disabled={!isPhoneValid || !!loading}
              style={[s.primaryBtn, (!isPhoneValid || !!loading) && s.primaryBtnDisabled]}
            >
              {loading === "send" ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[s.primaryBtnText, !isPhoneValid && s.primaryBtnTextDisabled]}>
                  Continue
                </Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR CONTINUE WITH</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social login buttons */}
            <Pressable
              testID="google-signin-btn"
              onPress={handleGoogleSignIn}
              disabled={!!loading}
              style={s.socialBtn}
            >
              {loading === "google" ? (
                <ActivityIndicator size="small" color="#1a1a1a" />
              ) : (
                <>
                  <Text style={s.socialIcon}>G</Text>
                  <Text style={s.socialBtnText}>Sign in with Google</Text>
                </>
              )}
            </Pressable>

            <Pressable disabled style={[s.socialBtn, s.socialBtnFacebook]}>
              <Text style={[s.socialIcon, { color: "#fff" }]}>f</Text>
              <Text style={[s.socialBtnText, { color: "#fff" }]}>Sign in with Facebook</Text>
            </Pressable>

            <Pressable disabled style={[s.socialBtn, { opacity: 0.5 }]}>
              <Text style={s.socialIcon}>&#63743;</Text>
              <Text style={s.socialBtnText}>Sign in with Apple</Text>
            </Pressable>

            {/* Skip + Terms */}
            <Pressable testID="guest-mode-btn" onPress={handleGuest} style={{ alignItems: "center", marginTop: 16 }}>
              <Text style={s.skipText}>Skip for now</Text>
            </Pressable>

            <Text style={s.termsText}>
              If you continue, you agree to: Terms of Use · Privacy Policy
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─── Poster Background ─── */

function PosterBackground({ posters }: { posters: string[] }) {
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]} pointerEvents="none">
      <View
        style={s.posterGrid}
      >
        {[0, 1, 2, 3].map((col) => (
          <View key={col} style={s.posterCol}>
            {posters.map((uri: string, i: number) => (
              <Image
                key={`${col}-${i}`}
                source={{ uri }}
                style={s.posterImage}
                contentFit="cover"
                transition={500}
              />
            ))}
          </View>
        ))}
      </View>
      {/* Dark overlay gradient */}
      <View style={s.posterOverlay} />
      <View style={s.posterVignette} />
    </View>
  );
}

/* ─── Styles ─── */

const { width: SCREEN_W } = Dimensions.get("window");

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#09090b",
  },

  // Poster background
  posterGrid: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    opacity: 0.35,
    transform: [{ rotate: "-4deg" }, { scale: 1.2 }],
  },
  posterCol: {
    flex: 1,
    gap: 4,
  },
  posterImage: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 8,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,11,0.75)",
  },
  posterVignette: {
    ...StyleSheet.absoluteFillObject,
    // Bottom-heavy gradient for readability over login form
    ...(Platform.OS === "web"
      ? { background: "linear-gradient(to bottom, rgba(9,9,11,0.2) 0%, rgba(9,9,11,0.5) 35%, rgba(9,9,11,0.95) 65%, rgba(9,9,11,1) 100%)" }
      : { backgroundColor: "rgba(9,9,11,0.4)" }),
  },

  // Main layout
  mainContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  brandSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    minHeight: 120,
  },
  tagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  loginSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  // Sign in header
  signInTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  signInSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 16,
  },

  // Phone input
  phoneInputRow: {
    flexDirection: "row",
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  countryCode: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#fff",
  },
  countryList: {
    maxHeight: 180,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "rgba(30,30,36,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
  countryCodeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  // Primary button
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ff4d4d",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtnTextDisabled: {
    color: "rgba(255,255,255,0.2)",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },

  // Social buttons
  socialBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  socialBtnFacebook: {
    backgroundColor: "#1877F2",
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  // Skip & terms
  skipText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "500",
  },
  termsText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 16,
  },

  // Error
  errorBox: {
    backgroundColor: "rgba(255,77,77,0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 13,
    textAlign: "center",
  },

  // OTP / Phone full-screen layout (no poster background)
  otpFullScreen: {
    flex: 1,
    backgroundColor: "#09090b",
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  otpTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  otpTopTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  otpContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  otpSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
  },
  otpPhone: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  changeLink: {
    color: "#ff4d4d",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  otpBoxError: {
    borderColor: "#ff4d4d",
  },
  otpErrorText: {
    color: "#ff4d4d",
    fontSize: 12,
    marginTop: 12,
  },
  resendText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  resendTimer: {
    color: "#fff",
    fontWeight: "600",
  },
  resendLink: {
    color: "#ff4d4d",
    fontSize: 13,
    fontWeight: "600",
  },
  phoneIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,77,77,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,77,77,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});
