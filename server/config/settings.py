"""
Django settings for server project.

Generated by 'django-admin startproject' using Django 2.2.28.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
from dotenv import load_dotenv
load_dotenv()
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.environ.get('SECRET_KEY', 'YOUR_SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
DATABASE_ENGINE = os.environ.get('DATABASE_ENGINE', 'django.db.backends.mysql')
DATABASE_NAME = os.environ.get('MYSQL_DATABASE', os.environ.get('DATABASE_NAME', os.path.join(BASE_DIR, 'db.sqlite3') if DATABASE_ENGINE == 'django.db.backends.sqlite3' else 'rwdb'))
DATABASE_USER = os.environ.get('MYSQL_USER', os.environ.get('DATABASE_USER', 'root'))
DATABASE_PASSWORD = os.environ.get('MYSQL_PASSWORD', os.environ.get('DATABASE_PASSWORD', 'root'))
DATABASE_HOST = os.environ.get('DATABASE_HOST', 'db')
DATABASE_PORT = int(os.environ.get('DATABASE_PORT', '3306'))




# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!


# SECURITY WARNING: don't run with debug turned on in production!


# 環境変数からALLOWED_HOSTSを取得し、カンマ区切りで分割
allowed_hosts_env = os.environ.get("ALLOWED_HOSTS", "")
allowed_hosts_list = [host.strip() for host in allowed_hosts_env.split(",") if host.strip()]

# 環境変数からCLIENT_ORIGIN_URLSを取得し、カンマ区切りで分割
client_origin_urls_env = os.environ.get("CLIENT_ORIGIN_URLS", "")
client_origin_urls_list = [url.strip() for url in client_origin_urls_env.split(",") if url.strip()]

# ALLOWED_HOSTSとCSRF_TRUSTED_ORIGINSを設定
ALLOWED_HOSTS = client_origin_urls_list + allowed_hosts_list


# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'widget_tweaks',
    'channels',
    'app',
    'accounts',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'corsheaders',
    'django_filters',
    'drf_multiple_model',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# 新たにCORS_ORIGIN_WHITELIST変数を記述して、その中にアクセスを許可したいURL（アクセス元）を追加する
CORS_ALLOWED_ORIGINS = client_origin_urls_list

ROOT_URLCONF = 'config.urls'

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

CHANNEL_LAYERS = {
    'default': {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

"""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
"""

DATABASES = {
    'default': {
        'ENGINE': DATABASE_ENGINE,
        'NAME': DATABASE_NAME,
        'USER': DATABASE_USER,
        'PASSWORD': DATABASE_PASSWORD,
        'HOST': DATABASE_HOST,
        'PORT': DATABASE_PORT,
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


SITE_ID = 1
LOGIN_REDIRECT_URL = '/'
ACCOUNT_LOGOUT_REDIRECT_URL = '/'
ACCOUNT_EMAIL_VERIFICATION = 'none'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'app', 'media')


LOGGING = {
    # スキーマバージョンは1固定
    'version': 1,
    # すでに作成されているロガーを無効化しないための設定
    'disable_existing_loggers': False,

    # ログの書式設定
    'formatters': {
        # 詳細ログの書式
        'default': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },

    # ハンドラ
    'handlers': {
        # コンソール出力用のハンドラ
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
        # ファイル出力用のハンドラ
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(os.path.dirname(BASE_DIR), 'data_store', 'debug.log'),
            'formatter': 'default',
        },
    },

    # ロガー
    'loggers': {
        # django 用のロガー
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        # app 用のロガー
        'app': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
}


# 安全なファイルディレクトリの設定 for File List API
SAFE_FILE_DIRECTORY = '/home'
