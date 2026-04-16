CREATE DATABASE IF NOT EXISTS comp440;
USE comp440;

CREATE TABLE IF NOT EXISTS user (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL
);

/* phase 2 */

CREATE TABLE IF NOT EXISTS rental_unit (
  rentalID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  datePosted DATE NOT NULL,
  FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE IF NOT EXISTS feature (
  rentalID INT NOT NULL,
  feature VARCHAR(50) NOT NULL,
  PRIMARY KEY (rentalID, feature),
  FOREIGN KEY (rentalID) REFERENCES rental_unit(rentalID)
);

CREATE TABLE IF NOT EXISTS review (
  reviewID INT AUTO_INCREMENT PRIMARY KEY,
  rentalID INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  score ENUM('Excellent', 'Good', 'Fair', 'Poor') NOT NULL,
  remark TEXT,
  datePosted DATE NOT NULL,
  FOREIGN KEY (rentalID) REFERENCES rental_unit(rentalID),
  FOREIGN KEY (username) REFERENCES user(username)
);