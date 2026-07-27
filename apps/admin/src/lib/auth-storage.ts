const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

const isClient = typeof window !== "undefined";

function getCookie(name: string): string | null {
  if (!isClient) return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 30) {
  if (!isClient) return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (!isClient) return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const authStorage = {
  getAccessToken() {
    return getCookie(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return getCookie(REFRESH_TOKEN_KEY);
  },

  setAccessToken(token: string) {
    setCookie(ACCESS_TOKEN_KEY, token);
  },

  setRefreshToken(token: string) {
    setCookie(REFRESH_TOKEN_KEY, token);
  },

  clear() {
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
  },
};
