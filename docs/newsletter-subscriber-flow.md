# Newsletter Subscriber Flow

## Overview

We use Substack for our newsletter but manage subscriber collection ourselves via a form on the website. Since Substack doesn't support auto-importing subscribers, we use a simple manual weekly flow.

## How it works

1. A visitor fills out the subscribe form in the website footer
2. Their email is saved to the [Subscribers Google Sheet](https://docs.google.com/spreadsheets/d/1JvIZHGMOR0OWFmEUDOq03CxCRlr7wZeJ3PtGkY5OZHk/edit?gid=0#gid=0) via a Google Apps Script webhook
3. The subscriber receives an automated welcome email via Resend
4. The newsletter manager receives an email notification to manually add the subscriber to Substack

## Weekly task (newsletter manager)

1. Open the [Subscribers Google Sheet](https://docs.google.com/spreadsheets/d/1JvIZHGMOR0OWFmEUDOq03CxCRlr7wZeJ3PtGkY5OZHk/edit?gid=0#gid=0)
2. Download as CSV (**File → Download → CSV**)
3. Go to your Substack dashboard → **Subscribers → Import**
4. Upload the CSV — Substack deduplicates automatically, so re-uploading existing subscribers is safe

## Technical setup

| Component | Details |
|-----------|---------|
| Subscriber sheet | [Google Sheet](https://docs.google.com/spreadsheets/d/1JvIZHGMOR0OWFmEUDOq03CxCRlr7wZeJ3PtGkY5OZHk/edit?gid=0#gid=0) |
| Welcome email | Sent via Resend from `hello@4herfrika.com` |
| Manager notification | Sent via Google Apps Script (same script as the sheet webhook) |

## Environment variables required

```
RESEND_API_KEY=
GOOGLE_SHEET_WEBHOOK_URL=
```

See `.env.example` for reference. The `GOOGLE_SHEET_WEBHOOK_URL` is the deployed Google Apps Script web app URL.

## Deploying the Apps Script webhook (one-time setup)

Apps Script requires a Google Cloud Platform project with OAuth configured before you can authorize and deploy. This is a **one-time setup** — the same GCP project can be reused for all future Apps Script projects.

### 1. Create a GCP project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown → **New Project**
3. Name it (e.g. "4herfrika Scripts") → **Create**
4. Note the **Project Number** from the project dashboard

### 2. Configure OAuth consent screen
1. In Cloud Console → **APIs & Services → OAuth consent screen**
2. Select **External** → **Create**
3. Fill in the required fields: App name, support email
4. Skip scopes and test users → **Save and Continue** through to the end

### 3. Link GCP project to Apps Script
1. In the Apps Script editor → ⚙️ **Project Settings** (left sidebar)
2. Scroll to **Google Cloud Platform (GCP) Project** → **Change project**
3. Paste your project number → **Set project**

### 4. Deploy
1. **Deploy → New deployment** → select type **Web app**
2. Set **Execute as:** `Me`, **Who has access:** `Anyone`
3. Click **Deploy** — authorize via the popup
4. If prompted with "Google hasn't verified this app" → **Advanced → Go to [app name] (unsafe)** (expected for self-written scripts)
5. Copy the web app URL → add to `.env.local` as `GOOGLE_SHEET_WEBHOOK_URL`

> **Note:** Every time you edit the script you must create a **new deployment** for changes to take effect.
