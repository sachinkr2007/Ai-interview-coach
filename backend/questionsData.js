// =====================================================
// COLLEGE CAMPUS PLACEMENT - DOMAIN SUBTOPICS & QUESTION BANK
// Tailored for Freshers, College Students & Entry-Level Interviews
// =====================================================

export const DOMAIN_SUBTOPICS = {
  "Frontend Developer": [
    "HTML5 Basics, Semantic Tags & Forms",
    "CSS Fundamentals, Box Model, Flexbox & Centering",
    "JavaScript Variables (var/let/const), Data Types & Operators",
    "JavaScript Functions, Arrow Functions, Closures & Scope",
    "DOM Manipulation, Event Listeners & Event Bubbling",
    "Asynchronous JS: Callbacks, Promises & Async/Await",
    "React Basics: JSX, Components, Props vs State",
    "React Hooks: useState, useEffect & Event Handling",
    "Browser Storage: localStorage, sessionStorage & Cookies",
    "Basic Web Security & Form Validation"
  ],
  "Backend Developer": [
    "Client-Server Architecture & HTTP Methods (GET, POST, PUT, DELETE)",
    "HTTP Status Codes (200, 201, 400, 401, 404, 500)",
    "SQL Basics: Tables, Keys (Primary/Foreign), Joins & Aggregations",
    "SQL vs NoSQL Databases (MySQL vs MongoDB)",
    "Database Normalization (1NF, 2NF, 3NF)",
    "REST API Design Principles & JSON Data Exchange",
    "Authentication Basics: Passwords, Hashing & JWT Overview",
    "CRUD Operations & Database Connections in Node/Express/Python",
    "Error Handling & Middleware in Backend Apps",
    "Basic Server Deployment & Environment Variables"
  ],
  "Full Stack Developer": [
    "End-to-End Web App Flow (Frontend UI -> Backend API -> Database)",
    "Connecting React Frontend with Express/Flask Backend",
    "State Management & Fetching API Data using fetch/axios",
    "User Authentication Flow (Login, Register & Session Storage)",
    "Database CRUD Operations from UI",
    "Handling CORS Errors in Full Stack Apps",
    "Form Handling & Client/Server Validation",
    "Deployment Basics (Frontend on Vercel/Netlify, Backend on Render/Heroku)",
    "Git & GitHub Version Control Workflow"
  ],
  "Python Developer": [
    "Python Data Types: List, Tuple, Set & Dictionary",
    "List Comprehensions & String Operations",
    "Functions, *args, **kwargs & Lambda Functions",
    "Object-Oriented Programming (OOP): Class, Object, Inheritance, Polymorphism",
    "Exception Handling (try, except, finally)",
    "File Handling (Reading/Writing txt and csv files)",
    "Python Memory & Mutable vs Immutable Objects",
    "Built-in Modules & Pip Package Manager",
    "Basic Web Frameworks (Flask or FastAPI introduction)",
    "Common Algorithmic Questions (Palindrome, Fibonacci, Sorting)"
  ],
  "Java Developer": [
    "Core Java Basics: JDK, JRE & JVM Differences",
    "Java OOPs Concepts: Encapsulation, Inheritance, Polymorphism, Abstraction",
    "Method Overloading vs Method Overriding",
    "Constructors, 'this' and 'super' Keywords",
    "Java Collections Framework: ArrayList, LinkedList, HashMap, HashSet",
    "Exception Handling: Checked vs Unchecked Exceptions, try-catch-finally",
    "Interface vs Abstract Class in Java",
    "String vs StringBuilder vs StringBuffer",
    "Java Memory: Heap vs Stack",
    "Basic Spring Boot & REST API Concepts"
  ],
  "C++ Developer": [
    "C++ Fundamentals: Data Types, Loops, Functions & Arrays",
    "Pointers, References & Pointer Arithmetic",
    "Dynamic Memory Allocation: new, delete & Memory Leaks",
    "OOPs in C++: Classes, Access Specifiers, Constructors & Destructors",
    "Function Overloading & Operator Overloading",
    "Inheritance, Virtual Functions & Polymorphism",
    "Standard Template Library (STL): vector, map, stack, queue",
    "Structures vs Classes in C++",
    "Call by Value vs Call by Reference",
    "Basic Problem Solving: Reversing Strings, Searching & Sorting"
  ],
  "Data Analyst": [
    "SQL Queries: SELECT, WHERE, GROUP BY, HAVING, ORDER BY",
    "SQL Joins: INNER, LEFT, RIGHT, FULL OUTER",
    "Basic Statistics: Mean, Median, Mode, Standard Deviation",
    "Data Cleaning & Handling Missing/Null Values",
    "Excel Basics: VLOOKUP, XLOOKUP, Pivot Tables, SUMIF/COUNTIF",
    "Data Visualization: Bar charts, Line charts, Scatter plots",
    "Python for Data: Pandas DataFrames & NumPy Arrays",
    "Exploratory Data Analysis (EDA) Steps",
    "Understanding Business KPIs (Sales growth, Customer Churn)"
  ],
  "AI/ML Engineer": [
    "Basics of AI vs Machine Learning vs Deep Learning",
    "Supervised vs Unsupervised Learning with Examples",
    "Classification vs Regression Problems",
    "Training, Validation & Testing Dataset Splits",
    "Basic ML Algorithms: Linear Regression, Logistic Regression, Decision Trees",
    "Evaluation Metrics: Accuracy, Precision, Recall, Confusion Matrix",
    "Overfitting vs Underfitting and How to Prevent Them",
    "Popular Libraries: Scikit-learn, Pandas, NumPy",
    "Introduction to Neural Networks & Basic Activation Functions (ReLU, Sigmoid)",
    "What are Large Language Models (LLMs) and Generative AI?"
  ],
  "Data Scientist": [
    "Difference between Data Analyst, Data Engineer & Data Scientist",
    "Linear & Logistic Regression Intuition",
    "Hypothesis Testing Basics & What is a p-value",
    "Data Preprocessing, Scaling (Standardization vs Normalization)",
    "Feature Selection & Handling Categorical Variables",
    "Decision Trees & Random Forests Basics",
    "Basic Clustering: K-Means Algorithm",
    "Model Evaluation Metrics (MSE, RMSE, R-squared, ROC-AUC)",
    "Python Data Science Workflow (NumPy, Pandas, Matplotlib, Scikit-learn)"
  ],
  "DevOps Engineer": [
    "What is DevOps and why is it important in software engineering?",
    "Basics of Version Control with Git (commit, push, pull, branch, merge)",
    "What is Continuous Integration and Continuous Deployment (CI/CD)?",
    "What is Docker and what is a Container?",
    "Difference between Virtual Machine (VM) and Docker Container",
    "Basic Linux Commands (ls, cd, mkdir, grep, chmod, ps)",
    "What is Cloud Computing and basic services (AWS EC2, S3)?",
    "What is Kubernetes and why is it used?",
    "Importance of Monitoring, Logging and Environment Variables"
  ]
};

