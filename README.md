Typescript Next.JS + Supabase auth template.
*Aniket Pant*

## Getting Started

1. Do `npm i`
2. Procure supabase env vars for connection
3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with browser to see the result.

MAKE SURE TO RUN: 
```SQL
-- run this once in Supabase SQL editor or psql
ALTER TABLE public.game_players REPLICA IDENTITY FULL;
```

Otherwise, DELETE types will not be reported via Supabase Realtime PGListener.