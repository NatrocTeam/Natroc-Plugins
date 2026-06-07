# Severity Model

## Blocker

Must fail review: secret leak, auth bypass, user data exposure, payment/order double-charge risk, destructive migration without safety.

## Critical

Likely exploitable or corrupting: SQL injection, broken access control, unsafe password handling, executable file upload.

## High

Serious and realistically harmful: weak backend validation, missing transaction for money/order flow, stack traces exposed.

## Medium

Real defect or maintainability risk.

## Low

Readability, naming, or small UX issue.

## Info

Improvement note.

## Unverified

Possible issue with insufficient evidence.
