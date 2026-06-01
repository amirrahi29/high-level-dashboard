import { APP_LOCALE, EMPTY_VALUE } from '../constants/app.js';

function formatAppDate(iso) {
  if (!iso) return EMPTY_VALUE;
  return new Date(iso).toLocaleDateString(APP_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAppDateTime(iso) {
  if (!iso) return EMPTY_VALUE;
  try {
    return new Date(iso).toLocaleString(APP_LOCALE, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

function formatDate(iso) {
  return formatAppDate(iso);
}

function formatAppNumber(value, options) {
  if (value == null || Number.isNaN(Number(value))) return EMPTY_VALUE;
  return Number(value).toLocaleString(APP_LOCALE, options);
}

export { formatAppDate, formatAppDateTime, formatDate, formatAppNumber };
