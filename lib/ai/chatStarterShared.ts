export type ChatStarterItem = {
  id: string;
  label: string;
  message: string;
};

export function starterButtonText(item: ChatStarterItem): string {
  const l = item.label?.trim();
  return l || item.message;
}
