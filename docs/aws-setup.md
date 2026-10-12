# AWS セットアップ手順（CD・実行基盤）

CD ワークフロー（`.github/workflows/cd.yml`）と ECS での実行に必要な AWS 側の事前セットアップ手順。
案件のアカウント・命名に読み替えて使う。構成の方針は `docs/architecture.md` §1。

前提: AWS CLI 設定済み・管理者相当の権限。VPC・サブネット・Aurora PostgreSQL は作成済みとする。以下の変数を読み替える（**アカウント ID・ARN は例示値**）。

```bash
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=ap-northeast-1
export REPO=nagashima-toru/spring-web-ai-coding-samples   # GitHub リポジトリ
export APP=web-sample
```

## 1. GitHub OIDC プロバイダ（アカウントに1回だけ）

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com
```

## 2. CD 用 IAM ロール（GitHub Actions が Assume する）

### 信頼ポリシー（trust-policy.json）

`sub` の条件で **このリポジトリの production 環境からのみ** Assume を許可する。

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:nagashima-toru/spring-web-ai-coding-samples:environment:production"
      }
    }
  }]
}
```

### 権限ポリシー（permissions.json。ECR push・タスク定義登録・サービス更新に最小限）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "EcrAuth", "Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*" },
    {
      "Sid": "EcrPush",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability", "ecr:CompleteLayerUpload", "ecr:InitiateLayerUpload",
        "ecr:PutImage", "ecr:UploadLayerPart", "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": [
        "arn:aws:ecr:ap-northeast-1:123456789012:repository/web-sample-backend",
        "arn:aws:ecr:ap-northeast-1:123456789012:repository/web-sample-frontend"
      ]
    },
    {
      "Sid": "EcsDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeTaskDefinition", "ecs:RegisterTaskDefinition",
        "ecs:UpdateService", "ecs:DescribeServices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRolesToTaskDef",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::123456789012:role/web-sample-task-execution-role",
        "arn:aws:iam::123456789012:role/web-sample-task-role"
      ]
    }
  ]
}
```

```bash
aws iam create-role --role-name github-actions-web-deploy --assume-role-policy-document file://trust-policy.json
aws iam put-role-policy --role-name github-actions-web-deploy --policy-name web-deploy --policy-document file://permissions.json
```

## 3. ECR リポジトリ

```bash
aws ecr create-repository --repository-name $APP-backend  --image-scanning-configuration scanOnPush=true
aws ecr create-repository --repository-name $APP-frontend --image-scanning-configuration scanOnPush=true
```

## 4. シークレット（Secrets Manager）

```bash
aws secretsmanager create-secret --name web-sample/app --secret-string '{
  "db_url": "jdbc:postgresql://{Aurora のエンドポイント}:5432/webdb",
  "db_username": "web_app",
  "db_password": "{パスワード}",
  "jwt_secret": "{32 文字以上のランダム文字列。例: openssl rand -base64 48}"
}'
```

## 5. ECS（クラスタ・ロール・タスク定義・サービス）

```bash
aws ecs create-cluster --cluster-name web-cluster
```

- **タスク実行ロール**（`web-sample-task-execution-role`）: `AmazonECSTaskExecutionRolePolicy` ＋ `web-sample/app` への `secretsmanager:GetSecretValue`
- **タスクロール**（`web-sample-task-role`）: アプリが使う AWS リソースへの権限（サンプルでは不要）

### 初期タスク定義

cd.yml は「既存タスク定義のイメージ差し替え」を行うため、初回は手動で登録する。backend（task-definition-backend.json）:

```json
{
  "family": "web-sample-backend",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/web-sample-task-execution-role",
  "taskRoleArn": "arn:aws:iam::123456789012:role/web-sample-task-role",
  "containerDefinitions": [{
    "name": "backend",
    "image": "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/web-sample-backend:latest",
    "essential": true,
    "portMappings": [{ "containerPort": 8080 }],
    "environment": [{ "name": "SPRING_PROFILES_ACTIVE", "value": "prod" }],
    "secrets": [
      { "name": "DB_URL",      "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:web-sample/app:db_url::" },
      { "name": "DB_USERNAME", "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:web-sample/app:db_username::" },
      { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:web-sample/app:db_password::" },
      { "name": "JWT_SECRET",  "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:web-sample/app:jwt_secret::" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/web-sample-backend",
        "awslogs-region": "ap-northeast-1",
        "awslogs-stream-prefix": "backend",
        "awslogs-create-group": "true"
      }
    }
  }]
}
```

frontend（task-definition-frontend.json）は family `web-sample-frontend`・コンテナ名 `frontend`・`containerPort: 3000`・イメージ `web-sample-frontend:latest` とし、`environment`・`secrets` は不要（`NEXT_PUBLIC_API_URL` はビルド時に空で埋め込む）。

```bash
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json
aws ecs register-task-definition --cli-input-json file://task-definition-frontend.json
```

### ALB とサービス

- ALB のリスナールール: パス `/api/*` と `/actuator/health` → backend のターゲットグループ（ポート 8080）、それ以外 → frontend のターゲットグループ（ポート 3000）
- ヘルスチェック: backend `/actuator/health`、frontend `/login`
- 同一オリジンになるため CORS 設定は不要（`app.security.cors.allowed-origins` は空のまま）
- サービス `web-sample-backend`・`web-sample-frontend` を、上記ターゲットグループに紐付けて作成する（プライベートサブネット、パブリック IP なし）
- **リフレッシュトークンの保管庫は既定でメモリ保持**のため、backend を複数タスクにする前に DB/Redis 実装へ差し替える（`docs/architecture.md` §4）

## 6. 最初の管理者ユーザー

`prod` プロファイルでは初期データを投入しない。最初のデプロイで Flyway がテーブルを作ったあと、DB に管理者を1人登録する。パスワードハッシュは BCrypt（例: `htpasswd -bnBC 10 "" '{パスワード}' | tr -d ':\n' | sed 's/^\$2y/\$2a/'`）。

```sql
INSERT INTO app.users (username, password_hash, role) VALUES ('admin', '{BCrypt ハッシュ}', 'ADMIN');
```

## 7. GitHub 側の設定（Environments）

Settings → Environments → `production` を作成し、Variables に以下を設定する（必要なら Required reviewers でデプロイ承認を付ける）。

| 変数 | 例 |
|---|---|
| `AWS_REGION` | `ap-northeast-1` |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-actions-web-deploy` |
| `ECS_CLUSTER` | `web-cluster` |
| `ECR_REPOSITORY_BACKEND` / `ECR_REPOSITORY_FRONTEND` | `web-sample-backend` / `web-sample-frontend` |
| `ECS_TASK_FAMILY_BACKEND` / `ECS_TASK_FAMILY_FRONTEND` | `web-sample-backend` / `web-sample-frontend` |
| `ECS_SERVICE_BACKEND` / `ECS_SERVICE_FRONTEND` | `web-sample-backend` / `web-sample-frontend` |

以上で `v*` タグを push すると CD（ECR push → タスク定義の新リビジョン登録 → サービス更新）が動く。

```bash
git tag v1.0.0 && git push origin v1.0.0
```
