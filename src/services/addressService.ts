import { apiFetch } from "@/lib/apiClient";
import type { Address } from "@/data/types";

export type AddressInput = Omit<Address, "id">;

export const addressService = {
  list() {
    return apiFetch<{ addresses: Address[] }>("/addresses").then((r) => r.addresses);
  },
  create(input: AddressInput) {
    return apiFetch<Address>("/addresses", { method: "POST", body: input });
  },
  update(id: string, input: Partial<AddressInput>) {
    return apiFetch<Address>(`/addresses/${id}`, { method: "PUT", body: input });
  },
  remove(id: string) {
    return apiFetch<void>(`/addresses/${id}`, { method: "DELETE" });
  },
};
