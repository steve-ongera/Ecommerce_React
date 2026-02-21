from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, AddressViewSet, StoreViewSet, CategoryViewSet,
    ProductViewSet, CartViewSet, WishlistViewSet, OrderViewSet,
    MpesaViewSet, CouponViewSet, BannerViewSet, FlashSaleViewSet,
    AdminOrderViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'addresses', AddressViewSet, basename='addresses')
router.register(r'stores', StoreViewSet, basename='stores')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'mpesa', MpesaViewSet, basename='mpesa')
router.register(r'coupons', CouponViewSet, basename='coupons')
router.register(r'banners', BannerViewSet, basename='banners')
router.register(r'flash-sales', FlashSaleViewSet, basename='flash-sales')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')

urlpatterns = [
    path('', include(router.urls)),
]