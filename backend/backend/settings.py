import os
from pathlib import Path
from datetime import timedelta
import mongoengine

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-supplysense-ai-super-secret-key-production'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Local apps
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MongoEngine MongoDB Connection Setup
import mongoengine
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    pass

MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'supplysense_db')
MONGO_HOST = os.getenv('MONGO_HOST', 'mongodb+srv://sahilpatel3a_db_user:zhN1R7NxyD7h167T@supplysense-db.hgcsu0j.mongodb.net/?appName=supplysense-db')

try:
    if 'default' not in mongoengine.connection._connections:
        mongoengine.connect(db=MONGO_DB_NAME, host=MONGO_HOST, serverSelectionTimeoutMS=3000)
        mongoengine.connection.get_connection().admin.command('ping')
        print(f"[*] MongoEngine connected successfully to target database: {MONGO_DB_NAME}")
except Exception as primary_err:
    print(f"[!] MongoEngine primary host connection warning ({primary_err}). Falling back to local MongoDB instance...")
    try:
        mongoengine.disconnect()
        local_host = f"mongodb://127.0.0.1:27017/{MONGO_DB_NAME}"
        mongoengine.connect(db=MONGO_DB_NAME, host=local_host, serverSelectionTimeoutMS=2000)
        print(f"[*] MongoEngine connected to local fallback database: {MONGO_DB_NAME}")
    except Exception as fallback_err:
        print(f"[!] MongoEngine connection error: {fallback_err}")

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.authentication.MongoJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Email SMTP Configuration for 2-Step Verification
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'sahilbhutt2007@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = 'SupplySense AI Security <sahilbhutt2007@gmail.com>'
