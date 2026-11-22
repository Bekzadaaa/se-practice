# AGENTS.md — Smart Campus Room Availability Checker

Instructions for any coding agent working in this project. Read this file before you change
anything, and follow it over any general habit of yours.

## Project

A React + TypeScript page (Vite) that tells a student whether a campus room is free for a
requested time. The booking rule lives in `src/booking.ts` (`canBook`); the page is `src/App.tsx`;
the tests are in `src/booking.test.ts`.

Scope: exactly one fictional room with made-up sample bookings; never use real room names, the real KBTU timetable or any data from the KBTU portal.

## Acceptance contract

- AC1 Reject start ≥ end and requests in the past.
- AC2 Enforce the maximum allowed duration (120 minutes).
- AC3 Reject a blocked room.
- AC4 Reject overlaps; allow bookings that only touch at endpoints.
- AC5 Return Available / Unavailable without changing booking data.
- AC6 Preserve clear UI feedback on desktop and mobile.
- AC1–AC6 are fixed: never change them or weaken their tests to make a change pass.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`

## You may

- Edit files inside this project only; never edit the acceptance contract above.
- Add packages when a task needs them.
- Never add a login, accounts, a database or any backend (no Supabase); bookings stay in-memory sample data.
- Never add, commit or print secrets: no API keys, tokens, passwords or `.env` values.

## Before you finish

- Make sure the page still loads.
- Run `npm test` before you propose a change as done; all tests must pass, and report the output.
- Never deploy or publish anywhere (no Netlify, no --prod); a person reviews the pull request.
