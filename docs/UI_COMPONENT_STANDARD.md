# UI Component Standard for Admin Pages

## Mục tiêu

Chuẩn hóa giao diện quản trị theo hướng **tái sử dụng shared UI components** để:

- Đồng nhất trải nghiệm UI/UX giữa các trang.
- Giảm duplicate code hardcode theo từng page.
- Dễ bảo trì, mở rộng và refactor về sau.

---

## Quy chuẩn bắt buộc (New Standard)

### 1) Với trang danh sách quản trị (list/table pages)

Bắt buộc ưu tiên dùng trực tiếp các shared components trong `src/components/ui/`:

- `Toolbar` (`src/components/ui/Toolbar.tsx`)
- `DataTable` (`src/components/ui/DataTable.tsx`)

Áp dụng cho các trang kiểu:

- users
- posts
- reports
- reviews
- chats
- transactions
- vouchers
- các trang list mới trong tương lai

> Không tạo component riêng theo page chỉ để wrap lại `Toolbar` / `DataTable` nếu không có business logic đặc thù.

---

### 2) Không dùng pattern “feature wrapper” cho UI chung

Các component như:

- `PostsToolbar`
- `PostsTable`
- `UsersTable`
- ... (các bản tương tự)

**Không nên tiếp tục tạo mới** nếu mục đích chỉ là render search/filter/table thông thường.

Thay vào đó:

- Khai báo `ToolbarFilter[]` trực tiếp tại page.
- Khai báo `Column<T>[]` trực tiếp tại page (hoặc shared columns config nếu tái sử dụng đa trang).
- Truyền className hooks vào `DataTable` để giữ layout riêng từng page.

---

### 3) Khi nào được phép tạo component feature riêng?

Chỉ tạo component riêng khi có ít nhất một trong các điều kiện sau:

1. Có business flow phức tạp, tái sử dụng tại nhiều nơi.
2. Có logic state/domain chuyên biệt không phù hợp đặt ở page.
3. UI pattern không phải dạng generic table/toolbar.
4. Có yêu cầu tách module rõ ràng do team architecture thống nhất.

Nếu chỉ khác text/filter options/cell render → vẫn dùng `Toolbar` + `DataTable`.

---

## Cách áp dụng chuẩn cho page mới

### A. Toolbar

- Dùng `Toolbar` trực tiếp.
- Truyền:
  - `searchQuery` + `onSearchChange` (controlled mode), hoặc
  - `onSearch` (debounced mode).
- Truyền `filters` dạng `ToolbarFilter[]`.

### B. DataTable

- Dùng `DataTable<T>` trực tiếp.
- Khai báo `columns: Column<T>[]` với `render` cho custom cell.
- Truyền:
  - `data`, `rowKey`
  - `loading`, `error`, `emptyMessage`
  - `pagination`, `currentPage`, `onPageChange` (nếu có)
- Dùng style hooks để giữ layout hiện có:
  - `className`
  - `tableClassName`
  - `headerClassName`
  - `bodyClassName`
  - `rowClassName`
  - `cellClassName`

---

## Migration Checklist (Refactor page cũ)

1. Xác định phần hardcode:
   - search/filter area
   - table header/body/pagination
2. Thay search/filter bằng `Toolbar`.
3. Thay table/pagination bằng `DataTable`.
4. Giữ nguyên behavior:
   - actions dropdown
   - loading/error/empty state
   - pagination/sort/filter/search logic
5. Giữ nguyên layout bằng class hooks.
6. Test regression tối thiểu:
   - thao tác filter/search
   - action buttons
   - pagination
   - empty/loading/error states
7. Chỉ xóa component cũ khi đã không còn import/use ở đâu.

---

## Ghi chú triển khai hiện tại

- `admin/users/page.tsx`: đã refactor sang `Toolbar` + `DataTable`.
- `admin/posts/page.tsx`: đã refactor sang `Toolbar` + `DataTable`.
- Chuẩn này có hiệu lực cho các lần làm mới UI sau này trong admin web.
