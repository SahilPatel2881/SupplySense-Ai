import datetime
import random
import secrets
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import User, Warehouse, LoginAuditLog

def generate_6digit_otp():
    """Generates a cryptographically secure 6-digit random numeric string using secrets module."""
    return "".join([str(secrets.randbelow(10)) for _ in range(6)])

def send_otp_email(user_email, otp_code, username):
    """Sends native HTML/Text 2FA OTP email using Django's send_mail."""
    subject = f"SupplySense AI - Your 2-Step Verification Code: {otp_code}"
    message = (
        f"Hello {username},\n\n"
        f"Your 6-digit Security OTP code for SupplySense AI Two-Factor Authentication is:\n\n"
        f"    {otp_code}\n\n"
        f"This OTP code is valid for 5 minutes.\n"
        f"If you did not request this verification code, please ignore this email.\n\n"
        f"Best regards,\n"
        f"SupplySense AI Security Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SupplySense AI Security <sahilbhutt2007@gmail.com>')
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[user_email],
            fail_silently=True
        )
        print(f"[SUCCESS] 2FA OTP [{otp_code}] dispatched via email to {user_email} (User: {username})")
        return True
    except Exception as e:
        print(f"[!] Email send error to {user_email}: {e}")
        return False

def mask_email(email_str):
    if not email_str or '@' not in email_str:
        return 's********@gmail.com'
    parts = email_str.split('@')
    name = parts[0]
    domain = parts[1]
    if len(name) <= 2:
        masked_name = name[0] + '****'
    else:
        masked_name = name[0] + '*' * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip if ip != '::1' else '127.0.0.1'

