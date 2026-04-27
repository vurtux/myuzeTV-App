import { Platform } from "react-native";
import * as Device from "expo-device";
import { analytics as webAnalytics } from "./firebase";
import { logEvent, setUserId, setUserProperties } from "firebase/analytics";

const MIXPANEL_TOKEN = "34e09017988589702619950f0b9ebe7e";
const MOENGAGE_APP_ID = "P571B1CH9BHEN2GUQTM75EZ1";

const injectScript = (id: string, code: string) => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  console.log(`[Analytics] Injecting snippet: ${id}`);
  const script = document.createElement('script');
  script.id = id;
  script.type = 'text/javascript';
  script.innerHTML = code;
  document.head.appendChild(script);
};

const MIXPANEL_SNIPPET = `
(function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
for(h=0;h<i.length;h++)g(a,i[h]);b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
`;

const MOENGAGE_SNIPPET = `
(function(i,s,o,g,r,a,m){i['MoengageObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://cdn.moengage.com/webpush/moe_webSdk.min.latest.js','Moengage');
`;

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

  private get mixpanel() {
    return (window as any).mixpanel;
  }

  private get moengage() {
    return (window as any).Moengage;
  }

  public async init() {
    if (this.isInitialized || Platform.OS !== 'web') return;
    try {
      console.log("[Analytics] Initializing Web Analytics (Snippet Mode)...");

      // 1. Inject Mixpanel
      injectScript('mixpanel-snippet', MIXPANEL_SNIPPET);
      if (this.mixpanel) {
        this.mixpanel.init(MIXPANEL_TOKEN, { 
          debug: true,
          track_pageview: true,
          persistence: 'localStorage'
        });
        console.log("[Analytics] Mixpanel Appended");
      }

      // 2. Inject MoEngage
      injectScript('moengage-snippet', MOENGAGE_SNIPPET);
      if (typeof this.moengage === 'function') {
        this.moengage({
          app_id: MOENGAGE_APP_ID,
          debug_logs: 1 // Enable verbose MoEngage logs
        });
        console.log("[Analytics] MoEngage Appended");
      }

      await this.setupInitialIdentity();
      this.isInitialized = true;
      console.log("AnalyticsService READY (Web)");
    } catch (error) {
      console.error("AnalyticsService Init Error:", error);
    }
  }

  private async setupInitialIdentity() {
    const anonymousId = "anon_" + Date.now();
    console.log(`[Analytics] Setting up anonymous identity: ${anonymousId}`);
    
    // Mixpanel
    if (this.mixpanel) {
      this.mixpanel.identify(anonymousId);
    }
    
    // MoEngage
    if (this.moengage) {
      this.moengage.add_unique_user_id?.(anonymousId);
    }
    
    if (webAnalytics) {
      setUserId(webAnalytics as any, anonymousId);
      
      const props = {
        platform: "web",
        device_name: "Web Browser",
        os_version: "N/A",
        app_version: "1.0.0"
      };
      
      setUserProperties(webAnalytics as any, props);
      if (this.mixpanel) this.mixpanel.people.set(props);
      if (this.moengage) {
        Object.entries(props).forEach(([key, value]) => {
          this.moengage.add_user_attribute?.(key, value);
        });
      }
    }
  }

  public async identify(userId: string, properties: Record<string, any> = {}) {
    console.log(`[Analytics] Identify: ${userId}`, properties);
    if (this.mixpanel) this.mixpanel.identify(userId);
    if (this.moengage) this.moengage.add_unique_user_id?.(userId);
    
    if (webAnalytics) {
      setUserId(webAnalytics as any, userId);
      if (Object.keys(properties).length > 0) {
        setUserProperties(webAnalytics as any, properties);
        if (this.mixpanel) this.mixpanel.people.set(properties);
        if (this.moengage) {
          Object.entries(properties).forEach(([key, value]) => {
            this.moengage.add_user_attribute?.(key, value);
          });
        }
      }
    }
  }

  public async trackEvent(name: string, properties: Record<string, any> = {}) {
    console.log(`[Analytics] Track Event: ${name}`, properties);
    if (this.mixpanel) this.mixpanel.track(name, properties);
    if (this.moengage) this.moengage.track_event?.(name, properties);
    
    if (webAnalytics) {
      logEvent(webAnalytics as any, name, properties);
    }
  }

  public async screenView(screenName: string, screenClass?: string) {
    console.log(`[Analytics] Screen View: ${screenName}`);
    this.trackEvent("screen_view", { screen_name: screenName });
    if (webAnalytics) {
      logEvent(webAnalytics as any, 'page_view', { 
        page_title: screenName, 
        page_path: screenName 
      });
    }
  }

  public async reset() {
    console.log("[Analytics] Resetting analytics state");
    if (this.mixpanel) this.mixpanel.reset();
    if (this.moengage) this.moengage.destroy_session?.();
    
    if (webAnalytics) {
      setUserId(webAnalytics as any, null);
    }
    await this.setupInitialIdentity();
  }
}

export const analyticsService = AnalyticsService.getInstance();
