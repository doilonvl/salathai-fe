/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Paged } from "@/types/content";
import type { MarqueeSlide } from "@/types/marquee";
import { api } from "./api";

function optimizeCloudinaryUrl(url: string, options = "f_auto,q_auto,w_1400") {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes(`/upload/${options}/`)) return url;
  return url.replace("/upload/", `/upload/${options}/`);
}

export const marqueeSlidesAdminApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getMarqueeSlidesAdmin: builder.query<
      Paged<MarqueeSlide>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/marquee-slides/admin",
        params: params || undefined,
      }),
      transformResponse: (response: Paged<MarqueeSlide>) => {
        const rawItems = Array.isArray((response as any)?.items)
          ? (response as any).items
          : Array.isArray(response)
          ? (response as any)
          : [];
        const mapped = rawItems
          .map((item: MarqueeSlide) => ({
            ...item,
            imageUrl: optimizeCloudinaryUrl(
              item.imageUrl,
              "f_auto,q_auto,w_1400"
            ),
          }))
          .sort(
            (a: { orderIndex: number }, b: { orderIndex: number }) =>
              a.orderIndex - b.orderIndex
          );
        return {
          ...(Array.isArray(response)
            ? {
                items: mapped,
                total: mapped.length,
                page: 1,
                limit: mapped.length || 1,
              }
            : response),
          items: mapped,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: "MarqueeSlidesAdmin" as const,
                id: item.id,
              })),
              { type: "MarqueeSlidesAdmin" as const, id: "LIST" },
            ]
          : [{ type: "MarqueeSlidesAdmin" as const, id: "LIST" }],
      keepUnusedDataFor: 120,
    }),
    createMarqueeSlide: builder.mutation<MarqueeSlide, Partial<MarqueeSlide>>({
      query: (body) => ({
        url: "/marquee-slides",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MarqueeSlidesAdmin", id: "LIST" }, "Home"],
    }),
    updateMarqueeSlide: builder.mutation<
      MarqueeSlide,
      { id: string; body: Partial<MarqueeSlide> }
    >({
      query: ({ id, body }) => ({
        url: `/marquee-slides/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MarqueeSlidesAdmin", id: arg.id },
        { type: "MarqueeSlidesAdmin", id: "LIST" },
        "Home",
      ],
    }),
    deleteMarqueeSlide: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/marquee-slides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "MarqueeSlidesAdmin", id },
        { type: "MarqueeSlidesAdmin", id: "LIST" },
        "Home",
      ],
    }),
  }),
});

export const {
  useGetMarqueeSlidesAdminQuery,
  useCreateMarqueeSlideMutation,
  useUpdateMarqueeSlideMutation,
  useDeleteMarqueeSlideMutation,
} = marqueeSlidesAdminApi;
