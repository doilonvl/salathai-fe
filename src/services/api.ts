/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { Paged } from "@/types/content";
import type { LandingMenuItem } from "@/types/landing";
import type { MarqueeImage, MarqueeSlide } from "@/types/marquee";
import type {
  ReservationRequestPayload,
  ReservationRequestResponse,
} from "@/types/reservation";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

function getClientToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function optimizeCloudinaryUrl(url: string, options = "f_auto,q_auto,w_1400") {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes(`/upload/${options}/`)) return url;
  return url.replace("/upload/", `/upload/${options}/`);
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getClientToken();
    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes
          .json()
          .catch(() => ({ accessToken: null as string | null }));
        const newAccess =
          (data as any)?.accessToken ||
          (data as any)?.access_token ||
          (data as any)?.token;
        if (newAccess && typeof window !== "undefined") {
          localStorage.setItem("access_token", newAccess);
        }
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } catch (err) {
      console.error("REFRESH_TOKEN_FAILED", err);
    }
  }

  return result;
};

// ---- API ----

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Home", "LandingMenuAdmin", "MarqueeSlidesAdmin"],
  endpoints: (builder) => ({
    // -------- HOME --------
    getLandingMenu: builder.query<Paged<LandingMenuItem>, void>({
      query: () => ({
        url: "/landing-menu",
      }),
      transformResponse: (response: Paged<LandingMenuItem>) => {
        const rawItems = Array.isArray((response as any)?.items)
          ? (response as any).items
          : Array.isArray(response)
          ? (response as any)
          : [];
        const items = rawItems
          .filter((item: LandingMenuItem) => item?.isActive)
          .sort(
            (a: LandingMenuItem, b: LandingMenuItem) =>
              a.orderIndex - b.orderIndex
          )
          .map((item: LandingMenuItem) => ({
            ...item,
            imageUrl: optimizeCloudinaryUrl(item.imageUrl),
          }));
        return {
          ...(Array.isArray(response)
            ? { items, total: items.length, page: 1, limit: items.length || 1 }
            : response),
          items,
        };
      },
      providesTags: ["Home"],
      keepUnusedDataFor: 300,
    }),
    getMarqueeImages: builder.query<Paged<MarqueeImage>, void>({
      query: () => ({
        url: "/marquee-images",
      }),
      transformResponse: (response: Paged<MarqueeImage>) => ({
        ...response,
        items: response.items
          .filter((item) => item.isActive)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((item) => ({
            ...item,
            imageUrl: optimizeCloudinaryUrl(
              item.imageUrl,
              "f_auto,q_auto,w_1200"
            ),
          })),
      }),
      providesTags: ["Home"],
      keepUnusedDataFor: 300,
    }),
    getMarqueeSlides: builder.query<Paged<MarqueeSlide>, void>({
      query: () => ({
        url: "/marquee-slides",
      }),
      transformResponse: (response: Paged<MarqueeSlide>) => ({
        ...response,
        items: response.items
          .filter((item) => item.isActive)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((item) => ({
            ...item,
            imageUrl: optimizeCloudinaryUrl(
              item.imageUrl,
              "f_auto,q_auto,w_1400"
            ),
          })),
      }),
      providesTags: ["Home"],
      keepUnusedDataFor: 300,
    }),
    createReservationRequest: builder.mutation<
      ReservationRequestResponse,
      ReservationRequestPayload
    >({
      query: (body) => ({
        url: "/reservation-requests",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetLandingMenuQuery,
  useGetMarqueeImagesQuery,
  useGetMarqueeSlidesQuery,
  useCreateReservationRequestMutation,
} = api;
