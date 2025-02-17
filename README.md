# DBP-Manager

実世界データの管理を行うリポジトリ

## 環境構築

Dockerを使用する構築方法と使用しないローカルの構築方法があリます。
まず、共通の手順について、その後別々の手順について説明します。

### Dockerとローカル共通の手順

1. 本リポジトリをクローン

    `git clone https://github.com/exdata-inc/DBP-Manager.git`

1. 環境変数を**2ファイル**で設定

    1. `.env.sample`をコピーして`.env`を作り、必要に応じて書き換え

        <details>
        <summary>環境変数の詳細</summary>

        - MySQL
          - `MYSQL_ROOT_PASSWORD`: MySQLのroot用のパスワード
          - `MYSQL_DATABASE`: MySQLで利用するデータベース名
          - `TZ`: タイムゾーン
          - `MYSQL_USER`: DjangoサーバがMySQLサーバにアクセスする際のユーザ名
          - `MYSQL_PASSWORD`: DjangoサーバがMySQLサーバにアクセスする際のパスワード
        - Django
          - `SECRET_KEY`: Djangoのシークレットキー
          - `DEBUG`: デバッグモードにするかどうか
          - `ALLOWED_HOSTS`: Djangoサーバのホスト名（カンマ区切り）
          - `CLIENT_ORIGIN_URLS`: クライアントのURL（カンマ区切り）
          - `DATABASE_ENGINE`: 使用するDBエンジン
          - `DATABASE_PORT`: DBのポート番号
          - `DATABASE_HOST`: DBのホスト名
        - スーパーユーザ
          - `RWDB_SU_USERNAME`: スーパーユーザ名
          - `RWDB_SU_PASSWORD`: スーパーユーザのパスワード
          - `RWDB_SU_EMAIL`: スーパーユーザのメールアドレス
        - RWDB
          - `RWDB_URL_PREFIX`: サーバのURL
        </details>

    2. `client/.env.sample`をコピーして`client/.env`を作り、必要に応じて書き換え

        <details>
        <summary>環境変数の詳細</summary>

        - `VITE_RWDB_URL_PREFIX`: サーバのURL
        - `VITE_API_ROOT_PATH`: APIのルートパス（変更しないでください）
        - `VITE_MAPBOX_TOKEN`: Mapboxのトークン
        - `VITE_MDA_URL`: 構造情報を生成するサーバのURL
        </details>

### Dockerを使用する場合の手順

1. Dockerコンテナの立ち上げ

    リポジトリのルートで、`docker compose up -d --build`を行う。

1. ブラウザで、`http://localhost:3002`にアクセス

### ローカルでの手順

1. Python3.12の環境を用意し、パッケージをインストールする

    ```bash
    pip install -r requirements.txt
    ```

1. MySQLのデータベースを作成

    `mysql.server start`でMySQLを起動させ、`mysql -u root`でログインします。  
    `create database {database_name};`と入力して、MySQL上にデータベースを作成します。
    `exit`コマンドでログアウトします。

    `{database_name}`には、環境変数で設定した`MYSQL_DATABASE`と同じものを入力してください。

1. データベース情報の反映

    以下を入力します。

    ```bash
    python server/manage.py makemigrations
    python server/manage.py migrate
    python server/manage.py createcustomsuperuser --username {user_name} --password {password} --noinput --email {email}
    python server/manage.py createPredicate5W1H
    ```

1. Djangoサーバの立ち上げ

    ```bash
    python server/manage.py runserver 0.0.0.0:{server_port}
    ```

    `{server_port}`には、環境変数の設定に応じて適切なポート番号にします。

1. `client/README.md`に従って、クライアントの環境構築

1. クライアントサーバの立ち上げ

    ```bash
    bun run dev --port {client_port}
    ```

    `{client_port}`には、環境変数の設定に応じて適切なポート番号にします。

1. ブラウザで、`http://localhost:{client_port}`にアクセス
