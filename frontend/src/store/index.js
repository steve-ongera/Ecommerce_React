import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, cartAPI, wishlistAPI } from '../services/api.js'

// ─── AUTH STORE ──────────────────────────────────────────────────────────────

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const res = await authAPI.login(credentials)
          const { access, refresh, user } = res.data
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          set({ user, isAuthenticated: true, loading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.detail
            || err.response?.data?.non_field_errors?.[0]
            || 'Login failed. Please check your credentials.'
          set({ error: msg, loading: false })
          return { success: false, error: msg }
        }
      },

      register: async (data) => {
        set({ loading: true, error: null })
        try {
          const res = await authAPI.register(data)
          const { access, refresh, user } = res.data
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          set({ user, isAuthenticated: true, loading: false })
          return { success: true }
        } catch (err) {
          const errors = err.response?.data || {}
          const msg = Object.values(errors).flat().join(' ') || 'Registration failed.'
          set({ error: msg, loading: false })
          return { success: false, error: msg, fieldErrors: err.response?.data }
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false, error: null })
      },

      fetchMe: async () => {
        try {
          const res = await authAPI.me()
          set({ user: res.data, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },

      updateProfile: async (data) => {
        set({ loading: true, error: null })
        try {
          const res = await authAPI.updateProfile(data)
          set({ user: res.data, loading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data
            ? Object.values(err.response.data).flat().join(' ')
            : 'Update failed.'
          set({ error: msg, loading: false })
          return { success: false, error: msg }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'mkz-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ─── CART STORE ──────────────────────────────────────────────────────────────

export const useCartStore = create((set, get) => ({
  cart: null,           // { id, items: [], total, item_count }
  loading: false,
  error: null,

  fetchCart: async () => {
    const isAuth = useAuthStore.getState().isAuthenticated
    if (!isAuth) { set({ cart: null }); return }
    set({ loading: true })
    try {
      const res = await cartAPI.get()
      set({ cart: res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addToCart: async (productId, quantity = 1, variantId = null) => {
    try {
      await cartAPI.add({ product_id: productId, quantity, variant_id: variantId })
      await get().fetchCart()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Could not add to cart.'
      return { success: false, error: msg }
    }
  },

  updateItem: async (itemId, quantity) => {
    if (quantity <= 0) return get().removeItem(itemId)
    try {
      await cartAPI.update({ item_id: itemId, quantity })
      await get().fetchCart()
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Update failed.' }
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartAPI.remove({ item_id: itemId })
      await get().fetchCart()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Remove failed.' }
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clear()
      set({ cart: null })
    } catch { /* silent */ }
  },

  // Optimistic helpers
  get itemCount() { return get().cart?.item_count ?? 0 },
  get total()     { return get().cart?.total ?? '0.00' },
}))

// ─── WISHLIST STORE ──────────────────────────────────────────────────────────

export const useWishlistStore = create((set, get) => ({
  wishlist: [],       // array of wishlist objects { id, product, added_at }
  wishlistIds: new Set(),
  loading: false,

  fetchWishlist: async () => {
    const isAuth = useAuthStore.getState().isAuthenticated
    if (!isAuth) { set({ wishlist: [], wishlistIds: new Set() }); return }
    set({ loading: true })
    try {
      const res = await wishlistAPI.get()
      const items = res.data?.results ?? res.data ?? []
      set({
        wishlist: items,
        wishlistIds: new Set(items.map((w) => w.product?.id ?? w.product)),
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  toggleWishlist: async (productId) => {
    const isAuth = useAuthStore.getState().isAuthenticated
    if (!isAuth) return { success: false, needsAuth: true }

    // Optimistic update
    const ids = new Set(get().wishlistIds)
    const wasWishlisted = ids.has(productId)
    if (wasWishlisted) ids.delete(productId)
    else ids.add(productId)
    set({ wishlistIds: ids })

    try {
      await wishlistAPI.toggle({ product_id: productId })
      await get().fetchWishlist()
      return { success: true, added: !wasWishlisted }
    } catch (err) {
      // Revert optimistic update
      const revert = new Set(get().wishlistIds)
      if (wasWishlisted) revert.add(productId)
      else revert.delete(productId)
      set({ wishlistIds: revert })
      return { success: false, error: 'Wishlist update failed.' }
    }
  },

  isWishlisted: (productId) => get().wishlistIds.has(productId),
}))

// ─── UI STORE (global UI state) ──────────────────────────────────────────────

export const useUIStore = create((set) => ({
  mobileDrawerOpen: false,
  openDrawer:  () => set({ mobileDrawerOpen: true }),
  closeDrawer: () => set({ mobileDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
}))