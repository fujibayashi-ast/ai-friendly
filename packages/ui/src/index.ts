/**
 * 共通 UI（shadcn/ui + Tailwind v4）
 * アプリの CSS で `@import "@ai-friendly/ui/theme.css"` と `@source` を書いて使う
 * @see docs/ui.md
 */
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";
export { Button, buttonVariants } from "./components/ui/button";
export { Toggle, toggleVariants } from "./components/ui/toggle";
export { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
export { cn } from "./lib/utils";
