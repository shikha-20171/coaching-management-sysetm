CREATE TABLE institutes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  manager VARCHAR(120),
  contact VARCHAR(30),
  status VARCHAR(40) DEFAULT 'Active'
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'student') NOT NULL
);

CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  institute_id INT,
  title VARCHAR(160) NOT NULL,
  fees DECIMAL(10,2) NOT NULL,
  category VARCHAR(80),
  duration VARCHAR(80),
  mentor VARCHAR(120),
  mode VARCHAR(60),
  FOREIGN KEY (institute_id) REFERENCES institutes(id)
);

CREATE TABLE batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  institute_id INT,
  course_id INT,
  name VARCHAR(120) NOT NULL,
  schedule VARCHAR(120),
  room VARCHAR(80),
  capacity INT DEFAULT 30,
  status VARCHAR(40) DEFAULT 'Active',
  FOREIGN KEY (institute_id) REFERENCES institutes(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  institute_id INT,
  batch_id INT,
  course_id INT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30),
  guardian_name VARCHAR(120),
  city VARCHAR(80),
  attendance INT DEFAULT 0,
  marks INT DEFAULT 0,
  progress INT DEFAULT 0,
  joined_on DATE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (institute_id) REFERENCES institutes(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(40) DEFAULT 'pending',
  due_date DATE,
  paid_on DATE,
  installment VARCHAR(80),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(30) NOT NULL,
  subject VARCHAR(80),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE tests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  date DATE NOT NULL,
  max_marks INT DEFAULT 100,
  average_score INT DEFAULT 0,
  status VARCHAR(40) DEFAULT 'Scheduled',
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  audience VARCHAR(40) DEFAULT 'all',
  priority VARCHAR(40) DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
