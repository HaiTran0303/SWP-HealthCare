"use client";
import { useEffect, useState, Fragment } from "react";
import { CategoryService, Category } from "@/services/category.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function BlogCategoriesPage() {
  const { user } = useAuth();
  let roleName = "";
  if (
    user?.role &&
    typeof user.role === "object" &&
    typeof user.role.name === "string"
  ) {
    roleName = user.role.name.toLowerCase();
  }
  const canCreate = ["admin", "manager"].includes(roleName);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    parentId?: string;
  }>({
    name: "",
    description: "",
    type: "service",
    isActive: true,
    parentId: "",
  });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<Category & { parentId?: string }>
  >({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    CategoryService.getAllCategories()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data?.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const payload = { ...form };
      if (payload.parentId === "") {
        delete payload.parentId;
      }
      await CategoryService.createCategory(payload);
      setForm({
        name: "",
        description: "",
        type: "service",
        isActive: true,
        parentId: "",
      });
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "Đã có lỗi xảy ra");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      type: cat.type || "service",
      isActive: cat.isActive ?? true,
      parentId: cat.parent?.id || "",
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setEditForm((prev) => ({ ...prev, [name]: fieldValue }));
  };

  const handleEditSave = async (id: string) => {
    setCreating(true);
    setError("");
    try {
      const payload = { ...editForm };
      if (payload.parentId === "") {
        delete payload.parentId;
      }
      await CategoryService.updateCategory(id, payload);
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "Đã có lỗi xảy ra");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) return;
    setDeletingId(id);
    setError("");
    try {
      await CategoryService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "Đã có lỗi xảy ra");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Quản lý chủ đề Blog</h1>
      {canCreate && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 mb-8 p-4 border rounded"
        >
          <h2 className="font-semibold mb-2">Tạo chủ đề mới</h2>
          <div>
            <label className="font-medium">Tên chủ đề</label>
            <input
              className="w-full border rounded px-2 py-1 mt-1"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="font-medium">Mô tả</label>
            <textarea
              className="w-full border rounded px-2 py-1 mt-1"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="font-medium">Loại</label>
            <select
              className="w-full border rounded px-2 py-1 mt-1"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="service">Dịch vụ</option>
              <option value="nutrition">Dinh dưỡng</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <label htmlFor="isActive">Kích hoạt</label>
          </div>
          <div>
            <label className="font-medium">Chủ đề cha (nếu có)</label>
            <select
              className="w-full border rounded px-2 py-1 mt-1"
              name="parentId"
              value={form.parentId}
              onChange={handleChange}
            >
              <option value="">Không có</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo chủ đề"}
            </Button>
          </div>
        </form>
      )}
      <h2 className="font-semibold mb-2">Danh sách chủ đề</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : categories.length === 0 ? (
        <div>Không có chủ đề nào.</div>
      ) : (
        <ul className="list-disc pl-6">
          {categories.map((cat) => (
            <li key={cat.id} className="mb-1">
              {editingId === cat.id ? (
                <form
                  className="inline-flex flex-col gap-2 border rounded p-2 bg-gray-50"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditSave(cat.id);
                  }}
                >
                  <div>
                    <label className="font-medium">Tên chủ đề</label>
                    <input
                      className="border rounded px-2 py-1 mt-1 w-full"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">Mô tả</label>
                    <textarea
                      className="border rounded px-2 py-1 mt-1 w-full"
                      name="description"
                      value={editForm.description || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Loại</label>
                    <select
                      className="border rounded px-2 py-1 mt-1 w-full"
                      name="type"
                      value={editForm.type || "service"}
                      onChange={handleEditChange}
                    >
                      <option value="service">Dịch vụ</option>
                      <option value="nutrition">Dinh dưỡng</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={!!editForm.isActive}
                      onChange={handleEditChange}
                      id={`isActive-edit-${cat.id}`}
                    />
                    <label htmlFor={`isActive-edit-${cat.id}`}>Kích hoạt</label>
                  </div>
                  <div>
                    <label className="font-medium">Chủ đề cha (nếu có)</label>
                    <select
                      className="border rounded px-2 py-1 mt-1 w-full"
                      name="parentId"
                      value={editForm.parentId || ""}
                      onChange={handleEditChange}
                    >
                      <option value="">Không có</option>
                      {categories
                        .filter((c) => c.id !== cat.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" size="sm" disabled={creating}>
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <Fragment>
                  <span className="font-medium">{cat.name}</span> -{" "}
                  {cat.description} ({cat.type}){" "}
                  {cat.isActive ? "[Kích hoạt]" : "[Ẩn]"}
                  {canCreate && (
                    <span className="ml-2 inline-flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(cat)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                      >
                        {deletingId === cat.id ? "Đang xóa..." : "Xóa"}
                      </Button>
                    </span>
                  )}
                </Fragment>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
