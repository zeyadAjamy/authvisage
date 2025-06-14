import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Counter, Trend } from "k6/metrics";

const BASE_URL = "http://localhost:3000";
const TOKEN = __ENV.TOKEN;

// Custom metrics for detailed monitoring
const userJourneyErrors = new Rate("user_journey_errors");
const pageLoadTime = new Trend("page_load_time");
const authFlowCounter = new Counter("auth_flow_completions");

// Setup function to verify server availability
export function setup() {
  console.log("🚀 Starting high-load realistic test scenarios...");

  try {
    const res = http.get(BASE_URL, { timeout: "5s" });
    if (res.status === 0) {
      throw new Error("Server connection failed");
    }
    console.log(
      `✅ Server is available on ${BASE_URL} (status: ${res.status})`,
    );
    return { serverRunning: true, baseUrl: BASE_URL };
  } catch (error) {
    console.error(`❌ Server not available: ${error}`);
    console.error("Please start the development server with: npm run dev");
    throw new Error("Server not available for testing");
  }
}

export const options = {
  scenarios: {
    // Scenario 1: Basic health check - continuous monitoring
    health_check: {
      executor: "constant-vus",
      vus: 10, // Increased from 2
      duration: "8m",
      exec: "healthCheck",
    },

    // Scenario 2: New user registration flow - high registration load
    new_user_registration: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 }, // Increased from 10
        { duration: "4m", target: 75 }, // Peak registration period
        { duration: "2m", target: 25 }, // Gradual decline
        { duration: "1m", target: 0 },
      ],
      exec: "newUserJourney",
    },

    // Scenario 3: Morning login rush - peak traffic simulation
    morning_login_rush: {
      executor: "ramping-arrival-rate",
      preAllocatedVUs: 100, // Increased from 20
      maxVUs: 200, // Increased from 50
      stages: [
        { target: 25, duration: "1m" }, // Early arrivals
        { target: 100, duration: "2m" }, // Peak rush hour
        { target: 150, duration: "1m" }, // Super peak
        { target: 75, duration: "3m" }, // Settling down
        { target: 20, duration: "1m" }, // End of rush
      ],
      exec: "returningUserLogin",
    },

    // Scenario 4: Active user browsing - sustained high usage
    active_user_browsing: {
      executor: "constant-arrival-rate",
      rate: 80, // Increased from 20
      duration: "6m",
      timeUnit: "1s",
      preAllocatedVUs: 100, // Increased from 25
      maxVUs: 150, // Increased from 40
      exec: "activeBrowsing",
    },

    // Scenario 5: Power user workflow - complex operations with more users
    power_user_workflow: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 25 }, // Increased from 5
        { duration: "4m", target: 40 }, // Sustained complex operations
        { duration: "1m", target: 15 }, // Partial logout
        { duration: "1m", target: 0 }, // Complete logout
      ],
      exec: "powerUserWorkflow",
    },

    // Scenario 6: OAuth authorization flow - high integration load
    oauth_authorization: {
      executor: "constant-vus",
      vus: 30, // Increased from 8
      duration: "5m",
      exec: "oauthFlow",
    },

    // Scenario 7: Mobile traffic simulation - mobile-first load
    mobile_traffic: {
      executor: "ramping-arrival-rate",
      preAllocatedVUs: 60, // Increased from 15
      maxVUs: 120, // Increased from 30
      stages: [
        { target: 40, duration: "1m" },
        { target: 100, duration: "3m" }, // Peak mobile usage
        { target: 60, duration: "2m" },
        { target: 20, duration: "1m" },
        { target: 0, duration: "1m" },
      ],
      exec: "mobileUserSession",
    },

    // Scenario 8: API stress test - intense API load
    api_stress: {
      executor: "constant-arrival-rate",
      rate: 200, // Increased from 50
      duration: "4m",
      timeUnit: "1s",
      preAllocatedVUs: 120, // Increased from 30
      maxVUs: 200, // Increased from 50
      exec: "apiStress",
    },

    // NEW Scenario 9: Weekend traffic - different usage patterns
    weekend_traffic: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "2m", target: 60 },
        { duration: "3m", target: 80 },
        { duration: "2m", target: 40 },
        { duration: "1m", target: 0 },
      ],
      exec: "weekendBrowsing",
    },

    // NEW Scenario 10: Burst traffic - sudden spike simulation
    burst_traffic: {
      executor: "ramping-arrival-rate",
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [
        { target: 5, duration: "30s" }, // Normal traffic
        { target: 250, duration: "30s" }, // Sudden burst
        { target: 100, duration: "1m" }, // High sustained
        { target: 10, duration: "30s" }, // Return to normal
      ],
      exec: "burstTraffic",
    },
  },

  // Enhanced commercial-grade thresholds
  thresholds: {
    // Overall performance requirements
    http_req_duration: [
      "p(50)<400", // 50% under 400ms (good for high load)
      "p(90)<1000", // 90% under 1s (acceptable under load)
      "p(95)<1500", // 95% under 1.5s (maximum acceptable)
      "p(99)<3000", // 99% under 3s (emergency tolerance)
    ],

    // Error rate thresholds
    checks: ["rate>0.95"], // 95% success rate under high load
    http_req_failed: ["rate<0.05"], // Less than 5% failures acceptable

    // Scenario-specific thresholds
    "http_req_failed{scenario:health_check}": ["rate<0.01"],
    "http_req_failed{scenario:new_user_registration}": ["rate<0.08"],
    "http_req_failed{scenario:morning_login_rush}": ["rate<0.10"],
    "http_req_failed{scenario:oauth_authorization}": ["rate<0.05"],
    "http_req_failed{scenario:burst_traffic}": ["rate<0.15"], // Higher tolerance for burst

    // Custom metrics thresholds
    user_journey_errors: ["rate<0.08"],
    page_load_time: ["p(95)<2000"],
    auth_flow_completions: ["count>50"], // Increased expectation

    // Throughput requirements
    http_reqs: ["rate>100"], // Minimum 100 requests/second average
  },

  // High-load browser simulation
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  noConnectionReuse: false,
  batch: 15, // Increased batch size
  maxRedirects: 3,
};

