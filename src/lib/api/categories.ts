import { apiGet } from "@/lib/api/client";
import type { CategoryDto } from "@/lib/api/content-types";

/** Public reading surface — no auth, the fixed backend-defined category list. */
export const categoriesApi = {
  list: () => apiGet<{ categories: CategoryDto[] }>("/categories"),
};
