// The donors list URL with its filters, sort and page, remembered for this
// browser tab so a donor's page can link back to the same list.

const KEY = 'donors:listUrl';
const LIST_PATH = '/donors';

// Only the donors list itself, so a stored value can't send the user
// anywhere else.
const isListUrl = (url: string | null | undefined): url is string =>
  !!url && (url === LIST_PATH || url.startsWith(`${LIST_PATH}?`));

export function rememberDonorsListUrl(url: string | null | undefined) {
  if (!isListUrl(url)) {
    return;
  }
  try {
    window.sessionStorage.setItem(KEY, url);
  } catch {
    // Storage can be unavailable (private mode, blocked); the link then
    // falls back to the plain list.
  }
}

export function getDonorsListUrl(): string {
  try {
    const url = window.sessionStorage.getItem(KEY);
    return isListUrl(url) ? url : LIST_PATH;
  } catch {
    return LIST_PATH;
  }
}