// Helper function to safely check response body
function safeBodyCheck(
  body: string | ArrayBuffer | null,
  searchTerm: string,
): boolean {
  if (!body) return false;
  if (typeof body === "string") {
    return body.includes(searchTerm);
  }
  return false;
}

// Scenario Functions

// 1. Health Check - Basic server monitoring
export function healthCheck() {
  group("Health Check", () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/`);
    const loadTime = Date.now() - startTime;

    pageLoadTime.add(loadTime);

    const success = check(res, {
      "homepage responds": (r) => r.status === 200 || r.status === 302,
      "homepage loads quickly": (r) => r.timings.duration < 1500,
      "homepage has content": (r) =>
        !!(r.body && typeof r.body === "string" && r.body.length > 0),
    });

    if (!success) userJourneyErrors.add(1);
    sleep(Math.random() * 2 + 2); // 2-4 seconds between checks
  });
}

// 2. New User Registration Journey
export function newUserJourney() {
  group("New User Registration Flow", () => {
    // Step 1: Land on homepage
    const homeRes = http.get(`${BASE_URL}/`);
    check(homeRes, {
      "homepage loads": (r) => r.status === 200 || r.status === 302,
    });
    sleep(Math.random() * 2 + 1); // User reads homepage: 1-3s

    // Step 2: Navigate to register
    const registerRes = http.get(`${BASE_URL}/register`);
    const registerSuccess = check(registerRes, {
      "register page loads": (r) => r.status === 200,
      "register form available": (r) =>
        safeBodyCheck(r.body, "register") || safeBodyCheck(r.body, "sign up"),
    });

    if (registerSuccess) {
      authFlowCounter.add(1);
      sleep(Math.random() * 8 + 10); // Form filling time: 10-18s (reduced for load)

      // Step 3: After registration, check biometric capture
      const biometricRes = http.get(`${BASE_URL}/capture-biometric`);
      check(biometricRes, {
        "biometric page accessible": (r) =>
          r.status === 200 || r.status === 401,
      });
    } else {
      userJourneyErrors.add(1);
    }

    sleep(Math.random() * 2 + 1); // Post-action pause: 1-3s
  });
}

// 3. Returning User Login Pattern
export function returningUserLogin() {
  group("Returning User Login", () => {
    // Direct navigation to login
    const loginRes = http.get(`${BASE_URL}/login`);
    const loginSuccess = check(loginRes, {
      "login page loads": (r) => r.status === 200,
      "login form present": (r) =>
        safeBodyCheck(r.body, "login") || safeBodyCheck(r.body, "sign in"),
    });

    if (loginSuccess) {
      sleep(Math.random() * 4 + 2); // Login form completion: 2-6s

      // Post-login navigation to apps
      const appsRes = http.get(`${BASE_URL}/connected-apps`);
      check(appsRes, {
        "apps page accessible": (r) => r.status === 200 || r.status === 401,
      });

      authFlowCounter.add(1);
    } else {
      userJourneyErrors.add(1);
    }

    sleep(Math.random() * 1 + 0.5); // Brief pause: 0.5-1.5s
  });
}

// 4. Active User Browsing Session
export function activeBrowsing() {
  group("Active User Session", () => {
    const pages = [
      { url: `${BASE_URL}/connected-apps`, name: "connected apps", weight: 40 },
      { url: `${BASE_URL}/projects`, name: "projects", weight: 30 },
      { url: `${BASE_URL}/profile-settings`, name: "profile", weight: 20 },
      { url: `${BASE_URL}/capture-biometric`, name: "biometric", weight: 10 },
    ];

    // Weighted random page selection
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPage = pages[0];

    for (const page of pages) {
      cumulative += page.weight;
      if (random <= cumulative) {
        selectedPage = page;
        break;
      }
    }

    const res = http.get(selectedPage.url);
    check(res, {
      [`${selectedPage.name} page loads`]: (r) =>
        r.status === 200 || r.status === 401,
      [`${selectedPage.name} responds quickly`]: (r) =>
        r.timings.duration < 2000,
    });

    // Realistic browsing behavior (reduced for load testing)
    sleep(Math.random() * 5 + 3); // Page viewing time: 3-8s
  });
}

// 5. Power User Workflow - Complex Operations
export function powerUserWorkflow() {
  group("Power User Workflow", () => {
    // Simulate admin/power user accessing multiple sections
    const workflow = [
      {
        url: `${BASE_URL}/projects`,
        action: "Managing projects",
        time: [8, 15],
      },
      {
        url: `${BASE_URL}/connected-apps`,
        action: "Reviewing apps",
        time: [5, 10],
      },
      {
        url: `${BASE_URL}/profile-settings`,
        action: "Updating settings",
        time: [10, 20],
      },
    ];

    for (const step of workflow) {
      const res = http.get(step.url);
      check(res, {
        [`${step.action} - page accessible`]: (r) =>
          r.status === 200 || r.status === 401,
      });

      // Power users spend more time on each page
      const [min, max] = step.time;
      sleep(Math.random() * (max - min) + min);
    }
  });
}

// 6. OAuth Authorization Flow
export function oauthFlow() {
  group("OAuth Authorization", () => {
    // Simulate external app authorization request
    const authorizeRes = http.get(`${BASE_URL}/authorize`);
    check(authorizeRes, {
      "authorize endpoint accessible": (r) =>
        r.status === 200 || r.status === 400,
    });

    sleep(Math.random() * 3 + 2); // Authorization decision time: 2-5s

    // Follow up with connected apps check
    const appsRes = http.get(`${BASE_URL}/connected-apps`);
    check(appsRes, {
      "apps list accessible": (r) => r.status === 200 || r.status === 401,
    });

    sleep(Math.random() * 2 + 1);
  });
}

// 7. Mobile User Session - Shorter, more frequent interactions
export function mobileUserSession() {
  group("Mobile User Session", () => {
    const mobilePages = [
      `${BASE_URL}/`,
      `${BASE_URL}/login`,
      `${BASE_URL}/connected-apps`,
    ];

    const selectedPage =
      mobilePages[Math.floor(Math.random() * mobilePages.length)];

    const res = http.get(selectedPage, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
      },
    });

    check(res, {
      "mobile page loads": (r) => r.status === 200 || r.status === 302,
      "mobile optimized": (r) => r.timings.duration < 3000, // Mobile tolerance
    });

    // Shorter mobile sessions
    sleep(Math.random() * 3 + 1); // 1-4s
  });
}

// 8. API Stress Test - High-frequency requests
export function apiStress() {
  group("API Stress Test", () => {
    const endpoints = [
      `${BASE_URL}/`,
      `${BASE_URL}/login`,
      `${BASE_URL}/register`,
    ];

    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

    const res = http.get(endpoint, {
      timeout: "5s",
    });

    check(res, {
      "api responds": (r) => r.status >= 200 && r.status < 500,
      "api responds quickly": (r) => r.timings.duration < 1000,
    });

    // Minimal sleep for stress testing
    sleep(Math.random() * 0.5 + 0.1); // 0.1-0.6s
  });
}

// 9. Weekend Browsing - Different usage patterns
export function weekendBrowsing() {
  group("Weekend Browsing", () => {
    const weekendPages = [
      `${BASE_URL}/`,
      `${BASE_URL}/profile-settings`,
      `${BASE_URL}/projects`,
    ];

    // Weekend users browse more leisurely
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const page =
        weekendPages[Math.floor(Math.random() * weekendPages.length)];
      const res = http.get(page);

      check(res, {
        "weekend page loads": (r) =>
          r.status === 200 || r.status === 302 || r.status === 401,
      });

      sleep(Math.random() * 6 + 4); // Longer weekend browsing: 4-10s
    }
  });
}

// 10. Burst Traffic - Sudden spike simulation
export function burstTraffic() {
  group("Burst Traffic", () => {
    const endpoints = [
      `${BASE_URL}/`,
      `${BASE_URL}/login`,
      `${BASE_URL}/register`,
      `${BASE_URL}/connected-apps`,
      `${BASE_URL}/projects`,
    ];

    // Rapid-fire requests to simulate burst
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = http.get(endpoint, { timeout: "2s" });

      check(res, {
        "burst request succeeds": (r) => r.status >= 200 && r.status < 500,
      });

      sleep(Math.random() * 0.2 + 0.05); // Very short delays: 0.05-0.25s
    }
  });
}

// Legacy functions for backward compatibility
export function checkHome() {
  const res = http.get(`${BASE_URL}/`);
  check(res, { "home page loaded": (r) => r.status === 200 });
  sleep(1);
}

export function registerThenCapture() {
  const regRes = http.get(`${BASE_URL}/register`);
  check(regRes, { "register page OK": (r) => r.status === 200 });

  sleep(1); // simulate user time filling form

  const bioRes = http.get(`${BASE_URL}/capture-biometric`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  check(bioRes, { "biometric page OK": (r) => r.status === 200 });

  sleep(1);
}

export function loginPage() {
  const res = http.get(`${BASE_URL}/login`);
  check(res, { "login page loaded": (r) => r.status === 200 });
  sleep(0.5);
}

export function connectedApps() {
  const res = http.get(`${BASE_URL}/connected-apps`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  check(res, { "connected apps page loaded": (r) => r.status === 200 });
  sleep(0.5);
}