// =====================================================
// COLLEGE CAMPUS INTERVIEW QUESTION POOL
// =====================================================

export const DOMAIN_QUESTION_BANK = {
  "Frontend Developer": {
    "Technical": {
      "Easy": [
        "What is the difference between 'var', 'let', and 'const' in JavaScript?",
        "Explain the CSS Box Model (margin, border, padding, content).",
        "What are semantic HTML tags and why should we use them instead of just div tags?",
        "What is the difference between synchronous and asynchronous code in JavaScript?",
        "What is React and what is the difference between props and state?",
        "How do you center a div horizontally and vertically using CSS Flexbox?",
        "What is the difference between '==' and '===' in JavaScript?",
        "What is a component in React and what is JSX?"
      ],
      "Medium": [
        "What are Closures in JavaScript and can you give a simple example?",
        "Explain the 'useState' and 'useEffect' hooks in React with their common use cases.",
        "What is the DOM and how does event bubbling work in JavaScript?",
        "What is the difference between LocalStorage, SessionStorage, and Cookies?",
        "What is a Promise in JavaScript and how does async/await make asynchronous code easier to write?",
        "What is the difference between CSS Flexbox and CSS Grid?",
        "How do you fetch data from a REST API in a React component?"
      ],
      "Hard": [
        "How does the JavaScript Event Loop handle synchronous code, Microtasks, and Macrotasks?",
        "What is React's Virtual DOM and how does React optimize rendering compared to real DOM manipulation?",
        "What is CORS (Cross-Origin Resource Sharing) and how do you resolve CORS errors in frontend apps?",
        "How would you optimize the loading time and performance of a slow web page?",
        "Explain how you would implement client-side form validation and handle error messages cleanly."
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself, your educational background, and your interest in frontend development.",
        "What are your greatest technical strengths and one area you want to improve?",
        "Why do you want to work as a Frontend Developer?",
        "Where do you see yourself in the next 3 to 5 years in your engineering career?"
      ],
      "Medium": [
        "Tell me about a college project you built. What was your specific contribution to the project?",
        "Describe a difficult bug or challenge you faced during your project and how you solved it.",
        "How do you prioritize your tasks when you have multiple assignment deadlines?",
        "How do you handle feedback or suggestions from team members when working on a group project?"
      ],
      "Hard": [
        "If you are assigned a new frontend framework or tool that you haven't used before, how will you learn and deliver on time?",
        "Tell me about a time you had a disagreement with a project team member and how you reached a resolution."
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through the frontend project listed on your resume. What technologies did you use and why?",
        "How did you structure your components and state in your frontend project?",
        "How did you ensure your web application is responsive across mobile and desktop screens?",
        "If you had another month to work on your college project, what new features or improvements would you add?"
      ],
      "Hard": [
        "What was the most challenging technical feature you implemented in your project, and how did you approach it?",
        "How did you test your frontend project and handle unexpected user errors or empty data states?"
      ]
    }
  },

  "Backend Developer": {
    "Technical": {
      "Easy": [
        "What is the difference between SQL and NoSQL databases?",
        "Explain common HTTP methods: GET, POST, PUT, and DELETE.",
        "What is a Primary Key and Foreign Key in relational databases?",
        "What are common HTTP status codes like 200, 400, 404, and 500?",
        "What is a REST API and why is JSON commonly used for data transfer?",
        "What is the difference between Client-Side and Server-Side programming?"
      ],
      "Medium": [
        "Explain the concept of Database Normalization (1NF, 2NF, 3NF) with a simple example.",
        "What is middleware in Express.js or backend frameworks, and what is it used for?",
        "What is the difference between SQL INNER JOIN and LEFT JOIN?",
        "How does user authentication work with JWT (JSON Web Tokens)?",
        "What are ACID properties in database transactions?",
        "What is the difference between Authentication and Authorization?"
      ],
      "Hard": [
        "What is database indexing, how does it speed up queries, and what is its drawback?",
        "How do you prevent SQL Injection and secure your backend API against malicious attacks?",
        "How would you design a simple database schema for a student management or e-commerce system?",
        "How do you handle errors and exceptions gracefully across your backend API routes?"
      ]
    },
    "HR": {
      "Easy": [
        "Introduce yourself and tell us why you chose backend development.",
        "What programming languages and backend tools are you most comfortable working with?",
        "What motivates you to write clean and reliable backend code?"
      ],
      "Medium": [
        "Tell me about a backend API or database project you created in college.",
        "How do you test your backend endpoints to ensure they work properly before connecting to the frontend?",
        "Tell me about a time you worked in a team to build a software project."
      ],
      "Hard": [
        "How do you approach learning a new database or backend framework when required for a job?"
      ]
    },
    "Project Based": {
      "Medium": [
        "Explain the architecture and database schema of your backend project.",
        "How did you handle user registration, login, and password security in your project?",
        "What third-party packages or libraries did you use in your backend and why?"
      ],
      "Hard": [
        "What was the toughest bug you faced while creating your backend API and how did you debug it?"
      ]
    }
  },

  "Full Stack Developer": {
    "Technical": {
      "Easy": [
        "What is the role of a Full Stack Developer and what layers does a web app contain?",
        "What happens in the background when a user clicks a 'Submit' button on a form in a web app?",
        "What is the difference between frontend routing and backend routing?",
        "What is CORS and why do browsers block requests between different ports or domains?"
      ],
      "Medium": [
        "How does data flow from a React frontend form to an Express backend and MongoDB database?",
        "How do you store and use JWT tokens in the frontend after a user logs in?",
        "What are the advantages of using REST APIs compared to traditional server-rendered pages?",
        "How do you handle loading spinners and error messages in the frontend when waiting for backend responses?"
      ],
      "Hard": [
        "How would you structure a full-stack project repository and organize files for frontend and backend?",
        "How do you ensure data validation happens on both the frontend (UI) and backend (server)?",
        "How would you deploy a full-stack application online (e.g. Vercel for frontend, Render for backend)?"
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself and your journey in full-stack web development.",
        "Do you enjoy frontend or backend more, and why?"
      ],
      "Medium": [
        "Walk me through a full-stack application you built from scratch in college.",
        "How did you manage your time when building both the UI and backend logic for your project?"
      ],
      "Hard": [
        "Tell me about a time you had to debug an issue that involved both frontend state and backend database data."
      ]
    },
    "Project Based": {
      "Medium": [
        "Explain the full tech stack you used for your project and the purpose of each technology.",
        "How did you design the database models and connect them with your UI components?"
      ],
      "Hard": [
        "What security measures (like password hashing, input validation) did you include in your project?"
      ]
    }
  },

  "Python Developer": {
    "Technical": {
      "Easy": [
        "What is the difference between a List and a Tuple in Python?",
        "What are Python's four core OOP principles (Inheritance, Polymorphism, Encapsulation, Abstraction)?",
        "What is the difference between '==' and 'is' operators in Python?",
        "What are mutable and immutable data types in Python? Give examples.",
        "What is a Dictionary in Python and how do you access keys and values?"
      ],
      "Medium": [
        "What are List Comprehensions in Python and why are they preferred over standard for-loops?",
        "What is the difference between *args and **kwargs in Python functions?",
        "Explain Exception Handling in Python using try, except, else, and finally blocks.",
        "What are Python Lambda functions and where are they commonly used?",
        "What is the purpose of '__init__' method and 'self' keyword in Python classes?"
      ],
      "Hard": [
        "What is a Python Generator and how does the 'yield' keyword help save memory?",
        "What is a Decorator in Python and can you explain how you would write a simple decorator?",
        "What is the difference between Deep Copy and Shallow Copy in Python?",
        "How do you handle reading and writing large files efficiently in Python?"
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself and why Python is your preferred programming language.",
        "What kind of Python projects have you enjoyed building the most in college?"
      ],
      "Medium": [
        "Describe a programming problem or project where you used Python to find an effective solution.",
        "How do you test and debug your Python code when you get unexpected errors?"
      ],
      "Hard": [
        "Tell me about a time you optimized a slow Python script or algorithm to run faster."
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through your Python project: what problem does it solve and how does it work?",
        "What Python libraries (like Pandas, Flask, Tkinter, etc.) did you use in your project and why?"
      ],
      "Hard": [
        "What was the most challenging algorithm or logic you implemented in your Python project?"
      ]
    }
  },

  "Java Developer": {
    "Technical": {
      "Easy": [
        "What is the difference between JDK, JRE, and JVM?",
        "Explain the four main OOP concepts in Java with real-world examples.",
        "What is the difference between Method Overloading and Method Overriding?",
        "What is the difference between an Abstract Class and an Interface in Java?",
        "What is the difference between '==' and '.equals()' method in Java?"
      ],
      "Medium": [
        "What is the Java Collections Framework? Explain the difference between ArrayList and LinkedList.",
        "What is the difference between HashMap and HashSet in Java?",
        "Explain Java Exception Handling: Checked vs Unchecked Exceptions.",
        "What is the difference between String, StringBuilder, and StringBuffer?",
        "What is the purpose of 'static' and 'final' keywords in Java?"
      ],
      "Hard": [
        "How does Java Garbage Collection work and what is the difference between Heap and Stack memory?",
        "What is Multithreading in Java and how do you create a thread using Thread class vs Runnable interface?",
        "What are Java 8 Streams and Lambda expressions, and how do they simplify data processing?",
        "What is Spring Boot and how does Dependency Injection (DI) work in simple terms?"
      ]
    },
    "HR": {
      "Easy": [
        "Introduce yourself and tell us why you chose Java as your core programming language.",
        "What are your strengths when solving problems using Java?"
      ],
      "Medium": [
        "Tell me about a Java project or application you developed during your degree.",
        "How do you approach finding errors and debugging your Java code?"
      ],
      "Hard": [
        "Tell me about a challenging assignment in college and how you managed to complete it successfully."
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through the Java application you built. How did you design its classes and methods?",
        "Did you connect your Java project to a database (like MySQL using JDBC)? How did that work?"
      ],
      "Hard": [
        "What was the most complex feature in your Java project and how did you test it?"
      ]
    }
  },

  "C++ Developer": {
    "Technical": {
      "Easy": [
        "What are Pointers in C++ and how do they differ from References?",
        "What are the four pillars of Object-Oriented Programming (OOP) in C++?",
        "What is the difference between 'new' / 'delete' in C++ and 'malloc' / 'free' in C?",
        "What is a Constructor and Destructor in C++ classes?",
        "What is Function Overloading in C++?"
      ],
      "Medium": [
        "What is the difference between Call by Value and Call by Reference in C++?",
        "What are Virtual Functions and Pure Virtual Functions in C++?",
        "What is the C++ Standard Template Library (STL) and how do you use 'vector' and 'map'?",
        "What is the difference between a Structure and a Class in C++?",
        "What is operator overloading and can you give a simple example?"
      ],
      "Hard": [
        "What are memory leaks in C++ and how can you prevent them using smart pointers (unique_ptr, shared_ptr)?",
        "What is runtime polymorphism and how does the Virtual Table (VTABLE) mechanism work in C++?",
        "Explain the difference between deep copy and shallow copy when copying C++ objects."
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself and your background in C++ programming.",
        "Why do you prefer C++ for problem solving and data structures?"
      ],
      "Medium": [
        "Tell me about a problem where pointer or memory debugging took significant time and how you resolved it."
      ],
      "Hard": [
        "How do you approach writing clean, readable C++ code without memory leaks?"
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through the C++ project you built and what data structures you utilized.",
        "How did you organize your classes, header files, and main function in your project?"
      ],
      "Hard": [
        "What was the most challenging technical part of your C++ project?"
      ]
    }
  },

  "Data Analyst": {
    "Technical": {
      "Easy": [
        "What is the difference between WHERE and HAVING clauses in SQL?",
        "Explain the different types of SQL JOINs: INNER, LEFT, RIGHT, and FULL JOIN.",
        "What is the difference between Mean, Median, and Mode, and when is Median better than Mean?",
        "What is the difference between qualitative and quantitative data?",
        "How do you check for and handle missing or NULL values in a dataset?"
      ],
      "Medium": [
        "How do you use SQL GROUP BY and aggregate functions like COUNT, SUM, and AVG?",
        "What is the difference between VLOOKUP and XLOOKUP in Microsoft Excel?",
        "What is Exploratory Data Analysis (EDA) and what are the first steps you take when given a dataset in Python (Pandas)?",
        "What type of chart would you choose to show sales trends over time versus comparing categories?",
        "What is an Outlier in data and how do you detect one?"
      ],
      "Hard": [
        "What is the difference between correlation and causation? Give a simple real-world example.",
        "How would you analyze customer churn rate and present the key factors to a manager?",
        "Explain how you would write a SQL query to find the top 3 highest-earning employees in each department."
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself and why you want to become a Data Analyst.",
        "What data tools (like Excel, SQL, Tableau, Python) are you most confident using?"
      ],
      "Medium": [
        "Tell me about a data project or dataset you analyzed in college. What was the most interesting finding?",
        "How do you explain technical data findings and charts to someone without a technical background?"
      ],
      "Hard": [
        "Describe a situation where the data was messy or had lots of missing records. How did you clean it?"
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through the data analysis project on your resume: what was the dataset and what insights did you discover?",
        "What charts and visualizations did you create in your project to present your insights?"
      ],
      "Hard": [
        "If you were given more data for your project, what additional questions would you try to answer?"
      ]
    }
  },

  "AI/ML Engineer": {
    "Technical": {
      "Easy": [
        "What is the basic difference between Supervised and Unsupervised Learning?",
        "What is the difference between Classification and Regression in Machine Learning?",
        "What is the purpose of splitting data into Training and Testing sets?",
        "What is Overfitting and what is one simple way to prevent it?",
        "Name 3 popular Python libraries used in Machine Learning and explain what they do."
      ],
      "Medium": [
        "Explain Linear Regression and Logistic Regression in simple terms.",
        "Why is Accuracy not always a good metric for imbalanced datasets, and what are Precision and Recall?",
        "What is a Confusion Matrix and what do True Positive and False Positive mean?",
        "What is the purpose of Feature Scaling (Standardization / Normalization) before training a model?",
        "What is a Decision Tree and how does it make predictions?"
      ],
      "Hard": [
        "Explain the Bias-Variance Tradeoff in Machine Learning in simple words.",
        "What is a Neural Network and what is the role of an Activation Function like ReLU?",
        "What are Large Language Models (like ChatGPT) and what is Prompt Engineering?"
      ]
    },
    "HR": {
      "Easy": [
        "Introduce yourself and tell us what inspired your interest in Artificial Intelligence and Machine Learning.",
        "How do you keep yourself updated with new AI trends and tools?"
      ],
      "Medium": [
        "Tell me about a machine learning model or AI project you trained in college.",
        "How did you prepare and clean your dataset before feeding it into your machine learning algorithm?"
      ],
      "Hard": [
        "Tell me about a time your model gave poor accuracy and the steps you took to improve its performance."
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through your Machine Learning project: problem statement, dataset, algorithm, and final results.",
        "What evaluation metrics did you use to measure the performance of your model in your project?"
      ],
      "Hard": [
        "What challenges did you face during data collection or model training in your project and how did you overcome them?"
      ]
    }
  },

  "Data Scientist": {
    "Technical": {
      "Easy": [
        "What is the difference between a Data Analyst and a Data Scientist?",
        "What is the difference between Supervised and Unsupervised Machine Learning?",
        "What is a p-value in statistics in simple terms?",
        "What are the steps involved in a typical Data Science project lifecycle?",
        "What is the difference between continuous and categorical variables?"
      ],
      "Medium": [
        "Explain Linear Regression vs Logistic Regression with examples.",
        "What is Cross-Validation (K-Fold) and why is it used?",
        "What is the difference between Random Forest and a single Decision Tree?",
        "How do you handle categorical features (One-Hot Encoding vs Label Encoding)?",
        "What is K-Means Clustering and how does it group data points?"
      ],
      "Hard": [
        "What is Dimensionality Reduction and why would you use PCA (Principal Component Analysis)?",
        "Explain Type I error (False Positive) and Type II error (False Negative) with an example.",
        "How would you build a machine learning model to predict student placement or customer churn?"
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself and your passion for Data Science and problem solving.",
        "Which programming tools and statistical libraries do you use most often?"
      ],
      "Medium": [
        "Describe a Data Science project you worked on. What business question were you trying to answer?",
        "How do you explain statistical predictions and probabilities to a non-technical manager?"
      ],
      "Hard": [
        "Tell me about a time when your hypothesis or model results did not match your initial expectations."
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through your Data Science project from hypothesis, data preprocessing to model training and conclusions.",
        "What feature engineering steps did you perform on your dataset in your project?"
      ],
      "Hard": [
        "How did you validate that your model is not overfitting on the training data?"
      ]
    }
  },

  "DevOps Engineer": {
    "Technical": {
      "Easy": [
        "What is DevOps and what problem does it solve in software development?",
        "What is Git and what is the difference between 'git pull' and 'git fetch'?",
        "What is Continuous Integration (CI) and Continuous Deployment (CD)?",
        "What is Docker and why are containers useful for developers?",
        "What is the difference between a Virtual Machine (VM) and a Docker Container?"
      ],
      "Medium": [
        "What is a Dockerfile and what are common commands like FROM, RUN, COPY, and CMD?",
        "What is Cloud Computing and what are common services like AWS EC2 (Compute) and S3 (Storage)?",
        "What are Environment Variables and why should API keys never be committed to Git?",
        "What is Kubernetes and how does it relate to Docker?",
        "What are common Linux commands for checking running processes and file permissions (ps, top, chmod)?"
      ],
      "Hard": [
        "How does a basic CI/CD pipeline work using GitHub Actions (from code push to automated test and deployment)?",
        "What is Infrastructure as Code (IaC) and why is Terraform popular?",
        "Why is server monitoring and logging important in production environments?"
      ]
    },
    "HR": {
      "Easy": [
        "Tell me about yourself and why you are interested in DevOps and cloud infrastructure.",
        "What operating systems and tools are you most familiar with?"
      ],
      "Medium": [
        "Tell me about a project where you automated a task or deployed an application using Git and cloud tools.",
        "How do you handle team collaboration when multiple developers are pushing code to the same repository?"
      ],
      "Hard": [
        "Describe a time you encountered a deployment or build failure and how you diagnosed the error logs."
      ]
    },
    "Project Based": {
      "Medium": [
        "Walk me through how you deployed and hosted your project online.",
        "What version control and CI/CD tools did you use while working on your project?"
      ],
      "Hard": [
        "How did you manage environment variables and secure keys in your deployed project?"
      ]
    }
  }
};

