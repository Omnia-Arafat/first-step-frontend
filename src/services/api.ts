import { ContactFormData } from "@/lib/schemas";
import { ApiErrorHandler } from "@/lib/error-handling";
import { formatTime } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  AdSlide,
  Blog,
  CenterRegisterPayload,
  CommonQuestion,
  ParentRegisterPayload,
  Service,
  Value,
  EstablishmentResponse,
  PortfolioResponse,
  ParentRegisterPayloadv2,
  NurseryRegisterPayload,
  NurseryPlan,
  CategoryService,
} from "@/types";
import axios from "axios";
import { useSubscriptionStore } from "@/store/subscriptionStore";

// Utility function to check if an endpoint is allowed without subscription
const isSubscriptionAllowed = (url: string): boolean => {
  const allowlist = [
    "/plans",
    "/plans-get",
    "/payment/subscribe",
    "/login",
    "/auth/google",
    "/register-parent",
    "/register-center",
    "/forget-password",
    "/check-otp",
    "/rest-password",
    "/cities",
    "/sliders",
    "/common-question",
    "/our-value-keys",
    "/services",
    "/contact-us",
    "/subscripe",
    "/terms-and-condition",
    "/privacy",
    "/blogs",
    "/center-filter",
    "/latest-search",
  ];

  return allowlist.some((path) => url.includes(path));
};

// Utility function to check if error message indicates subscription requirement
const isSubscriptionRequiredMessage = (message: string): boolean => {
  return (
    message.includes("No free trial available.") ||
    message.includes("Your subscription is not active.")
  );
};

// Utility function to format API errors consistently
const formatApiError = (error: any, status: number, data: any) => {
  return {
    message:
      data?.message ||
      data?.error ||
      error.message ||
      "An unexpected error occurred",
    errors: data?.errors || {},
    status: status,
    data: data,
    url: error.config?.url,
    method: error.config?.method,
  };
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const toSaudiLocalPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("00966")) {
    return `0${digits.slice(5, 14)}`;
  }

  if (digits.startsWith("966")) {
    return `0${digits.slice(3, 12)}`;
  }

  if (digits.startsWith("5")) {
    return `0${digits.slice(0, 9)}`;
  }

  if (digits.startsWith("05")) {
    return digits.slice(0, 10);
  }

  return digits;
};

// Optional: Add interceptors (useful later for auth tokens, error handling)
apiClient.interceptors.request.use(
  (config) => {
    // Get token from auth store (only in browser environment)
    let token: string | null = null;

    if (typeof window !== "undefined") {
      try {
        token = useAuthStore.getState().token;
      } catch (error) {
        // Store not available, continue without token
        console.warn("Auth store not available in interceptor");
      }
    }

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check subscription requirements (only in browser environment)
    if (typeof window !== "undefined") {
      try {
        const { subscriptionRequired } = useSubscriptionStore.getState();
        if (subscriptionRequired) {
          const url = config.url || "";
          if (!isSubscriptionAllowed(url)) {
            // Create a structured subscription error
            const subscriptionError = {
              message:
                "No free trial available. Please select a subscription plan to continue.",
              status: 403,
              url: config.url,
              method: config.method,
              isSubscriptionError: true,
              type: "SUBSCRIPTION_REQUIRED",
            };

            return Promise.reject(subscriptionError);
          }
        }
      } catch (error) {
        // Store not available, continue without subscription check
        console.warn("Subscription store not available in interceptor");
      }
    }

    return config;
  },
  (error) => {
    // Handle request interceptor errors
    if (process.env.NODE_ENV === "development") {
      console.error("Request Interceptor Error:", error);
    }
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if this is a subscription error from request interceptor first
    if (error.isSubscriptionError && error.type === "SUBSCRIPTION_REQUIRED") {
      // This is a subscription error from request interceptor, not a network error
      if (typeof window !== "undefined") {
        try {
          useSubscriptionStore.getState().setSubscriptionRequired(true);
        } catch (storeError) {
          console.warn("Could not update subscription store:", storeError);
        }
      }

      // Return the subscription error directly with consistent structure
      return Promise.reject({
        message: error.message,
        errors: {},
        status: error.status,
        url: error.url,
        method: error.method,
        isSubscriptionError: true,
        type: error.type,
      });
    }

    // Handle network errors (no response from server)
    if (!error.response) {
      const networkError = {
        message: "Network error - Please check your internet connection",
        errors: {},
        status: 0,
        url: error.config?.url,
        method: error.config?.method,
        isNetworkError: true,
      };

      if (process.env.NODE_ENV === "development") {
        console.error("Network Error:", networkError);
      }

      return Promise.reject(networkError);
    }

    // Handle API errors with response
    const { status, data } = error.response;

    // Check for subscription gate (403 status from server)
    if (status === 403 && typeof window !== "undefined") {
      try {
        const msg = data?.message || data?.error || "";
        if (typeof msg === "string" && isSubscriptionRequiredMessage(msg)) {
          useSubscriptionStore.getState().setSubscriptionRequired(true);
        }
      } catch (storeError) {
        console.warn("Could not update subscription store:", storeError);
      }
    }

    // Format error response consistently
    const formattedError = formatApiError(error, status, data);

    // Log errors in development only
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        status,
        message: formattedError.message,
        url: formattedError.url,
        method: formattedError.method,
      });
    }

    return Promise.reject(formattedError);
  },
);

