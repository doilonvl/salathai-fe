/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateMarqueeSlideMutation,
  useDeleteMarqueeSlideMutation,
  useGetMarqueeSlidesAdminQuery,
  useUpdateMarqueeSlideMutation,
} from "@/services/admin.marquee-slides";
import { useUploadSingleMutation } from "@/services/admin.landing-menu";
import type { MarqueeSlide } from "@/types/marquee";

type FormState = {
  imageUrl: string;
  tag: string;
  tagVi: string;
  tagEn: string;
  text: string;
  textVi: string;
  textEn: string;
  orderIndex: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  imageUrl: "",
  tag: "",
  tagVi: "",
  tagEn: "",
  text: "",
  textVi: "",
  textEn: "",
  orderIndex: 1,
  isActive: true,
};

function toForm(item: MarqueeSlide): FormState {
  return {
    imageUrl: item.imageUrl,
    tag: item.tag || "",
    tagVi: item.tag_i18n?.vi || "",
    tagEn: item.tag_i18n?.en || "",
    text: item.text || "",
    textVi: item.text_i18n?.vi || "",
    textEn: item.text_i18n?.en || "",
    orderIndex: item.orderIndex,
    isActive: item.isActive,
  };
}

function buildPayload(form: FormState) {
  return {
    imageUrl: form.imageUrl.trim(),
    tag: form.tag.trim() || form.tagVi.trim() || form.tagEn.trim(),
    tag_i18n: {
      vi: form.tagVi.trim(),
      en: form.tagEn.trim(),
    },
    text: form.text.trim() || form.textVi.trim() || form.textEn.trim(),
    text_i18n: {
      vi: form.textVi.trim(),
      en: form.textEn.trim(),
    },
    orderIndex: Number(form.orderIndex) || 0,
    isActive: form.isActive,
  };
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
      }`}
    >
      {active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {active ? "Hiển thị" : "Ẩn"}
    </span>
  );
}

export default function MarqueeSlidesAdminPage() {
  const { data, isFetching, isError, refetch } = useGetMarqueeSlidesAdminQuery();
  const [createSlide, { isLoading: creating }] = useCreateMarqueeSlideMutation();
  const [updateSlide, { isLoading: updating }] = useUpdateMarqueeSlideMutation();
  const [deleteSlide, { isLoading: deleting }] = useDeleteMarqueeSlideMutation();
  const [uploadSingle, { isLoading: uploading }] = useUploadSingleMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MarqueeSlide | null>(null);
  const [editing, setEditing] = useState<MarqueeSlide | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo(() => {
    const list = (data?.items ?? []).slice();
    list.sort((a, b) => {
      if (a.orderIndex === b.orderIndex) return a.createdAt.localeCompare(b.createdAt);
      return a.orderIndex - b.orderIndex;
    });
    return list;
  }, [data?.items]);

  const saving = creating || updating;
  const deleteDialogOpen = pendingDelete !== null;

  const resetForm = (orderIndex?: number) => {
    setForm({
      ...emptyForm,
      orderIndex: orderIndex ?? Math.max(items.length + 1, 1),
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = buildPayload(form);
    try {
      if (editing) {
        await updateSlide({ id: editing.id, body: payload }).unwrap();
        toast.success("Đã cập nhật slide.");
      } else {
        await createSlide(payload).unwrap();
        toast.success("Đã thêm slide.");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("SAVE_SLIDE_FAILED", err);
      toast.error("Không thể lưu, vui lòng thử lại.");
    }
  };

  const handleEdit = (item: MarqueeSlide) => {
    setEditing(item);
    setForm(toForm(item));
    setDialogOpen(true);
  };

  const handleToggle = async (item: MarqueeSlide) => {
    try {
      await updateSlide({ id: item.id, body: { isActive: !item.isActive } }).unwrap();
    } catch (err) {
      console.error("TOGGLE_SLIDE_FAILED", err);
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSlide(pendingDelete.id).unwrap();
      toast.success("Đã xoá.");
    } catch (err) {
      console.error("DELETE_SLIDE_FAILED", err);
      toast.error("Xoá thất bại.");
    } finally {
      setPendingDelete(null);
    }
  };

  const formatDate = (input: string) => {
    if (!input) return "-";
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return input;
    return d.toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-xl font-semibold">Marquee Slides</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quản lý slide hiển thị trong phần marquee (carousel ngang).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Dialog.Root
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <Dialog.Trigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm slide
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Dialog.Title className="text-lg font-semibold">
                          {editing ? "Chỉnh sửa slide" : "Thêm slide"}
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-muted-foreground">
                          Điền nội dung, alt và thứ tự hiển thị.
                        </Dialog.Description>
                      </div>
                      <Dialog.Close asChild>
                        <Button variant="ghost" size="icon">
                          x
                        </Button>
                      </Dialog.Close>
                    </div>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Ảnh (URL)</Label>
                        <Input
                          id="imageUrl"
                          value={form.imageUrl}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, imageUrl: e.target.value }))
                          }
                          required
                          placeholder="https://res.cloudinary.com/..."
                        />
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const res = await uploadSingle({
                                  file,
                                  folder: "marquee-slides",
                                }).unwrap();
                                const url = (res as any)?.secure_url || (res as any)?.url;
                                if (url) {
                                  setForm((f) => ({ ...f, imageUrl: url }));
                                  toast.success("Đã upload ảnh.");
                                } else {
                                  toast.error("Không nhận được URL ảnh.");
                                }
                              } catch (err) {
                                console.error("UPLOAD_FAILED", err);
                                toast.error("Upload ảnh thất bại.");
                              } finally {
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                          >
                            {uploading ? "Đang upload..." : "Chọn file & upload"}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderIndex">Thứ tự</Label>
                        <Input
                          id="orderIndex"
                          type="number"
                          min={0}
                          value={form.orderIndex}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              orderIndex: Number(e.target.value),
                            }))
                          }
                        />
                        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                          <div>
                            <p className="text-sm font-semibold">Hiển thị</p>
                            <p className="text-xs text-muted-foreground">
                              Bật/tắt slide trên giao diện.
                            </p>
                          </div>
                          <Switch
                            checked={form.isActive}
                            onCheckedChange={(checked) =>
                              setForm((f) => ({ ...f, isActive: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tag">Tag mặc định</Label>
                        <Input
                          id="tag"
                          value={form.tag}
                          onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                          placeholder="Warm up / Signature..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tagVi">Tag (VI)</Label>
                        <Input
                          id="tagVi"
                          value={form.tagVi}
                          onChange={(e) => setForm((f) => ({ ...f, tagVi: e.target.value }))}
                          placeholder="Thẻ tiếng Việt"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagEn">Tag (EN)</Label>
                      <Input
                        id="tagEn"
                        value={form.tagEn}
                        onChange={(e) => setForm((f) => ({ ...f, tagEn: e.target.value }))}
                        placeholder="Tag in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="text">Nội dung mặc định</Label>
                      <Input
                        id="text"
                        value={form.text}
                        onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                        placeholder="Mô tả ngắn"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="textVi">Nội dung (VI)</Label>
                        <Input
                          id="textVi"
                          value={form.textVi}
                          onChange={(e) => setForm((f) => ({ ...f, textVi: e.target.value }))}
                          placeholder="Mô tả tiếng Việt"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="textEn">Nội dung (EN)</Label>
                        <Input
                          id="textEn"
                          value={form.textEn}
                          onChange={(e) => setForm((f) => ({ ...f, textEn: e.target.value }))}
                          placeholder="Description in English"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Dialog.Close asChild>
                        <Button type="button" variant="ghost" disabled={saving}>
                          Huỷ
                        </Button>
                      </Dialog.Close>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editing ? "Lưu thay đổi" : "Tạo mới"}
                      </Button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-neutral-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Thứ tự</TableHead>
                  <TableHead className="w-[140px]">Ảnh</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm">
                      {isError ? "Tải dữ liệu thất bại." : "Chưa có slide nào."}
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">#{item.orderIndex}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border bg-white">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.tag || "Marquee slide"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <p className="text-sm font-semibold text-neutral-900">
                        {item.tag || "Chưa có tag"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        VI: {item.tag_i18n?.vi || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        EN: {item.tag_i18n?.en || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="align-middle">
                      <p className="text-sm text-neutral-900">{item.text || "-"}</p>
                      <p className="text-xs text-muted-foreground">VI: {item.text_i18n?.vi || "-"}</p>
                      <p className="text-xs text-muted-foreground">EN: {item.text_i18n?.en || "-"}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={item.isActive} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(item.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(item)}
                          disabled={updating}
                        >
                          {item.isActive ? "Ẩn" : "Hiển thị"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setPendingDelete(item)}
                          disabled={deleting}
                        >
                          <Trash className="mr-1 h-4 w-4" />
                          Xoá
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(v) => {
          if (!v) setPendingDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
        loading={deleting}
        title="Xoá slide này?"
        description={
          pendingDelete
            ? `Bạn chắc chắn xoá slide "${pendingDelete.tag || pendingDelete.imageUrl}"?`
            : undefined
        }
      />
    </div>
  );
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
          <div className="space-y-3">
            <Dialog.Title className="text-lg font-semibold text-neutral-900">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            ) : null}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Huỷ
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Đang xoá..." : "Xoá"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
