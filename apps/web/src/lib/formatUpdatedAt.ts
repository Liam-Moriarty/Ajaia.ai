export function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0)
    return `Updated ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  if (days === 1) return 'Updated yesterday';
  if (days < 7) return `Updated ${days} days ago`;
  return `Updated ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}
