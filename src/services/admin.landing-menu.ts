/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Paged } from "@/types/content";
import type { LandingMenuItem } from "@/types/landing";
import { api } from "./api";

function optimizeCloudinaryUrl(url: string, options = "f_auto,q_auto,w_1400") {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes(`/upload/${options}/`)) return url;
  return url.replace("/upload/", `/upload/${options}/`);
}

export const landingMenuAdminApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getLandingMenuAdmin: builder.query<
      Paged<LandingMenuItem>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/landing-menu/admin",
        params: params || undefined,
      }),
      transformResponse: (response: Paged<LandingMenuItem>) => {
        const rawItems = Array.isArray((response as any)?.items)
          ? (response as any).items
          : Array.isArray(response)
          ? (response as any)
          : [];
        const mapped = rawItems
          .map((item: LandingMenuItem) => ({
            ...item,
            imageUrl: optimizeCloudinaryUrl(item.imageUrl),
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
                type: "LandingMenuAdmin" as const,
                id: item.id,
              })),
              { type: "LandingMenuAdmin" as const, id: "LIST" },
            ]
          : [{ type: "LandingMenuAdmin" as const, id: "LIST" }],
      keepUnusedDataFor: 120,
    }),
    createLandingMenu: builder.mutation<
      LandingMenuItem,
      Partial<LandingMenuItem>
    >({
      query: (body) => ({
        url: "/landing-menu",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LandingMenuAdmin", id: "LIST" }, "Home"],
    }),
    updateLandingMenu: builder.mutation<
      LandingMenuItem,
      { id: string; body: Partial<LandingMenuItem> }
    >({
      query: ({ id, body }) => ({
        url: `/landing-menu/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "LandingMenuAdmin", id: arg.id },
        { type: "LandingMenuAdmin", id: "LIST" },
        "Home",
      ],
    }),
    deleteLandingMenu: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/landing-menu/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "LandingMenuAdmin", id },
        { type: "LandingMenuAdmin", id: "LIST" },
        "Home",
      ],
    }),
    uploadSingle: builder.mutation<
      { url?: string; secure_url?: string } | any,
      { file: File; folder?: string }
    >({
      query: ({ file, folder }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (folder) formData.append("folder", folder);

        return {
          url: "/upload/single",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetLandingMenuAdminQuery,
  useCreateLandingMenuMutation,
  useUpdateLandingMenuMutation,
  useDeleteLandingMenuMutation,
  useUploadSingleMutation,
} = landingMenuAdminApi;
