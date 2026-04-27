import { Mixpanel } from "mixpanel-react-native";
import { MoEConfig, MoEngage } from "react-native-moengage";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Application from "expo-application";

const MIXPANEL_TOKEN = "34e09017988589702619950f0b9ebe7e";
const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async init() {
    if (this.isInitialized) return;

    try {
      // 1. Init Mixpanel
      await mixpanel.init();

      // 2. Init MoEngage
      const moeConfig = new MoEConfig("P571B1CH9BHEN2GUQTM75EZ1");
      MoEngage.initialize(moeConfig);

      // 3. Setup Initial Identity
      await this.setupInitialIdentity();

      this.isInitialized = true;
      console.log("AnalyticsService Initialized (Native)");
    } catch (error) {
      console.error("AnalyticsService Init Error:", error);
      crashlytics().recordError(error as Error);
    }
  }

  private async setupInitialIdentity() {
    // Generate/Fetch Anonymous ID
    const anonymousId = (await Application.getAndroidId()) || Device.osBuildId || "anon_user";
    
    // Initial identity across all SDKs
    await mixpanel.identify(anonymousId);
    MoEngage.setUserUniqueId(anonymousId);
    await analytics().setUserId(anonymousId);
    
    // Set basic device properties
    const props = {
      platform: Platform.OS,
      device_name: Device.deviceName,
      os_version: Device.osVersion,
      app_version: Application.nativeApplicationVersion
    };
    
    await mixpanel.getPeople().set(props);
    Object.entries(props).forEach(([key, value]) => {
      MoEngage.setUserAttribute(key, value);
      analytics().setUserProperties({ [key]: String(value) });
    });
  }

  public async identify(userId: string, properties: Record<string, any> = {}) {
    await mixpanel.identify(userId);
    MoEngage.setUserUniqueId(userId);
    await analytics().setUserId(userId);
    
    if (Object.keys(properties).length > 0) {
      await mixpanel.getPeople().set(properties);
      Object.entries(properties).forEach(([key, value]) => {
        MoEngage.setUserAttribute(key, value);
        analytics().setUserProperties({ [key]: String(value) });
      });
    }
  }

  public async trackEvent(name: string, properties: Record<string, any> = {}) {
    try {
      mixpanel.track(name, properties);
      MoEngage.trackEvent(name, properties);
      await analytics().logEvent(name, properties);
    } catch (error) {
      console.error(`Error tracking event ${name}:`, error);
    }
  }

  public async screenView(screenName: string, screenClass?: string) {
    try {
      this.trackEvent("screen_view", { screen_name: screenName });
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error(`Error tracking screen view ${screenName}:`, error);
    }
  }

  public async reset() {
    await mixpanel.reset();
    MoEngage.logout();
    await analytics().setUserId(null);
    await this.setupInitialIdentity(); 
  }
}

export const analyticsService = AnalyticsService.getInstance();
