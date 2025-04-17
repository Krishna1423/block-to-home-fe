
import { useMediaQuery as useMediaQueryBase } from "@mantine/hooks";

export function useMediaQuery(query: string): boolean {
  return useMediaQueryBase(query);
}
