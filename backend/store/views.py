import base64
import json
import logging
import time

import requests
from decouple import config
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, Address, Store, Category, Product, ProductImage,
    Review, Cart, CartItem, Wishlist, Order, OrderItem,
    MpesaTransaction, Coupon, Banner, FlashSale
)
from .serializers import (
    RegisterSerializer, UserSerializer, AddressSerializer,
    StoreSerializer, CategorySerializer,
    ProductListSerializer, ProductDetailSerializer, ReviewSerializer,
    CartSerializer, CartItemSerializer, WishlistSerializer,
    OrderSerializer, CreateOrderSerializer,
    MpesaTransactionSerializer, STKPushSerializer,
    CouponSerializer, CouponValidateSerializer,
    BannerSerializer, FlashSaleSerializer
)

logger = logging.getLogger(__name__)


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class AuthViewSet(viewsets.GenericViewSet):

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        from django.contrib.auth import authenticate
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if not user:
            # Try email login
            try:
                u = User.objects.get(email=username)
                user = authenticate(request, username=u.username, password=password)
            except User.DoesNotExist:
                pass
        if not user:
            return Response({'error': 'Invalid credentials'}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old = request.data.get('old_password')
        new = request.data.get('new_password')
        if not user.check_password(old):
            return Response({'error': 'Old password incorrect'}, status=400)
        user.set_password(new)
        user.save()
        return Response({'message': 'Password changed successfully'})


# ─── ADDRESS ──────────────────────────────────────────────────────────────────

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If new address is default, unset others
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save()


# ─── STORE ────────────────────────────────────────────────────────────────────

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        name = serializer.validated_data['name']
        slug = slugify(name)
        # ensure unique slug
        base = slug
        i = 1
        while Store.objects.filter(slug=slug).exists():
            slug = f"{base}-{i}"
            i += 1
        serializer.save(vendor=self.request.user, slug=slug)

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        store = self.get_object()
        qs = store.products.filter(status='active')
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


# ─── CATEGORY ─────────────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # Only top-level by default; children nested in serializer
        return Category.objects.filter(is_active=True, parent=None)

    @action(detail=False, methods=['get'], url_path='all')
    def all_flat(self, request):
        qs = Category.objects.filter(is_active=True)
        return Response(CategorySerializer(qs, many=True).data)


# ─── PRODUCT ──────────────────────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(status='active').select_related('store', 'category').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'store', 'is_featured']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['price', 'rating', 'created_at', 'review_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'featured', 'by_category']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_lookup_field(self):
        return 'slug'

    lookup_field = 'slug'

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)[:20]
        return Response(ProductListSerializer(qs, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'], url_path='category/(?P<slug>[^/.]+)')
    def by_category(self, request, slug=None):
        try:
            cat = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)
        # Include sub-categories
        cat_ids = [cat.id] + list(cat.children.values_list('id', flat=True))
        qs = self.get_queryset().filter(category__in=cat_ids)
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(
                ProductListSerializer(page, many=True, context={'request': request}).data
            )
        return Response(ProductListSerializer(qs, many=True, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        product = self.get_object()
        reviews = product.reviews.select_related('user').order_by('-created_at')
        return Response(ReviewSerializer(reviews, many=True, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, slug=None):
        product = self.get_object()
        data = {**request.data, 'product': product.id}
        serializer = ReviewSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        review = serializer.save(user=request.user)
        # Update product rating
        reviews = product.reviews.all()
        product.rating = sum(r.rating for r in reviews) / reviews.count()
        product.review_count = reviews.count()
        product.save(update_fields=['rating', 'review_count'])
        return Response(ReviewSerializer(review, context={'request': request}).data, status=201)


# ─── CART ─────────────────────────────────────────────────────────────────────

class CartViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_or_create_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart = self.get_or_create_cart(request)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        cart = self.get_or_create_cart(request)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data['product']
        variant = serializer.validated_data.get('variant')
        quantity = serializer.validated_data.get('quantity', 1)

        if product.stock < quantity:
            return Response({'error': 'Insufficient stock'}, status=400)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, variant=variant,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['patch'], url_path='update/(?P<item_id>[0-9]+)')
    def update_item(self, request, item_id=None):
        cart = self.get_or_create_cart(request)
        try:
            item = cart.items.get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)
        qty = int(request.data.get('quantity', 1))
        if qty <= 0:
            item.delete()
        else:
            item.quantity = qty
            item.save()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['delete'], url_path='remove/(?P<item_id>[0-9]+)')
    def remove_item(self, request, item_id=None):
        cart = self.get_or_create_cart(request)
        cart.items.filter(pk=item_id).delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear(self, request):
        cart = self.get_or_create_cart(request)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)


# ─── WISHLIST ─────────────────────────────────────────────────────────────────

class WishlistViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_wishlist(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('product')
        return Response(WishlistSerializer(items, many=True, context={'request': request}).data)

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.delete()
            return Response({'wishlisted': False})
        return Response({'wishlisted': True})


# ─── ORDER ────────────────────────────────────────────────────────────────────

class OrderViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)

    @action(detail=True, methods=['get'])
    def detail_order(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['post'], url_path='create')
    def create_order(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            address = Address.objects.get(pk=data['shipping_address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=404)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=400)

        cart_items = cart.items.select_related('product', 'variant').all()
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        # Validate coupon if provided
        coupon = None
        discount = 0
        if data.get('coupon_code'):
            try:
                coupon = Coupon.objects.get(code=data['coupon_code'])
                if not coupon.is_valid():
                    return Response({'error': 'Coupon is invalid or expired'}, status=400)
            except Coupon.DoesNotExist:
                return Response({'error': 'Coupon not found'}, status=404)

        with transaction.atomic():
            subtotal = sum(item.subtotal for item in cart_items)

            if coupon:
                if subtotal < coupon.min_order_amount:
                    return Response({'error': f'Minimum order of KES {coupon.min_order_amount} required'}, status=400)
                if coupon.discount_type == 'percentage':
                    discount = subtotal * (coupon.discount_value / 100)
                else:
                    discount = coupon.discount_value
                coupon.used_count += 1
                coupon.save()

            shipping_fee = 200  # flat rate, can be calculated per zone
            total = subtotal - discount + shipping_fee

            order = Order.objects.create(
                user=request.user,
                shipping_address=address,
                payment_method=data['payment_method'],
                notes=data.get('notes', ''),
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                total=total,
            )

            for item in cart_items:
                img = item.product.images.filter(is_primary=True).first() or item.product.images.first()
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    variant=item.variant,
                    store=item.product.store,
                    product_name=item.product.name,
                    product_image=img.image.url if img else '',
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    subtotal=item.subtotal,
                )
                # Deduct stock
                item.product.stock -= item.quantity
                item.product.save(update_fields=['stock'])

            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=201)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        if order.status not in ['pending', 'confirmed']:
            return Response({'error': 'Order cannot be cancelled at this stage'}, status=400)
        order.status = 'cancelled'
        order.save()
        return Response(OrderSerializer(order).data)


# ─── M-PESA ───────────────────────────────────────────────────────────────────

_token_cache = {'token': None, 'expires_at': 0}


class MpesaService:
    """Safaricom Daraja API Integration"""

    CONSUMER_KEY = config('MPESA_CONSUMER_KEY', default='')
    CONSUMER_SECRET = config('MPESA_CONSUMER_SECRET', default='')
    SHORTCODE = config('MPESA_SHORTCODE', default='174379')
    PASSKEY = config('MPESA_PASSKEY', default='')
    CALLBACK_URL = config('MPESA_CALLBACK_URL', default='https://yourdomain.com/api/mpesa/callback/')
    ENVIRONMENT = config('MPESA_ENVIRONMENT', default='sandbox')

    @property
    def base_url(self):
        return 'https://api.safaricom.co.ke' if self.ENVIRONMENT == 'production' else 'https://sandbox.safaricom.co.ke'

    def get_access_token(self):
        if _token_cache['token'] and time.time() < _token_cache['expires_at'] - 60:
            return _token_cache['token']
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        credentials = base64.b64encode(f"{self.CONSUMER_KEY}:{self.CONSUMER_SECRET}".encode()).decode()
        resp = requests.get(url, headers={'Authorization': f'Basic {credentials}'}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        _token_cache['token'] = data['access_token']
        _token_cache['expires_at'] = time.time() + int(data.get('expires_in', 3599))
        return _token_cache['token']

    def get_password(self, timestamp):
        raw = f"{self.SHORTCODE}{self.PASSKEY}{timestamp}"
        return base64.b64encode(raw.encode()).decode()

    def stk_push(self, phone: str, amount: int, order_ref: str, description: str):
        token = self.get_access_token()
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        password = self.get_password(timestamp)
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        payload = {
            "BusinessShortCode": self.SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": self.SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": self.CALLBACK_URL,
            "AccountReference": order_ref,
            "TransactionDesc": description
        }
        try:
            resp = requests.post(url, json=payload, headers={'Authorization': f'Bearer {token}'}, timeout=30)
            logger.debug(f"[MPESA] STK response: {resp.status_code} {resp.text}")
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"[MPESA] STK Push error: {e.response.text if e.response else e}")
            raise

    def query_stk_status(self, checkout_request_id: str):
        token = self.get_access_token()
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        payload = {
            "BusinessShortCode": self.SHORTCODE,
            "Password": self.get_password(timestamp),
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        resp = requests.post(url, json=payload, headers={'Authorization': f'Bearer {token}'}, timeout=30)
        resp.raise_for_status()
        return resp.json()


mpesa_service = MpesaService()


class MpesaViewSet(viewsets.GenericViewSet):

    @action(detail=False, methods=['post'], url_path='stk-push', permission_classes=[IsAuthenticated])
    def stk_push(self, request):
        serializer = STKPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Normalize phone to 2547XXXXXXXX
        phone = str(data['phone_number']).strip()
        if phone.startswith('+'):
            phone = phone[1:]
        elif phone.startswith('0'):
            phone = '254' + phone[1:]

        amount = max(1, int(data['amount']))

        try:
            order = Order.objects.get(pk=data['order_id'], user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        if order.payment_status == 'paid':
            return Response({'error': 'Order already paid'}, status=400)

        try:
            resp = mpesa_service.stk_push(
                phone=phone,
                amount=amount,
                order_ref=order.order_number,
                description=f"Mkurugenzi order {order.order_number}"
            )
        except Exception as e:
            logger.error(f"[MPESA] STK Push failed: {e}")
            return Response({'error': str(e)}, status=500)

        if resp.get('ResponseCode') == '0':
            txn, _ = MpesaTransaction.objects.update_or_create(
                order=order,
                defaults={
                    'checkout_request_id': resp['CheckoutRequestID'],
                    'merchant_request_id': resp.get('MerchantRequestID', ''),
                    'phone_number': phone,
                    'amount': amount,
                    'status': 'pending',
                    'result_code': '',
                    'result_description': '',
                }
            )
            return Response({
                'checkout_request_id': txn.checkout_request_id,
                'message': resp.get('CustomerMessage', 'STK push sent. Check your phone.'),
                'status': 'pending'
            })

        logger.error(f"[MPESA] STK failed: {resp}")
        return Response({'error': resp.get('errorMessage', 'STK push failed'), 'raw': resp}, status=400)

    @action(detail=False, methods=['get'], url_path='status/(?P<checkout_id>[^/.]+)',
            permission_classes=[IsAuthenticated])
    def check_status(self, request, checkout_id=None):
        try:
            txn = MpesaTransaction.objects.get(checkout_request_id=checkout_id)
        except MpesaTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=404)

        if txn.status in ['success', 'failed', 'cancelled', 'timeout']:
            return Response(MpesaTransactionSerializer(txn).data)

        try:
            resp = mpesa_service.query_stk_status(checkout_id)
            result_code = str(resp.get('ResultCode', ''))
            if result_code == '0':
                txn.status = 'success'
                txn.result_code = result_code
                txn.save()
                if txn.order:
                    txn.order.payment_status = 'paid'
                    txn.order.status = 'confirmed'
                    txn.order.save()
            elif result_code in ['1032', '1037']:
                txn.status = 'cancelled'
                txn.result_description = resp.get('ResultDesc', '')
                txn.save()
            elif result_code:
                txn.status = 'failed'
                txn.result_description = resp.get('ResultDesc', '')
                txn.save()
        except Exception as e:
            logger.warning(f"[MPESA] Status check error: {e}")

        return Response(MpesaTransactionSerializer(txn).data)

    @action(detail=False, methods=['post'], url_path='callback', permission_classes=[AllowAny])
    def callback(self, request):
        data = request.data
        logger.debug(f"[MPESA] Callback received: {json.dumps(data)}")
        body = data.get('Body', {}).get('stkCallback', {})
        checkout_id = body.get('CheckoutRequestID')
        result_code = str(body.get('ResultCode', ''))
        result_desc = body.get('ResultDesc', '')

        try:
            txn = MpesaTransaction.objects.get(checkout_request_id=checkout_id)
        except MpesaTransaction.DoesNotExist:
            logger.error(f"[MPESA] Transaction not found: {checkout_id}")
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        if result_code == '0':
            meta_items = body.get('CallbackMetadata', {}).get('Item', [])
            meta = {item['Name']: item.get('Value') for item in meta_items}
            txn.status = 'success'
            txn.mpesa_receipt_number = meta.get('MpesaReceiptNumber', '')
            txn.transaction_date = timezone.now()
            if txn.order:
                txn.order.payment_status = 'paid'
                txn.order.status = 'confirmed'
                txn.order.save()
        else:
            txn.status = 'cancelled' if result_code == '1032' else 'failed'

        txn.result_code = result_code
        txn.result_description = result_desc
        txn.save()

        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


# ─── COUPON ───────────────────────────────────────────────────────────────────

class CouponViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='validate')
    def validate_coupon(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            coupon = Coupon.objects.get(code=data['code'])
        except Coupon.DoesNotExist:
            return Response({'error': 'Coupon not found'}, status=404)

        if not coupon.is_valid():
            return Response({'error': 'Coupon is expired or inactive'}, status=400)

        if data['order_amount'] < coupon.min_order_amount:
            return Response({'error': f'Minimum order amount is KES {coupon.min_order_amount}'}, status=400)

        if coupon.discount_type == 'percentage':
            discount = data['order_amount'] * (coupon.discount_value / 100)
        else:
            discount = coupon.discount_value

        return Response({
            'valid': True,
            'discount_type': coupon.discount_type,
            'discount_value': coupon.discount_value,
            'discount_amount': discount,
            'new_total': data['order_amount'] - discount,
        })


# ─── BANNERS & FLASH SALES ────────────────────────────────────────────────────

class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Banner.objects.filter(is_active=True).order_by('order')
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]


class FlashSaleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FlashSale.objects.filter(is_active=True)
    serializer_class = FlashSaleSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        now = timezone.now()
        return FlashSale.objects.filter(is_active=True, start_time__lte=now, end_time__gte=now)


# ─── ADMIN ────────────────────────────────────────────────────────────────────

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['order_number', 'user__username', 'user__email']
    filterset_fields = ['status', 'payment_status']

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)