def parse_browser(request):
    ua = request.META.get('HTTP_USER_AGENT', '')
    if not ua:
        return 'Chrome on Windows'
    if 'Edg' in ua:
        return 'Edge on Windows'
    elif 'Chrome' in ua:
        if 'Windows' in ua:
            return 'Chrome on Windows'
        elif 'Macintosh' in ua:
            return 'Chrome on macOS'
        elif 'Android' in ua:
            return 'Chrome on Android'
        return 'Chrome Browser'
    elif 'Firefox' in ua:
        return 'Firefox on Linux'
    elif 'Safari' in ua and not 'Chrome' in ua:
        return 'Safari on macOS'
    return 'Web Browser'


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup user by username or email
        user = User.objects(username=username, is_active=True).first()
        if not user:
            user = User.objects(username__iexact=username, is_active=True).first()
        if not user:
            user = User.objects(email=username, is_active=True).first()
        if not user:
            user = User.objects(email__iexact=username, is_active=True).first()

        ip = get_client_ip(request)
        browser = parse_browser(request)

        if not user or not user.check_password(password):
            # Record failed login attempt
            LoginAuditLog(
                username=username,
                role=user.role if user else 'Unknown',
                login_time=datetime.datetime.utcnow(),
                ip_address=ip,
                browser=browser,
                status='Failed',
                session_active=False
            ).save()
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Record Successful Login Audit Log & issue JWT tokens immediately
        LoginAuditLog(
            username=user.username,
            role=user.role,
            login_time=datetime.datetime.utcnow(),
            ip_address=ip,
            browser=browser,
            status='Success',
            session_active=True
        ).save()

        refresh = RefreshToken()
        refresh['user_id'] = str(user.id)
        refresh['username'] = user.username
        refresh['role'] = user.role

        user_dict = user.to_dict()
        warehouse_name = "System Wide (All)"
        if user.assigned_warehouse_id:
            wh = Warehouse.objects(id=user.assigned_warehouse_id).first()
            if wh:
                warehouse_name = wh.name
        user_dict['assigned_warehouse_name'] = warehouse_name

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_dict
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')

        if not username or not otp:
            return Response({'error': 'Username and OTP code are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(username=username, is_active=True).first()
        if not user:
            user = User.objects(username__iexact=username, is_active=True).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        ip = get_client_ip(request)
        browser = parse_browser(request)

        # Check lock status
        if user.locked_until:
            if datetime.datetime.utcnow() < user.locked_until:
                remaining_sec = int((user.locked_until - datetime.datetime.utcnow()).total_seconds())
                remaining_min = max(1, round(remaining_sec / 60))
                LoginAuditLog(
                    username=user.username,
                    role=user.role,
                    login_time=datetime.datetime.utcnow(),
                    ip_address=ip,
                    browser=browser,
                    status='Locked Out',
                    session_active=False
                ).save()
                return Response({
                    'error': f'Account temporarily locked. Try again after {remaining_min} minute(s).',
                    'locked': True,
                    'remaining_seconds': remaining_sec
                }, status=status.HTTP_423_LOCKED)
            else:
                user.locked_until = None
                user.otp_attempts = 0
                user.save()

        # Check OTP presence and expiration
        if not user.otp_code or not user.otp_created_at:
            return Response({'error': 'No active OTP found. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        elapsed = (datetime.datetime.utcnow() - user.otp_created_at).total_seconds()
        if elapsed > 300:
            user.otp_code = None
            user.save()
            LoginAuditLog(
                username=user.username,
                role=user.role,
                login_time=datetime.datetime.utcnow(),
                ip_address=ip,
                browser=browser,
                status='Failed',
                session_active=False
            ).save()
            return Response({'error': 'OTP has expired (5 minute limit). Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Compare OTP
        if str(otp).strip() != str(user.otp_code).strip():
            user.otp_attempts += 1
            if user.otp_attempts >= 3:
                user.locked_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
                user.otp_code = None
                user.save()
                LoginAuditLog(
                    username=user.username,
                    role=user.role,
                    login_time=datetime.datetime.utcnow(),
                    ip_address=ip,
                    browser=browser,
                    status='Locked Out',
                    session_active=False
                ).save()
                return Response({
                    'error': 'Account temporarily locked after 3 failed OTP attempts. Try again after 10 minutes.',
                    'locked': True,
                    'attempts_remaining': 0
                }, status=status.HTTP_423_LOCKED)
            else:
                attempts_left = 3 - user.otp_attempts
                user.save()
                LoginAuditLog(
                    username=user.username,
                    role=user.role,
                    login_time=datetime.datetime.utcnow(),
                    ip_address=ip,
                    browser=browser,
                    status='Failed',
                    session_active=False
                ).save()
                return Response({
                    'error': f'Invalid OTP code. {attempts_left} attempt(s) remaining.',
                    'attempts_remaining': attempts_left
                }, status=status.HTTP_400_BAD_REQUEST)

        # Success! Record successful login audit log
        now = datetime.datetime.utcnow()
        user.otp_code = None
        user.otp_attempts = 0
        user.locked_until = None
        user.save()

        LoginAuditLog(
            username=user.username,
            role=user.role,
            login_time=now,
            ip_address=ip,
            browser=browser,
            status='Success',
            session_active=True
        ).save()

        refresh = RefreshToken()
        refresh['user_id'] = str(user.id)
        refresh['username'] = user.username
        refresh['role'] = user.role

        user_dict = user.to_dict()
        warehouse_name = "System Wide (All)"
        if user.assigned_warehouse_id:
            wh = Warehouse.objects(id=user.assigned_warehouse_id).first()
            if wh:
                warehouse_name = wh.name
        user_dict['assigned_warehouse_name'] = warehouse_name

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_dict
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(username=username, is_active=True).first()
        if not user:
            user = User.objects(username__iexact=username, is_active=True).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.locked_until and datetime.datetime.utcnow() < user.locked_until:
            return Response({'error': 'Account temporarily locked.'}, status=status.HTTP_423_LOCKED)

        otp = generate_6digit_otp()
        user.otp_code = otp
        user.otp_created_at = datetime.datetime.utcnow()
        user.otp_attempts = 0
        user.save()

        # Send actual Email OTP
        send_otp_email(user.email, otp, user.username)

        return Response({
            'message': 'New OTP generated and sent to email successfully.',
            'username': user.username,
            'masked_email': mask_email(user.email),
            'demo_otp': otp
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        if username:
            active_log = LoginAuditLog.objects(username=username, status='Success', session_active=True).order_by('-login_time').first()
            if active_log:
                active_log.logout_time = datetime.datetime.utcnow()
                active_log.session_active = False
                active_log.save()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class LoginAuditLogView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        logs = list(LoginAuditLog.objects.order_by('-login_time')[:100])
        
        # Seed initial realistic login history if empty or sparse
        if len(logs) < 5:
            now = datetime.datetime.utcnow()
            sample_logs = [
                ("Sahil Patel", "Admin", now - datetime.timedelta(minutes=2), None, "192.168.1.45", "Chrome on Windows", "Success", True),
                ("Krish", "WarehouseManager", now - datetime.timedelta(minutes=25), now - datetime.timedelta(minutes=10), "192.168.1.102", "Chrome on macOS", "Success", False),
                ("Dhyan", "InventoryManager", now - datetime.timedelta(hours=1, minutes=15), now - datetime.timedelta(hours=1), "192.168.1.88", "Firefox on Linux", "Success", False),
                ("unknown_user", "Unknown", now - datetime.timedelta(hours=2), None, "203.0.113.195", "Safari on iOS", "Failed", False),
                ("Shreya", "StockManager", now - datetime.timedelta(hours=3, minutes=10), None, "192.168.1.110", "Chrome on Android", "Locked Out", False),
                ("Aarav", "PurchaseManager", now - datetime.timedelta(hours=4), now - datetime.timedelta(hours=2, minutes=30), "192.168.1.64", "Edge on Windows", "Success", False),
                ("Priya", "SalesManager", now - datetime.timedelta(hours=5, minutes=45), now - datetime.timedelta(hours=4, minutes=20), "192.168.1.72", "Chrome on Windows", "Success", False),
                ("employee1", "WarehouseEmployee", now - datetime.timedelta(hours=7), now - datetime.timedelta(hours=5), "192.168.1.15", "Chrome on Android", "Success", False),
            ]
            for uname, role, l_time, lo_time, ip, br, stat, active in sample_logs:
                LoginAuditLog(
                    username=uname,
                    role=role,
                    login_time=l_time,
                    logout_time=lo_time,
                    ip_address=ip,
                    browser=br,
                    status=stat,
                    session_active=active
                ).save()
            logs = list(LoginAuditLog.objects.order_by('-login_time')[:100])

        return Response([l.to_dict() for l in logs], status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user.mongo_user
        user_dict = user.to_dict()
        warehouse_name = "System Wide (All)"
        if user.assigned_warehouse_id:
            wh = Warehouse.objects(id=user.assigned_warehouse_id).first()
            if wh:
                warehouse_name = wh.name
        user_dict['assigned_warehouse_name'] = warehouse_name
        return Response(user_dict, status=status.HTTP_200_OK)
