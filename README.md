# 110 Sør-Vest - Daglig Drift Støttesystem

Et webbasert støttesystem for 110 Sør-Vest alarmsentralen hos Rogaland Brann og Redning IKS.

## Oversikt

Dette systemet hjelper operatører ved 110-sentralen med:

- **Daglig informasjon** - Håndtere og vise operativ informasjon som veisperringer, røyktesting og gass-fakkling
- **Vaktlister** - Administrere og vise hvem som er på vakt
- **Bålmeldinger** (kommer) - Interaktivt kart over registrerte bål for rask verifisering av røykmeldinger

## Teknologi

- **Frontend**: Next.js 14.2 (App Router) med TypeScript
- **Styling**: Tailwind CSS med shadcn/ui komponenter
- **Database**: PostgreSQL med Prisma ORM
- **Autentisering**: NextAuth.js v5 med Google OAuth
- **State management**: TanStack Query (React Query)

## Forutsetninger

- Node.js 20 eller nyere
- PostgreSQL database (lokal eller cloud)
- Google OAuth 2.0 credentials

## Installasjon

### 1. Klon repository

```bash
git clone <repository-url>
cd Test-av-claude-code-desktop-for-md-filen
```

### 2. Installer dependencies

```bash
npm install
```

### 3. Konfigurer miljøvariabler

Kopier `.env.example` til `.env`:

```bash
cp .env.example .env
```

Rediger `.env` og fyll inn verdiene:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sor-vest-110?schema=public"

# NextAuth
AUTH_SECRET="generer-en-tilfeldig-streng-her" # Kjør: openssl rand -base64 32
AUTH_GOOGLE_ID="din-google-oauth-client-id"
AUTH_GOOGLE_SECRET="din-google-oauth-client-secret"

# App
NEXTAUTH_URL="http://localhost:3000"

# Allowed emails (kommaseparert)
ALLOWED_EMAILS="operator@rogaland-brann.no,admin@rogaland-brann.no"
```

### 4. Sett opp Google OAuth

1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opprett et nytt prosjekt eller velg eksisterende
3. Aktiver Google+ API
4. Gå til "Credentials" → "Create Credentials" → "OAuth client ID"
5. Velg "Web application"
6. Legg til autoriserte redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for lokal utvikling)
   - `https://your-domain.com/api/auth/callback/google` (for produksjon)
7. Kopier Client ID og Client Secret til `.env`

### 5. Sett opp database

```bash
# Generer Prisma Client
npx prisma generate

# Kjør migrasjoner
npx prisma migrate dev --name init
```

### 6. Start utviklingsserver

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Database Management

### Prisma Studio

For å se og redigere data i databasen:

```bash
npx prisma studio
```

### Migrasjoner

Når du gjør endringer i `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name beskrivelse-av-endring
```

### Reset database

For å starte på nytt:

```bash
npx prisma migrate reset
```

## Brukerhåndtering

### Legge til brukere

Brukere må legges til i `ALLOWED_EMAILS` miljøvariabelen for å få tilgang. Når de logger inn første gang opprettes de automatisk i databasen med rolle `OPERATOR`.

### Endre brukerroller

Bruk Prisma Studio eller SQL for å endre roller:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@rogaland-brann.no';
```

Roller:
- `OPERATOR` - Kan se og opprette daglig info og vaktlister
- `ADMIN` - Samme som operator (for fremtidig utvidelse)

## Deployment

### Vercel (Anbefalt)

1. Push koden til GitHub
2. Gå til [Vercel](https://vercel.com) og importer repository
3. Sett miljøvariabler i Vercel dashboard
4. Deploy!

Vercel håndterer automatisk:
- HTTPS sertifikater
- Kontinuerlig deployment
- Edge caching
- Automatisk skalering

### Database i produksjon

Bruk en managed PostgreSQL database:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)

## Funksjoner

### Daglig informasjon

- Opprett, rediger og slett operativ informasjon
- Kategorisering (Veisperring, Røyktesting, Gass-fakkling, Annet)
- Prioritetsnivåer (Lav, Middels, Høy)
- Gyldighetsperiode (fra/til dato)
- Filtrer på kategori og aktiv/inaktiv status
- Automatisk sanntidsoppdatering (polling hver 10. sekund)

### Vaktlister

- Ukentlig visning av vakter
- Tre skift per dag (Dag, Kveld, Natt)
- Enkel registrering av operatørnavn
- Merknadsfelter for ekstra informasjon
- Navigering mellom uker

### Bålmeldinger (Kommer)

Planlagt funksjonalitet:
- Interaktivt Google Maps med registrerte bål
- Offentlig registreringsskjema for innbyggere
- Automatisk utløp av gamle meldinger
- Geografisk søk og filtrering

## Sikkerhet

- Google OAuth autentisering (ingen passord lagres)
- Whitelist-basert tilgangskontroll
- JWT sessions med 8 timers utløp
- Audit logging av alle endringer
- CSRF-beskyttelse via NextAuth

## Audit Logging

Alle endringer logges automatisk til `AuditLog` tabellen:
- Hvem gjorde endringen
- Hva ble endret
- Når det skjedde
- Før/etter verdier

Se loggene i Prisma Studio eller via SQL.

## Feilsøking

### "Unauthorized" feil ved innlogging

- Sjekk at din e-post er i `ALLOWED_EMAILS`
- Verifiser at Google OAuth er korrekt konfigurert
- Sjekk at redirect URIs matcher i Google Cloud Console

### Database connection feil

- Verifiser `DATABASE_URL` i `.env`
- Sjekk at PostgreSQL kjører
- Test tilkobling: `npx prisma db pull`

### Builds feiler

- Slett `node_modules` og `.next` og installer på nytt:
  ```bash
  rm -rf node_modules .next
  npm install
  npm run build
  ```

## Utviklingskommandoer

```bash
npm run dev          # Start utviklingsserver
npm run build        # Bygg for produksjon
npm run start        # Kjør produksjonsbygg lokalt
npm run lint         # Kjør ESLint
npx prisma studio    # Åpne database GUI
npx prisma generate  # Generer Prisma Client
```

## Mappestruktur

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Autentiseringssider
│   ├── dashboard/         # Dashboard sider
│   └── layout.tsx         # Root layout
├── components/            # React komponenter
│   ├── ui/               # shadcn/ui komponenter
│   └── ...               # App-spesifikke komponenter
├── lib/                   # Utility funksjoner
│   ├── prisma.ts         # Prisma client
│   ├── audit.ts          # Audit logging
│   └── utils.ts          # Helper funksjoner
├── prisma/               # Database schema og migrasjoner
│   └── schema.prisma
├── types/                # TypeScript type definitions
└── public/               # Statiske filer
```

## Lisens

Proprietær - Rogaland Brann og Redning IKS

## Support

For spørsmål eller problemer, kontakt IT-avdelingen ved Rogaland Brann og Redning IKS.