export const websiteService = {
  getAdSlides: async (locale: string): Promise<AdSlide[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sliders`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.NEXT_PUBLIC_X_AUTHORIZATION || "",
            "X-Authorization-Secret":
              process.env.NEXT_PUBLIC_X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch ad slides",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as AdSlide[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCommonQuestions: async (locale: string): Promise<CommonQuestion[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/common-question`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.NEXT_PUBLIC_X_AUTHORIZATION || "",
            "X-Authorization-Secret":
              process.env.NEXT_PUBLIC_X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch common questions",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as CommonQuestion[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOurValues: async (locale: string): Promise<Value[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/our-value-keys`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch values",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as Value[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOurServices: async (locale: string): Promise<Service[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/services`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch services",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as Service[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  contactUs: async (payload: ContactFormData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contact-us`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const responseData = await res.json();
        throw {
          message: responseData?.message || "Failed to submit contact form",
          errors: responseData?.errors || {},
          status: res.status,
        };
      }

      return await res.json();
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  subscribeToNewsletter: async (email: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscripe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          body: JSON.stringify({ email }),
        },
      );

      if (!res.ok) {
        const responseData = await res.json();
        throw {
          message: responseData?.message || "Failed to subscribe to newsletter",
          errors: responseData?.errors || {},
          status: res.status,
        };
      }

      return await res.json();
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  checkEmail: async (email: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          body: JSON.stringify({ email }),
        },
      );

      if (!res.ok) {
        const responseData = await res.json();
        throw {
          message: responseData?.message || "Failed to check email",
          errors: responseData?.errors || {},
          status: res.status,
        };
      }

      return await res.json();
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getPlans: async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plans-get`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch plans",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getTermsAndConditions: async (locale: string): Promise<Blog[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/terms-and-condition?lang=${locale}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch terms and conditions",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.terms;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getPrivacy: async (locale: string): Promise<Blog[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/privacy?lang=${locale}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch privacy",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.privacy;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const blogService = {
  getBlogs: async (locale: string): Promise<Blog[]> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs`, {
        headers: {
          "Content-Type": "application/json",
          lang: locale,
          "X-Authorization": process.env.X_AUTHORIZATION || "",
          "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
        },
        next: {
          revalidate: 86400,
        },
      });

      if (!res.ok) {
        throw {
          message: "Failed to fetch blogs",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as Blog[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getLatestBlogs: async (locale: string): Promise<Blog[]> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs`, {
        headers: {
          "Content-Type": "application/json",
          lang: locale,
          "X-Authorization": process.env.X_AUTHORIZATION || "",
          "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
        },
        next: {
          revalidate: 1,
        },
      });

      if (!res.ok) {
        throw {
          message: "Failed to fetch latest blogs",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as Blog[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBlogById: async (blogId: string, locale: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${blogId}`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 1,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch blog",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const establishmentService = {
  getEstablishments: async (
    locale: string,
    params?: { key: string; value: string }[],
  ): Promise<EstablishmentResponse[]> => {
    try {
      const query = params
        ? "?" +
          params
            .map(
              ({ key, value }) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
            )
            .join("&")
        : "";

      let res: Response;
      try {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/establishment${query}`,
          {
            headers: {
              "Content-Type": "application/json",
              lang: locale,
              "X-Authorization": process.env.X_AUTHORIZATION || "",
              "X-Authorization-Secret":
                process.env.X_AUTHORIZATION_SECRET || "",
            },
            next: {
              revalidate: 1,
            },
          },
        );
      } catch (fetchError: any) {
        // Handle network errors (fetch failed, connection refused, timeout, etc.)
        if (
          fetchError instanceof TypeError &&
          fetchError.message.includes("fetch failed")
        ) {
          throw {
            message:
              locale === "ar"
                ? "فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
                : "Network connection failed. Please check your internet connection and try again.",
            errors: {},
            status: 0,
            isNetworkError: true,
          };
        }
        // Re-throw other fetch errors
        throw {
          message:
            locale === "ar"
              ? "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى."
              : "An error occurred while connecting to the server. Please try again.",
          errors: {},
          status: 0,
          originalError: fetchError.message,
        };
      }

      // Check response status before trying to parse JSON
      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {
          // If JSON parsing fails, use default error
          errorData = {};
        }
        throw {
          message:
            errorData?.message ||
            (locale === "ar"
              ? "فشل في جلب بيانات المنشآت"
              : "Failed to fetch establishments"),
          errors: errorData?.errors || {},
          status: res.status,
          data: errorData,
        };
      }

      // Parse JSON response
      let data: any;
      try {
        data = await res.json();
      } catch (jsonError: any) {
        throw {
          message:
            locale === "ar"
              ? "فشل في قراءة البيانات من الخادم. يرجى المحاولة مرة أخرى."
              : "Failed to parse server response. Please try again.",
          errors: {},
          status: res.status,
          isParseError: true,
        };
      }

      // Flatten nurseries and centers into a single array
      const establishments: EstablishmentResponse[] = [];

      if (data.nurseries && Array.isArray(data.nurseries)) {
        data.nurseries.forEach((nursery: any) => {
          establishments.push({
            ...nursery,
            // Map nested nursery object properties to top level if needed
            nursery_name:
              nursery.nursery?.nursery_name ||
              nursery.nursery_name ||
              nursery.name,
            logo: nursery.nursery?.logo || nursery.logo,
            city: nursery.nursery?.city || nursery.city,
            neighborhood: nursery.neighborhood,
            // Ensure ID is number
            id: Number(nursery.id),
            user_id: nursery.id,
            role: nursery.role || "nursery",
            type: "nurseries",
          });
        });
      }

      if (data.centers && Array.isArray(data.centers)) {
        data.centers.forEach((center: any) => {
          establishments.push({
            ...center,
            nursery_name:
              center.center?.nursery_name || center.nursery_name || center.name,
            logo: center.center?.logo || center.logo,
            city: center.center?.city || center.city,
            neighborhood: center.neighborhood,
            id: Number(center.id),
            user_id: center.id,
            role: center.role || "center",
            type: "centers",
          });
        });
      }

      console.log(
        "Mapped establishments (name, role): ",
        establishments.map((e) => ({ name: e.nursery_name, role: e.role })),
      );

      return establishments;
    } catch (error: any) {
      // If error is already formatted, pass it through
      if (error.message && error.status !== undefined) {
        throw ApiErrorHandler.handle(error);
      }
      // Otherwise, let ApiErrorHandler format it
      throw ApiErrorHandler.handle(error);
    }
  },

  getEstablishmentPortfolio: async (
    nurseryName: string,
    locale: string,
  ): Promise<PortfolioResponse | null> => {
    try {
      // First, get all establishments to find the ID for the given name
      const establishments =
        await establishmentService.getEstablishments(locale);
      const establishment = establishments.find((n) => {
        const dbName = n.nursery_name.toLowerCase().trim();
        const searchName = nurseryName.toLowerCase().trim();
        return (
          dbName === searchName ||
          dbName.includes(searchName) ||
          searchName.includes(dbName)
        );
      });

      if (!establishment || !establishment.id) {
        return null;
      }

      // Use the establishment.id for the portfolio endpoint
      console.log(
        `Establishment: ${establishment.nursery_name}, ID: ${establishment.id}`,
      );

      return await establishmentService.getEstablishmentPortfolioById(
        establishment.id,
        locale,
      );
    } catch (error) {
      console.error("Error fetching establishment portfolio:", error);
      return null;
    }
  },

  getEstablishmentPortfolioById: async (
    id: number | string,
    locale: string,
    role?: string,
  ): Promise<PortfolioResponse | null> => {
    try {
      console.log(
        `Fetching portfolio for establishment ID: ${id}, Role: ${role}`,
      );

      let endpoint = "v2/get-portfilo-center"; // Default endpoint
      if (role === "nursery" || role === "nurseries") {
        endpoint = "get-portfilo-nursery";
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
        },
      );

      if (!res.ok) {
        console.error(
          `Portfolio API failed for establishment ID ${id}:`,
          res.status,
          res.statusText,
        );
        throw {
          message: "Failed to fetch portfolio data",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      console.log(`Portfolio data received for establishment ID ${id}:`, data);

      // The API might return { "data": { ... } } or just { ... }
      // We need to ensure we return the user/portfolio data correctly
      const portfolioData = data.data || data;

      // Check if we actually have valid portfolio data
      if (
        !portfolioData ||
        (!portfolioData.nursery_name && !portfolioData.name)
      ) {
        console.warn(
          `Portfolio data for ID ${id} seems empty or invalid structure:`,
          portfolioData,
        );
      }

      return {
        message: "Success",
        data: portfolioData,
      };
    } catch (error: any) {
      console.error("Error fetching establishment portfolio:", error);
      // Don't return null immediately if it's a 404, maybe we can fallback?
      // But for now, returning null triggers the waiting page
      return null;
    }
  },

  getLatestEstablishments: async (
    locale: string,
  ): Promise<EstablishmentResponse[]> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/latest-search`,
        {
          headers: {
            "Content-Type": "application/json",
            lang: locale,
            "X-Authorization": process.env.X_AUTHORIZATION || "",
            "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET || "",
          },
          next: {
            revalidate: 86400,
          },
        },
      );

      if (!res.ok) {
        throw {
          message: "Failed to fetch latest establishments",
          errors: {},
          status: res.status,
        };
      }

      const data = await res.json();
      return data.data as EstablishmentResponse[];
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranchesByNursery: async (nurseryName: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(
        `/branches?nursery_name=${nurseryName}`,
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching branches by nursery:", error);
      return [];
    }
  },

  getBranchesForCenter: async (centerId: string): Promise<{ data: any[] }> => {
    try {
      const response = await apiClient.get(
        `/get-branches-for-center/${centerId}`,
      );
      return response.data || { data: [] };
    } catch (error) {
      console.error("Error fetching branches for center:", error);
      return { data: [] };
    }
  },

  getBranchPricing: async (
    branchId: string,
    centerId?: string,
  ): Promise<any[]> => {
    try {
      if (centerId) {
        const response = await apiClient.get(
          `/get-branches-for-center/${centerId}`,
        );
        const branch = (response.data?.data || []).find(
          (b: any) => String(b.id) === String(branchId),
        );
        return branch?.pricing || [];
      }

      const response = await apiClient.get(`/branches-pricies/${branchId}`);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching branch pricing:", error);
      return [];
    }
  },

  getCenterPromocodes: async (centerId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/centers/${centerId}/promocodes`);
      return response.data;
    } catch (error) {
      console.error("Error fetching center promocodes:", error);
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterBlogs: async (centerId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/centers/${centerId}/blogs-center`);
      return response.data;
    } catch (error) {
      console.error("Error fetching center blogs:", error);
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterAds: async (centerId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/centers/${centerId}/ads`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching center ads:", error);
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const authService = {
  getCategoryServices: async (): Promise<CategoryService[]> => {
    try {
      const response = await apiClient.get("/category-services");
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterTypes: async () => {
    try {
      const response = await apiClient.get("/types-public");
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  registerParentv2: async (payload: ParentRegisterPayloadv2) => {
    try {
      const response = await apiClient.post("/v2/register-v2", {
        ...payload,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  addChildren: async (payload: FormData) => {
    try {
      const response = await apiClient.post(`/v2/childs`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  registerParent: async (payload: ParentRegisterPayload) => {
    try {
      const response = await apiClient.post("/register-parent", {
        ...payload,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  registerCenter: async (payload: CenterRegisterPayload) => {
    try {
      const formData = new FormData();

      // Basic fields - using correct API field names
      formData.append("name", payload.nursery_name);
      formData.append("email", payload.email);
      formData.append("password", payload.password);
      formData.append("phone", toSaudiLocalPhone(payload.phone));
      formData.append("city_id", payload.city_id);

      if (payload.logo) {
        formData.append("logo", payload.logo);
      }

      if (
        payload.category_service_ids &&
        payload.category_service_ids.length > 0
      ) {
        payload.category_service_ids.forEach((id) => {
          formData.append("category_service_ids[]", String(id));
        });
      }

      console.log("Register Center Payload:", {
        name: payload.nursery_name,
        email: payload.email,
        phone: toSaudiLocalPhone(payload.phone),
        city_id: payload.city_id,
        logo: payload.logo?.name,
      });

      const response = await apiClient.post("/v3/register-center", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Register Center Error:", error);
      console.error("Error Response Status:", error.response?.status);
      console.error("Error Response Data:", error.response?.data);

      if (error.response?.data?.errors) {
        console.error("Validation Errors:", error.response.data.errors);
      }

      throw ApiErrorHandler.handle(error);
    }
  },

  registerNursery: async (payload: NurseryRegisterPayload) => {
    try {
      const formData = new FormData();

      // Basic fields - using correct API field names
      formData.append("name", payload.nursery_name);
      formData.append("email", payload.email);
      formData.append("password", payload.password);
      formData.append("phone", toSaudiLocalPhone(payload.phone));
      formData.append("city_id", payload.city_id);

      if (payload.logo) {
        formData.append("logo", payload.logo);
      }

      if (
        payload.category_service_ids &&
        payload.category_service_ids.length > 0
      ) {
        payload.category_service_ids.forEach((id) => {
          formData.append("category_service_ids[]", String(id));
        });
      }

      console.log("Register Nursery Payload:", {
        name: payload.nursery_name,
        email: payload.email,
        phone: toSaudiLocalPhone(payload.phone),
        city_id: payload.city_id,
        logo: payload.logo?.name,
      });

      const response = await apiClient.post("/v3/register-nursery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/login", {
        email,
        password,
      });

      // Check if the response indicates an error (some APIs return 200 with error inside)
      if (response.data.status === "401" || response.data.status === 401) {
        throw {
          message: response.data.message || "Login failed",
          errors: {},
          status: 401,
        };
      }

      // Validate that we have the required data
      if (!response.data.token || !response.data.user) {
        throw {
          message:
            response.data.message ||
            "Login failed: Invalid response from server",
          errors: {},
          status: 401,
        };
      }

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post("/forget-password", {
        email,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  checkOTP: async (email: string, otp: string) => {
    try {
      const response = await apiClient.post("/check-otp", {
        email,
        otp,
      });

      const result = response.data;

      if (!result.status) {
        throw {
          message: result.error || "Invalid OTP code",
          errors: {
            otp: [result.error || "Please check your OTP code and try again"],
          },
          status: 400,
        };
      }

      return result;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  resetPassword: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/rest-password", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  googleSignIn: async (token: string) => {
    try {
      const response = await apiClient.post("/auth/google", {
        token,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  confirmPassword: async (password: string) => {
    try {
      const response = await apiClient.put("/verify-password", { password });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCities: async () => {
    try {
      const response = await apiClient.get("/cities");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const paymentService = {
  centerSubscribe: async (planId: number) => {
    try {
      console.log(
        "Payment service - Making request to /payment/subscribe with plan_id:",
        planId,
      );
      console.log(
        "Payment service - API Base URL:",
        process.env.NEXT_PUBLIC_API_BASE_URL,
      );
      console.log("Payment service - Request headers:", {
        "Content-Type": "application/json",
        "X-Authorization": process.env.X_AUTHORIZATION ? "***" : "NOT_SET",
        "X-Authorization-Secret": process.env.X_AUTHORIZATION_SECRET
          ? "***"
          : "NOT_SET",
      });

      const response = await apiClient.post("/payment/subscribe", {
        plan_id: planId,
      });

      console.log("Payment service - Response received:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });

      return response.data;
    } catch (error) {
      console.error("Payment service - Error occurred:", error);
      throw ApiErrorHandler.handle(error);
    }
  },

  parentSubscribe: async (enrollmentId: number) => {
    try {
      console.log(
        "Payment service - Making request to /payment/subscribe with enrollment_id:",
        enrollmentId,
      );

      const response = await apiClient.post("/payment/subscribe", {
        enrollment_id: enrollmentId,
      });

      console.log(
        "Payment service - Parent subscription response:",
        response.data,
      );
      return response.data;
    } catch (error) {
      console.error("Payment service - Parent subscription error:", error);
      throw ApiErrorHandler.handle(error);
    }
  },

  payOrder: async (params: { enrollment_id: number; coupon_code?: string }) => {
    try {
      // Only send enrollment_id and title (coupon code) if it exists
      const payload: { enrollment_id: number; title?: string } = {
        enrollment_id: params.enrollment_id,
        title: params.coupon_code,
      };

      // Ensure coupon code is trimmed and uppercased if provided, send as 'title'
      if (params.coupon_code && params.coupon_code.trim()) {
        payload.title = params.coupon_code.trim().toUpperCase();
      }

      console.log("Payment service - payOrder request:", payload);
      const response = await apiClient.post("/payment/pay-order", payload);
      console.log("Payment service - payOrder response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Payment service - payOrder error:", error);
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const enrollmentService = {
  createEnrollment: async (payload: {
    center_branch_id: number | string;
    branch_price_id: number | string;
    parent_phone: string;
    children: Array<number | string>;
    admin_options?: Array<number | string>;
    day_string?: string; // for 'hour'
    starting_time?: string; // for 'hour'
    starting_date?: string; // for day/week/month/year
  }) => {
    try {
      const response = await apiClient.post("/enrollments", payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createExistingEnrollment: async (payload: {
    center_branch_id: number | string;
    branch_price_id: number | string;
    children: Array<number | string>;
  }) => {
    try {
      const response = await apiClient.post("/enrollment-existing", payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

// Parent-related APIs
export const parentService = {
  getChildren: async (): Promise<any[]> => {
    try {
      console.log(
        "[parentService.getChildren] Calling API endpoint: /parent/children",
      );
      const response = await apiClient.get("/parent/children");
      console.log(
        "[parentService.getChildren] Response status:",
        response.status,
      );
      console.log(
        "[parentService.getChildren] Response data:",
        JSON.stringify(response.data, null, 2),
      );

      // Some endpoints return { data: [...] } while others return [] directly
      const data = response.data;
      if (Array.isArray(data)) {
        console.log(
          "[parentService.getChildren] Data is array, returning:",
          data.length,
          "items",
        );
        return data;
      }
      if (Array.isArray(data?.data)) {
        console.log(
          "[parentService.getChildren] Data.data is array, returning:",
          data.data.length,
          "items",
        );
        return data.data;
      }
      console.log(
        "[parentService.getChildren] No array found, returning empty array",
      );
      return [];
    } catch (error) {
      console.error("[parentService.getChildren] Error occurred:", error);
      throw ApiErrorHandler.handle(error);
    }
  },

  /**
   * Register parent accounts by center
   *
   * This endpoint allows centers to create parent accounts with their children's information.
   * The API expects a payload with an array of parents, each containing their details
   * and an array of children with their information.
   *
   * @param payload - Object containing array of parents with their children
   * @returns Promise with API response containing created parent and child IDs
   *
   * Example response:
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "id": 208,
   *       "name": "kareem",
   *       "email": "omnis@gmail.com",
   *       "phone": "0551234567",
   *       "role": "parent",
   *       "children": [
   *         {
   *           "id": 142,
   *           "child_name": "omar",
   *           "birthday_date": "2015-05-10",
   *           "gender": "boy",
   *           "kinship": "father"
   *         }
   *       ]
   *     }
   *   ],
   *   "message": "parent and his child register successfully",
   *   "status": 200
   * }
   *
   * Note: The API expects specific field names:
   * - Parent: 'phone' (not 'mobile')
   * - Child: 'child_name' (not 'name'), 'birthday_date' (not 'birthDate'),
   *   'kinship' (not 'relationship'), 'boy'/'girl' (not 'male'/'female')
   */
  registerParentByCenter: async (payload: {
    parents: Array<{
      name: string;
      email: string;
      phone: string;
      children: Array<{
        child_name: string;
        birthday_date: string; // ISO date string (YYYY-MM-DD format)
        kinship: string;
        gender: "boy" | "girl";
      }>;
    }>;
  }) => {
    try {
      console.log("Registering parent by center with payload:", payload);

      const response = await apiClient.post(
        "/register-parent-by-center",
        payload,
      );

      console.log("Parent registration response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error registering parent by center:", error);
      throw ApiErrorHandler.handle(error);
    }
  },
};
