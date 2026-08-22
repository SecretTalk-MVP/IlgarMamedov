# SecretTalk — Module Template

## Purpose

This template defines the minimum information that must be determined before creating a new module.

## Module

Name:

`<module-name>`

Location:

`modules/<module-name>/`

## Responsibility

The module is responsible for:

`<single responsibility>`

## Public entrypoint

Main file:

`<main-file>`

Public method:

`<public-method>`

## User entrypoint

Type:

`<button / command / callback / message / state / none>`

User action:

`<user action>`

## Router

Router required:

`YES / NO`

Route:

`<router route>`

## Menu

Menu integration required:

`YES / NO`

Entry:

`<menu entry>`

## Index

Index integration required:

`YES / NO`

Reason:

`<reason if required>`

## Dependencies

Required shared services:

`<dependencies>`

## Existing implementation

Existing implementation:

`<path or NONE>`

Status:

`ACTIVE / LEGACY / REFERENCE / UNUSED / OBSOLETE / NONE`

## Replacement

Old implementation to remove:

`<path or NONE>`

## Verification

Independent verification:

`<test>`

Integration verification:

`<test>`

Production verification:

`<user flow>`

## Completion

The module is complete only when:

`CREATE → VERIFY → REGISTER → INTEGRATE → REMOVE OLD → VERIFY → COMMIT → DEPLOY → TEST`

has been successfully completed.
