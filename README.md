# iD Opening Hours Prototype

This is a minimal prototype for a structured `opening_hours` UI widget for the iD editor.

## Motivation

Currently, `opening_hours` in iD is handled as plain text, which makes it difficult to read and edit.

This prototype explores a structured UI approach for common cases, while preserving raw text for complex formats.

## Supported Cases (MVP)

- Mo-Fr 09:00-18:00
- Sa 10:00-14:00
- Simple combinations like:
  - Mo-Fr 09:00-18:00; Sa 10:00-14:00

## Fallback

Complex formats are not parsed and will be shown as raw text, for example:

- PH off
- Mo-Fr 09:00-12:00,13:00-18:00

## Demo

Open `index.html` in a browser.
