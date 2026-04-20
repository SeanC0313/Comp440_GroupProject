# COMP440 Team 10 - Project Phase 2

## Team Members
- Tyra Quiachon
- Sean Cano
- Renata Dantanarayana

##  Video
- https://www.youtube.com/watch?v=lMfTpBzNkKU

## Server
- https://seanc0313.github.io/Comp440_GroupProject/

## GitHub
- https://github.com/SeanC0313/Comp440_GroupProject/tree/main

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MySQL

## Phase 2 Features

### 1. Insert Rental Unit
Users can add a rental unit through the interface by entering:
- Title
- Description
- Feature
- Price

Each rental unit is stored in the MySQL database.

### 2. Auto-Generated Rental Unit IDs
Rental unit IDs are generated automatically using MySQL's **AUTO_INCREMENT** feature, as required.

### 3. Daily Rental Posting Limit
The system enforces the rule that a user can post **at most 2 rental units per day**.

### 4. Search by Feature
Users can search for rental units by entering a feature.  
The application then returns all matching rental units and displays the results in a list/table format.

### 5. Submit Reviews
Users can select a rental unit and submit a review that includes:
- A rating chosen from:
  - Excellent
  - Good
  - Fair
  - Poor
- A written description

### 6. Review Restrictions
The application enforces all required review rules:
- A user can submit **at most 3 reviews per day**
- A user **cannot review their own rental unit**
- A user can review a rental unit **only once**

## Database Integration
Our user interface is fully connected to a MySQL database.  
The required constraints for rental posting and review submission are enforced through the backend and database logic.

## Summary
In this phase, we successfully demonstrated:
- insertion of rental units
- automatic generation of rental unit IDs
- enforcement of the 2-rentals-per-day rule
- searching rental units by feature
- writing reviews
- enforcement of all required review restrictions
