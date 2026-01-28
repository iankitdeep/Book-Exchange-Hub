import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";

export function useTheme() {
  const colorScheme = "light"; // Force light mode as per user request
  const isDark = false;
  const theme = Colors["light"];

  return {
    theme,
    isDark,
  };
}
