# Backend Deployment (AWS SAM) — Simplified

Minimal steps to deploy the FastAPI backend to AWS using SAM.

## Prerequisites
- AWS CLI, SAM CLI, Docker installed
- AWS credentials configured (named profile recommended):
  - `aws configure --profile staging`
  - verify: `aws sts get-caller-identity --profile staging --region ap-northeast-1`

## 1) Create Firebase Credentials Secret (once per environment)
Store the entire Firebase service account JSON as a single Secrets Manager secret.

```bash
export AWS_REGION=ap-northeast-1
export ENVIRONMENT=staging   # or production
export SECRET_NAME="/next-fastapi-note-app/${ENVIRONMENT}/firebase-credentials"

# Compact your service account JSON
export FIREBASE_SA_JSON=$(jq -c . < path/to/service-account.json)

# Create (first time)
aws secretsmanager create-secret \
  --profile staging \
  --region "$AWS_REGION" \
  --name "$SECRET_NAME" \
  --description "Firebase service account for ${ENVIRONMENT}" \
  --secret-string "$FIREBASE_SA_JSON"

# Update (later)
aws secretsmanager put-secret-value \
  --profile staging \
  --region "$AWS_REGION" \
  --secret-id "$SECRET_NAME" \
  --secret-string "$FIREBASE_SA_JSON"

# Verify
aws secretsmanager get-secret-value \
  --profile staging \
  --region "$AWS_REGION" \
  --secret-id "$SECRET_NAME" \
  --query SecretString | jq -r .
```

Notes
- Secret name must be `/next-fastapi-note-app/{environment}/firebase-credentials` to match IAM policy.
- The stack resolves it via `FIREBASE_CREDENTIALS_JSON` env var.

## 2) Build and Deploy
```bash
cd infrastructure/aws-sam

sam build
sam build --no-cached # if without cache

sam deploy --config-env staging --profile staging
```

**Note:** SAM will automatically create an ECR repository, build your Docker image, and push it during deployment.

## 3) Verify
- SAM prints the Function URL at the end (Output: `FunctionUrlEndpoint`).
- Health check:
```bash
curl -sSf <FunctionUrlEndpoint>/health | jq .
```

## Troubleshooting (Quick)
- Unable to locate credentials → set `--profile staging` or `export AWS_PROFILE=staging`.
- Source image does not exist → run `sam build` before `sam deploy`.
- Secret not found/permission denied → ensure secret path matches and you’re in the right account/region.

