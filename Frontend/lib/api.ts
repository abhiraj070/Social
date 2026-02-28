/**
 * Centralized Axios API service.
 *
 * Every backend call goes through this module so that:
 *  - base URL, credentials and interceptors are configured once
 *  - token refresh (401 retry) is handled transparently
 *  - consumers get typed helpers instead of raw axios calls
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

// ── Axios instance ─────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  withCredentials: true, // send httpOnly cookies on every request
  headers: { "Content-Type": "application/json" },
});

// ── Refresh-token interceptor ──────────────────────────────────
let isRefreshing = false;
let failedQueue: {
  resolve: (v?: unknown) => void;
  reject: (e?: unknown) => void;
}[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 that isn't itself the refresh or login call
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/users/refresh-token") &&
      !original.url?.includes("/users/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${api.defaults.baseURL}/users/refresh-token`,
          {},
          { withCredentials: true },
        );
        processQueue(null);
        return api(original); // retry original request
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Redirect to login if refresh fails — but only when NOT already
        // on an auth page, otherwise we cause an infinite reload loop.
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (!path.startsWith("/login") && !path.startsWith("/signup")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Helpers ────────────────────────────────────────────────────
/** Unwrap the standard `{ statusCode, data, message }` envelope */
function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

// ══════════════════════════════════════════════════════════════
//  AUTH / USER
// ══════════════════════════════════════════════════════════════

export const authApi = {
  login(payload: { email?: string; username?: string; password: string }) {
    return api.post("/users/login", payload).then(unwrap);
  },

  register(formData: FormData) {
    return api
      .post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },

  logout() {
    return api.post("/users/logout");
  },

  refreshToken() {
    return api.post("/users/refresh-token").then(unwrap);
  },

  getCurrentUser() {
    return api.get("/users/current-user").then(unwrap);
  },

  getProfile(username: string) {
    return api.get(`/users/Profile/${username}`).then(unwrap);
  },

  updateAccount(payload: { fullName?: string; email?: string }) {
    return api.patch("/users/update-account", payload).then(unwrap);
  },

  changePassword(payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return api.patch("/users/change-password", payload).then(unwrap);
  },

  updateAvatar(file: File) {
    const fd = new FormData();
    fd.append("Avatar", file);
    return api
      .patch("/users/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },

  updateCoverImage(file: File) {
    const fd = new FormData();
    fd.append("coverImage", file);
    return api
      .patch("/users/coverImage", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },
};

// ══════════════════════════════════════════════════════════════
//  VIDEOS
// ══════════════════════════════════════════════════════════════

export const videoApi = {
  /** Publish a new video (multipart) */
  publish(formData: FormData) {
    return api
      .post("/video/publish-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },

  getById(videoId: string) {
    return api.get(`/video/video/${videoId}`).then(unwrap);
  },

  update(videoId: string, payload: Record<string, unknown>) {
    return api.patch(`/video/video/${videoId}`, payload).then(unwrap);
  },

  delete(videoId: string) {
    return api.delete(`/video/video/${videoId}`).then(unwrap);
  },

  togglePublish(videoId: string) {
    return api.patch(`/video/publish/${videoId}`).then(unwrap);
  },
};

// ══════════════════════════════════════════════════════════════
//  COMMENTS
// ══════════════════════════════════════════════════════════════

export const commentApi = {
  getAll(videoId: string) {
    return api.get(`/comment/${videoId}/comment`).then(unwrap);
  },

  add(videoId: string, content: string) {
    return api.post(`/comment/${videoId}/comment`, { content }).then(unwrap);
  },

  update(commentId: string, content: string) {
    return api
      .post(`/comment/${commentId}/comment`, { content })
      .then(unwrap);
  },

  delete(commentId: string) {
    return api.delete(`/comment/${commentId}/comment`).then(unwrap);
  },
};

// ══════════════════════════════════════════════════════════════
//  LIKES
// ══════════════════════════════════════════════════════════════

export const likeApi = {
  toggleVideoLike(videoId: string) {
    return api.post(`/likes/toggle/v/${videoId}`).then(unwrap);
  },

  toggleCommentLike(commentId: string) {
    return api.post(`/likes/toggle/c/${commentId}`).then(unwrap);
  },

  toggleTweetLike(tweetId: string) {
    return api.post(`/likes/toggle/t/${tweetId}`).then(unwrap);
  },

  getLikedVideos() {
    return api.get("/likes/videos").then(unwrap);
  },
};

// ══════════════════════════════════════════════════════════════
//  PLAYLISTS
// ══════════════════════════════════════════════════════════════

export const playlistApi = {
  create(videoId: string, payload: { name: string; description: string }) {
    return api
      .post(`/playlist/playlist/c/${videoId}`, payload)
      .then(unwrap);
  },

  getById(playlistId: string) {
    return api.get(`/playlist/playlist/g/${playlistId}`).then(unwrap);
  },

  getUserPlaylists(userId: string) {
    // NOTE: same Express pattern as getById — depends on backend route order
    return api.get(`/playlist/playlist/g/${userId}`).then(unwrap);
  },

  addVideo(playlistId: string, videoId: string) {
    return api
      .patch(`/playlist/playlist/a/${playlistId}/video/${videoId}`)
      .then(unwrap);
  },

  removeVideo(playlistId: string, videoId: string) {
    return api
      .delete(`/playlist/playlist/d/${playlistId}/video/${videoId}`)
      .then(unwrap);
  },

  update(
    playlistId: string,
    payload: { name: string; description: string },
  ) {
    return api
      .patch(`/playlist/playlist/u/${playlistId}`, payload)
      .then(unwrap);
  },

  delete(playlistId: string) {
    return api.delete(`/playlist/playlist/d/${playlistId}`).then(unwrap);
  },
};

// ══════════════════════════════════════════════════════════════
//  TWEETS
// ══════════════════════════════════════════════════════════════

export const tweetApi = {
  create(content: string) {
    return api.post("/tweet/create-tweet", { content }).then(unwrap);
  },

  getUserTweets(userId: string) {
    return api.get(`/tweet/${userId}/tweets`).then(unwrap);
  },

  update(tweetId: string, content: string) {
    // backend destructures `constent` (typo) — send both to be safe
    return api
      .patch(`/tweet/${tweetId}`, { content, constent: content })
      .then(unwrap);
  },

  delete(tweetId: string) {
    return api.delete(`/tweet/${tweetId}`).then(unwrap);
  },
};

// ══════════════════════════════════════════════════════════════
//  SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════════

export const subscriptionApi = {
  toggle(channelId: string) {
    return api.post(`/subscription/toggle/${channelId}`).then(unwrap);
  },

  getSubscribers(channelId: string) {
    return api
      .get(`/subscription/Channel/${channelId}`)
      .then(unwrap);
  },

  getSubscribedChannels(subscriberId: string) {
    return api
      .get(`/subscription/channel/${subscriberId}`)
      .then(unwrap);
  },
};

export default api;
