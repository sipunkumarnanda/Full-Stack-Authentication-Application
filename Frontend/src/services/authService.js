import apiClient from "./api";

export const authService = {
  /**
   * Register a new user account (initiates OTP flow)
   * @param {{ username: string, email: string, password: string, firstName: string, lastName: string }} data
   */
  async register({ username, email, password, firstName, lastName }) {
    const response = await apiClient.post("/auth/register", {
      username,
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  },

  /**
   * Verify email registration OTP
   * @param {{ email: string, otp: string }} data
   */
  async verifyOtp({ email, otp }) {
    const response = await apiClient.post("/auth/verify-otp", {
      email,
      otp,
    });
    return response.data;
  },

  /**
   * Resend registration OTP
   * @param {{ email: string }} data
   */
  async resendOtp({ email }) {
    const response = await apiClient.post("/auth/resend-otp", {
      email,
    });
    return response.data;
  },

  /**
   * Login with email and password
   * Sets HTTP-only accessToken cookie on response
   * @param {{ email: string, password: string }} data
   */
  async login({ email, password }) {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logout user and clear HTTP-only session cookie
   */
  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  /**
   * Fetch currently authenticated user session via cookie
   */
  async getCurrentUser() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /**
   * Request a password-reset OTP to be sent via email
   * @param {{ email: string }} data
   */
  async forgotPassword({ email }) {
    const response = await apiClient.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with OTP and new password
   * Note: The backend expects 'password' field for the new password
   * @param {{ email: string, otp: string, password: string }} data
   */
  async resetPassword({ email, otp, password }) {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      otp,
      password,
    });
    return response.data;
  },

  /**
   * Fetch all saved addresses for the current user
   */
  async getUserAddresses() {
    const response = await apiClient.get("/auth/users/me/addresses");
    return response.data;
  },

  async updateUserProfile(data) {
    const response = await apiClient.put("/auth/users/me/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Add a new delivery address
   * @param {{ street: string, city: string, state: string, pincode: number, country: string, phone: number, isDefault?: boolean }} data
   */
  async addUserAddress(data) {
    const response = await apiClient.post("/auth/users/me/addresses", data);
    return response.data;
  },

  /**
   * Update an existing address by its MongoDB _id
   * @param {string} addressId
   * @param {{ street: string, city: string, state: string, pincode: number, country: string, phone: number, isDefault?: boolean }} data
   */
  async updateUserAddress(addressId, data) {
    const response = await apiClient.put(`/auth/users/me/addresses/${addressId}`, data);
    return response.data;
  },

  /**
   * Delete an existing address by its MongoDB _id
   * @param {string} addressId
   */
  async deleteUserAddress(addressId) {
    const response = await apiClient.delete(`/auth/users/me/addresses/${addressId}`);
    return response.data;
  },
};

export default authService;
