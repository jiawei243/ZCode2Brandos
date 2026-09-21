import { useWBrandStoreWithDefault } from "@/store/StoreProvider.js";

export function useIsOfficeMode(): boolean {
  return useWBrandStoreWithDefault((state) => state.interfaceMode === "office", false);
}
