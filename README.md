# Volunteer Management Web Application
A web-based platform for non-profit organizations to manage volunteer registration, event creation, and volunteer assignment efficiently.

# Problem Statement
This project addresses the challenge of matching volunteers with events that align with their:

Location

Skills and preferences

Availability

Task urgency and event requirements

The system provides both administrators and volunteers with tools to interact with and manage event participation.

# Key Features
# User & Volunteer Management
Login & Registration (with email validation)

Profile Management (full name, address, state, zip code, skills, preferences, availability)

# Event Management
Admins can create events with:

Name, description, location

Required skills

Urgency level

Event date

# Matching System
Automatically matches volunteers to suitable events based on:

Skill overlap

Availability

Location

# Notifications
Event assignment notifications

Updates and reminders for volunteers

# Participation History
Track all historical participation data by volunteer

Export to CSV

# Tech Stack
Frontend:  HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: MySQL

Testing: Jest, Supertest

File Exports: CSV using csv-writer and PDF using pdfkit

#  Database Schema Overview

Table	Description
UserCredentials	Stores login info (ID, encrypted password)
UserProfile	Stores name, address, state, zip, skills, preferences, availability
EventDetails	Stores event metadata (name, date, location, skills, urgency)
VolunteerHistory	Tracks past participation
States	Stores U.S. state codes

# Functional Modules
Backend
Login Module

User Profile Management

Event Management

Volunteer Matching

Notification System

Volunteer History

Frontend (Expected UI)
Login/Register

Profile Form

Event Form

Matching Interface

Notification UI

Participation Table

#  Testing & Coverage
All core logic is covered by unit tests (jest + supertest)

Code coverage maintained above 80%

Run tests:

bash
Copy
Edit
npm test

#  Getting Started
Clone this repo

Install dependencies: npm install

Configure .env files

Start the server: npm run dev

Run tests: npm test or npx jest --coverage
