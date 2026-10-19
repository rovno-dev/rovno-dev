# Spec — How this repo works

This repository is spec-driven. The `docs/` folder **is** the product.

## What this repo is

A production-ready digital agency platform for Rovno.dev. It handles:
- Public facing portfolio, blog, and event pages.
- Lead generation (orders).
- A full admin panel for content and CRM management.
- A Telegram bot for notifications and admin utility.

## Contract

Every change respects the following order:

1. Update the spec.
2. Update the code to match.
3. Update the tests.
4. Bump `docs/VERSION` if a public interface changed.

A PR that changes code without changing its spec is incomplete.

## Principles

- **Lean by default.** Ship the smallest thing that works.
- **No global mutable state.** Each request is independent.
- **The website never talks to the DB.** It calls the backend over HTTP.
- **The bot is stateless** until it needs not to be — then add state deliberately.
- **Frontend design**: Use the tokens in `globals.css`. Never hardcode hex.