// Generic fallback for any unrecognized role
export const GENERIC_QUESTIONS = {
  "Technical": [
    "What is the difference between frontend and backend in simple words?",
    "What is a variable in programming, and why do we use it?",
    "What is a database and why is it important?",
    "What is an API in simple words?",
    "What programming language do you like the most, and why?"
  ],
  "HR": [
    "Could you please introduce yourself in two to three simple sentences?",
    "What are your main technical strengths?",
    "Why do you want to work as a software developer?",
    "Where do you see yourself in the next two years?"
  ],
  "Project Based": [
    "Can you explain what your college project does in simple words?",
    "Which programming language did you use in your project?",
    "What feature did you enjoy building the most in your project?",
    "If you could add one new feature to your project, what would it be?"
  ]
};

// =====================================================
// UTILITY FUNCTIONS FOR RANDOMIZATION
// =====================================================

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomSubtopics(role, count = 3) {
  const subtopics = DOMAIN_SUBTOPICS[role] || DOMAIN_SUBTOPICS["Frontend Developer"];
  return shuffleArray(subtopics).slice(0, count);
}

export function getRandomQuestionsFromBank({
  role = "Frontend Developer",
  type = "Technical",
  difficulty = "Medium",
  count = 5,
  excludeQuestions = []
}) {
  const excludeSet = new Set(
    excludeQuestions.map((q) => String(q).trim().toLowerCase())
  );

  const roleBank = DOMAIN_QUESTION_BANK[role] || DOMAIN_QUESTION_BANK["Frontend Developer"];
  let pool = [];

  if (type === "Technical") {
    const techPool = roleBank["Technical"]?.[difficulty] || [];
    const otherTechPool = Object.entries(roleBank["Technical"] || {})
      .filter(([d]) => d !== difficulty)
      .flatMap(([, qs]) => qs);
    pool = [...techPool, ...otherTechPool];
  } else if (type === "HR") {
    const hrPool = roleBank["HR"]?.[difficulty] || [];
    const otherHrPool = Object.entries(roleBank["HR"] || {})
      .filter(([d]) => d !== difficulty)
      .flatMap(([, qs]) => qs);
    pool = [...hrPool, ...otherHrPool];
  } else if (type === "Technical + HR") {
    const tech = shuffleArray(roleBank["Technical"]?.[difficulty] || roleBank["Technical"]?.["Medium"] || []);
    const hr = shuffleArray(roleBank["HR"]?.[difficulty] || roleBank["HR"]?.["Medium"] || []);
    const combined = [];
    const maxLen = Math.max(tech.length, hr.length);
    for (let i = 0; i < maxLen; i++) {
      if (tech[i]) combined.push(tech[i]);
      if (hr[i]) combined.push(hr[i]);
    }
    pool = combined;
  } else if (type === "Project Based") {
    const projPool = roleBank["Project Based"]?.[difficulty] || roleBank["Project Based"]?.["Medium"] || [];
    const otherProj = Object.entries(roleBank["Project Based"] || {})
      .filter(([d]) => d !== difficulty)
      .flatMap(([, qs]) => qs);
    pool = [...projPool, ...otherProj, ...(roleBank["Technical"]?.[difficulty] || [])];
  } else {
    pool = roleBank["Technical"]?.[difficulty] || GENERIC_QUESTIONS["Technical"];
  }

  if (type === "HR") {
    pool.push(...GENERIC_QUESTIONS["HR"]);
  } else if (type === "Project Based") {
    pool.push(...GENERIC_QUESTIONS["Project Based"]);
  } else {
    pool.push(...GENERIC_QUESTIONS["Technical"]);
  }

  const available = pool.filter((q) => !excludeSet.has(q.trim().toLowerCase()));
  const shuffled = shuffleArray(available.length > 0 ? available : pool);

  return shuffled.slice(0, count);
}
