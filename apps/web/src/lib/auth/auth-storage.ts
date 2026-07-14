import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isClient = typeof window !== "undefined";

export const authStorage = {
  getAccessToken() {
    if (!isClient) {
      return null;
    }

    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  },

  getRefreshToken() {
    if (!isClient) {
      return null;
    }

    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  },

  setAccessToken(token: string) {
    if (!isClient) {
      return;
    }

    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  setRefreshToken(token: string) {
    if (!isClient) {
      return;
    }

    Cookies.set(REFRESH_TOKEN_KEY, token, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  removeAccessToken() {
    if (!isClient) {
      return;
    }

    Cookies.remove(ACCESS_TOKEN_KEY);
  },

  removeRefreshToken() {
    if (!isClient) {
      return;
    }

    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  clear() {
    if (!isClient) {
      return;
    }

    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
};

