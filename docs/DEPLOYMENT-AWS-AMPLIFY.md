# Deploy Frontend + Backend on AWS with Amplify

Step-by-step guide to host your React app and Label Auditor API using **Amplify Hosting** (frontend) and **Amplify Gen 2 Backend** (Lambda + API Gateway + Bedrock).

**What you get:**  
- Frontend: React app at `https://main.xxxx.amplifyapp.com` (or custom domain).  
- Backend: `POST /analyze-label` → Lambda → Amazon Bedrock → JSON response.

---

## Prerequisites

- **AWS account** (with $100 credits)
- **Node.js 18+** and **npm**
- **Git** repo (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
- **AWS CLI** configured (`aws configure`) — optional but useful

---

## Part 1: Add Amplify Backend to Your Repo (local)

### Step 1.1 — Install dependencies (do not run create-amplify)

**Do not run `npm create amplify`.** The repo already has an `amplify/` folder; the CLI will error.

In the project root:

```bash
npm install
```

**This repo already includes** the `amplify/` backend. Do not run `create-amplify`—it will error because the directory exists.

(The Amplify backend packages are already in package.json; no need to run create-amplify.)

### Step 1.2 — Confirm backend layout

Ensure these exist:

- `amplify/backend.ts` — backend entry, REST API, and outputs
- `amplify/functions/analyze-label/resource.ts` — Lambda definition
- `amplify/functions/analyze-label/handler.ts` — Lambda code (calls Bedrock)

### Step 1.3 — Deploy backend to AWS (sandbox)

From the project root:

```bash
npx ampx sandbox
```

- First run: log in to AWS in the browser if prompted; pick the **AWS region** (e.g. `us-east-1`).
- Wait until the sandbox reports **“Sandbox is running”**.
- This creates/updates: Lambda, API Gateway, and (when you add it) Bedrock permissions.

After deploy, **`amplify_outputs.json`** is generated in the project root. Do **not** commit it if it contains account-specific IDs (add to `.gitignore`; Amplify Hosting will regenerate it during build).

### Step 1.4 — Get the API URL

- In the sandbox output, or in **AWS Console → API Gateway → Your API → Stages → dev**, copy the **Invoke URL** (e.g. `https://abc123.execute-api.us-east-1.amazonaws.com/dev`).
- Your **analyze-label** endpoint is: `{Invoke URL}/analyze-label` (POST).

---

## Part 2: Connect Frontend to the Backend

### Step 2.1 — Local development

Create a `.env` file in the project root (and add `.env` to `.gitignore` if not already):

```env
VITE_API_URL=https://YOUR_API_GATEWAY_INVOKE_URL/dev
```

Replace with your actual Invoke URL from Step 1.4 (no trailing slash). The frontend uses this for the Label Auditor “Analyse” button.

### Step 2.2 — Amplify Hosting (frontend build)

When you use **Amplify Hosting**, the app is built in the cloud. The backend is deployed first; then the frontend build runs and can use the generated `amplify_outputs.json` (which includes the API URL). The frontend code is already set up to use `VITE_API_URL` when set, or the URL from Amplify outputs when available.

---

## Part 3: Host Frontend + Backend in Amplify Console

### Step 3.1 — Create the Amplify app

1. Open **AWS Console → Amazon Amplify**.
2. **Create new app** → **Host web app**.
3. Choose your **Git provider** (GitHub / GitLab / Bitbucket / CodeCommit), authorize, and select the **repository** and **branch** (e.g. `main`).

### Step 3.2 — Build settings (frontend)

Amplify may auto-detect the app. If not, set:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Base directory:** (leave empty if the app is at repo root)
- **Node version:** 18 or 20 (in “Build image settings” or `amplify.yml` if you add one)

### Step 3.3 — Backend (Gen 2) in the same app

1. In the Amplify app, ensure the repo contains the **`amplify/`** folder (from Part 1).
2. Amplify Gen 2 will detect it and **build/deploy the backend** (Lambda, API Gateway) as part of the same app when you have a build that runs the backend (e.g. `npx ampx sandbox --outputs-out-dir .` or use the Amplify pipeline that runs backend then frontend).

To have Amplify deploy the backend automatically:

- Add an **amplify.yml** (see Step 3.5) that runs backend deploy then frontend build, **or**
- Use **“Amplify Gen 2”** in the console (if available): connect the repo; it will detect `amplify/` and deploy the backend, then build the frontend. The frontend build will receive the generated `amplify_outputs.json` with the API URL.

### Step 3.4 — Environment variables (required for frontend → API)

In **Amplify Console → App → Environment variables** add:

- **Name:** `VITE_API_URL`  
- **Value:** Your API Gateway Invoke URL from the backend deploy, **without** a trailing slash (e.g. `https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev`).

The frontend uses `VITE_API_URL` to call `POST {VITE_API_URL}/analyze-label`. Without it, the Analyse button falls back to mock data. After the first backend deploy, copy the Invoke URL from the sandbox output or from **API Gateway → Your API → Stages → dev**.

### Step 3.5 — Optional: `amplify.yml` for backend + frontend

If you want one pipeline that deploys backend then frontend, create **`amplify.yml`** in the repo root:

```yaml
version: 1
applications:
  - appRoot: .
    backend:
      phases:
        build:
          commands:
            - npm ci
            - npx ampx sandbox --no-browser --outputs-out-dir .
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files: '**/*'
      cache:
        paths:
          - node_modules/**/*
```

Adjust if your Amplify app uses a different structure (e.g. monorepo). The important part is: **backend builds first**, then **frontend build** uses the generated outputs.

### Step 3.6 — Deploy

- **Save and deploy.** Amplify will build (and deploy backend if configured) and then build the frontend.
- When the build succeeds, open the **Amplify app URL** (e.g. `https://main.xxxx.amplifyapp.com`). The Label Auditor should call your live `/analyze-label` API.

---

## Part 4: Bedrock and Permissions

### Step 4.1 — Enable Bedrock in the region

- In **AWS Console → Amazon Bedrock**, choose the same region as your Lambda (e.g. `us-east-1`).
- In **Model access** (left menu), **request access** to at least one model (e.g. **Claude 3 Haiku** or **Titan Text**). Wait until access is granted.

### Step 4.2 — Lambda permissions

The `amplify/backend.ts` in this repo grants the **analyze-label** Lambda permission to call **Bedrock InvokeModel**. No extra manual step is needed if you use that file as-is.

---

## Part 5: Cost and Limits (within $100 credits)

- **Amplify Hosting:** Free tier covers moderate traffic; beyond that, low cost.
- **Lambda + API Gateway:** Free tier is generous; prototype usage is usually within it.
- **Bedrock:** Main cost (pay per token). Use a smaller model (e.g. Claude 3 Haiku) and limit prompt/response length. Set a **billing alert** (e.g. $50) in **AWS Billing**.

---

## Quick reference

| What              | Where / How |
|-------------------|-------------|
| API endpoint      | `POST {API_GATEWAY_URL}/analyze-label` |
| Request body      | `{ "ocr_text?", "image_base64?", "query", "language" }` |
| Local API URL     | `.env` → `VITE_API_URL` |
| Hosted API URL    | From `amplify_outputs.json` or Amplify env var `VITE_API_URL` |
| Backend code      | `amplify/functions/analyze-label/handler.ts` |
| Backend config    | `amplify/backend.ts` |

---

## Troubleshooting

- **CORS errors:** Ensure `amplify/backend.ts` uses `allowOrigins: Cors.ALL_ORIGINS` (or your Amplify app domain) for the REST API.
- **“API name is invalid”:** You’re using the REST client with a name that doesn’t match `restApiName` in `backend.ts`, or Amplify isn’t configured with `outputs.custom.API`. For this app we call the API by URL (fetch), so this only applies if you switch to Amplify REST client.
- **502 from /analyze-label:** Check **CloudWatch Logs** for the **analyze-label** Lambda; fix Bedrock model ID, permissions, or response format.
- **Bedrock access denied:** Ensure model access is enabled in Bedrock and the Lambda role has `bedrock:InvokeModel` on the correct resource.
