# روشن مارکیٹ کرایہ مینجمنٹ سسٹم — Next.js Version

Ye wahi app hai jo pehle Streamlit mein thi, ab **Next.js + MongoDB + Vercel** ke sath — zyada tez, aur "sleep" wala masla bhi nahi.

## 1) Local test (optional, agar computer pe Node.js installed hai)

```bash
npm install
cp .env.local.example .env.local
# .env.local kholain aur apni MongoDB connection string dalain
npm run dev
```
Phir browser mein `http://localhost:3000` kholain.

**Node.js na ho to koi masla nahi** — seedha GitHub + Vercel pe chala jayega, local test zaroori nahi.

## 2) GitHub par upload karain

1. GitHub par nayi repository banayen (jaise `roshan-market-nextjs`)
2. Is poore folder (saari files aur subfolders) ko upload kar dein
   - **`.env.local` file KABHI upload NA karein** (ye already `.gitignore` mein hai, is liye khud-ba-khud chhupi rahegi)
   - `node_modules` folder bhi upload nahi karna (agar ho to)

## 3) Vercel par deploy karain

1. **vercel.com** par jayen, GitHub account se sign in karain
2. **"Add New" → "Project"** par click karain
3. Apni repository select karain → **"Import"**
4. Deploy karne se pehle **"Environment Variables"** section mein ye add karain:

   | Name | Value |
   |---|---|
   | `MONGODB_URI` | apni MongoDB Atlas connection string (wahi jo pehle bani thi) |
   | `WHATSAPP_PROVIDER` | `greenapi` (ya `ultramsg`) |
   | `GREENAPI_ID_INSTANCE` | (agar Green API use kar rahe hain) |
   | `GREENAPI_API_TOKEN` | (agar Green API use kar rahe hain) |
   | `ULTRAMSG_INSTANCE_ID` | (agar Ultramsg use kar rahe hain) |
   | `ULTRAMSG_TOKEN` | (agar Ultramsg use kar rahe hain) |

5. **"Deploy"** dabayen — 2-3 minute mein live link mil jayega (jaisay `roshan-market.vercel.app`)

## Login

Default password: `admin123` — deploy hone ke baad Admin panel se turant badal lein.

## MongoDB — wahi database istemal hoga

Koi nayi database banane ki zaroorat nahi — yehi app pehle wale MongoDB Atlas cluster se connect ho kar wahi data (dukanain, kirayadaar, payments) dikhayegi jo pehle se mojood hai.

## Vercel free tier ke fayde (Streamlit ke muqablے میں)

- Koi "sleep" mode nahi — app hamesha turant khulti hai
- Zyada tez load hoti hai
- Free tier mein hi custom domain jorna bhi mumkin hai

## Agar koi masla aaye

Deploy ke baad agar page blank ho ya error aaye, Vercel dashboard mein **"Deployments" → latest deployment → "View Function Logs"** mein jaake error dekh sakte hain — uska screenshot bhej dein, madad kar doon ga.
