export function formatDateTime(value) {
  if (!value) return 'Unknown time';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function relativeTime(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60, name: 'second' },
    { amount: 60, name: 'minute' },
    { amount: 24, name: 'hour' },
    { amount: 7, name: 'day' },
    { amount: 4.34524, name: 'week' },
    { amount: 12, name: 'month' },
    { amount: Number.POSITIVE_INFINITY, name: 'year' }
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  let duration = seconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return 'recently';
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function parseTags(value) {
  return [...new Set(value
    .split(',')
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean))];
}


export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = Number(bytes);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}
