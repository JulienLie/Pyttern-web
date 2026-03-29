# Pyttern Visualizer — UX Validation Test Report

## Overview

| Item             | Detail                                                           |
|------------------|------------------------------------------------------------------|
| **Tool**         | Pyttern Visualizer (Compound Pattern)                            |
| **Goal**         | Validate the usability of the compound pattern matching workflow |
| **Participants** | participants with basic programming knowledge                    |
| **Duration**     | ~2 hours                                                         |
| **Method**       | Moderated task-based usability test + post-test questionnaire    |

---

## Test Flow

| Phase                                                                                 | Duration |
|---------------------------------------------------------------------------------------|----------|
| 1. Introduction & Demo                                                                | ~20 min  |
| 2. Task A — Basic Compound (with During-Test Questionnaire)                           | ~35 min  |
| 3. Task B — Complex Compound (with During-Test Questionnaire)                         | ~45 min  |
| 4. Post-Test Questionnaire (SUS + extra questions related with the tool for feedback) | ~20 min  |

---

## Phase 1 — Introduction & Demo (~20 min)

### 1.1 Welcome & Context

Read the following to the participant:

> "Thank you for participating in this usability test. We are evaluating a tool called **Pyttern Visualizer**, which helps analyze Python source code files against predefined patterns. Your feedback will help us improve the tool. There are no right or wrong answers — we are testing the tool, not you."

### 1.2 Explain Core Concepts

Explain the following concepts to the participant before starting the tasks:

1. **What is Pyttern?**
   - Pyttern is a pattern matching tool for Python source code.
   - A **pattern** (`.pyt` file) describes a code structure using wildcards (`?` for single element, `?*` for zero or more elements).
   - When a code file is checked against a pattern, the result is either **matched** or **not matched**.

2. **What is a Compound Pattern?**
   - A compound pattern combines multiple sub-patterns using logical operators (**AND**, **OR**, **NOT**) arranged in a tree structure.
   - The compound pattern is represented as a folder structure on disk, where folder names define the operators and `.pyt` files are the leaf patterns.
   - A code file **matches** the compound pattern only if it satisfies the full logical tree.

3. **What is "Not Validated"?**
   - If a code file has syntax errors or cannot be parsed, it is marked as **not validated** — the tool cannot determine a match result.

4. **Show the Compound Page screenshot for a quick overview**

### 1.3 Show an Example

Walk the participant through a minimal example:
- Show a simple `.pyt` pattern file and a Python code file.
- Show how a compound pattern tree is structured (folders = operators, files = patterns).

### 1.4 Set the Scenario

Read the following to the participant:

> "For the following tasks, imagine you are a **programming instructor**. You have given your students a coding assignment and received their submissions. You want to use the Pyttern Visualizer to check which students followed the expected coding patterns and which did not."

---

## Phase 2 — Task A: Basic Compound Pattern (~35 min)

### Scenario

Read the following to the participant:

> "You are teaching an introductory Python class. You assigned your students to implement a `Calculator` class. You have received 5 student submissions and you want to check whether they follow good coding practices.
>
> You are given 3 pattern files. Each pattern detects a specific code structure. Your task is to **build a compound pattern** named **`ProperClassInit`** that combines these patterns to enforce the following rule:
>
> **A proper class initialization means: the class has an `__init__` method, AND the class has at least one method that returns a value, AND the `__init__` method does NOT return a value.**
>
> Once you have built the compound pattern, upload the student code files and analyze the results."

### Materials Given to the Participant

**3 pattern files (loose `.pyt` files):**

| File                    | What it detects                                     |
|-------------------------|-----------------------------------------------------|
| `has_class_init.pyt`    | A class that has an `__init__` method               |
| `has_method_return.pyt` | A class that has a method with a `return` statement |
| `has_init_return.pyt`   | A class whose `__init__` method returns a value     |

**5 student code files** (`TaskA/Codes/` folder):
`student_A1.py`, `student_A2.py`, `student_A3.py`, `student_A4.py`, `student_A5.py`

### What the Participant Needs to Do

1. Open the Pyttern Visualizer in your browser.
2. **Build a compound pattern** named `ProperClassInit` using the 3 pattern files and the logical operators (AND, NOT) to encode the rule described above.
3. Upload the 5 student code files.
4. Analyze the results and answer the questions below.

### Expected Compound Pattern Structure (Answer Key — not shown to participant)

```
ProperClassInit (root)
└── AND
    ├── has_class_init.pyt       — class must have __init__
    ├── has_method_return.pyt    — class must have a method with return
    └── NOT
        └── has_init_return.pyt  — __init__ must NOT return a value
```

### Task A — Questions

**Q1.** Which student submissions **matched** the compound pattern? *(List the file names.)*

> **Expected Answer:** `student_A1.py`, `student_A4.py`

**Q2.** Which student submissions did **not match** the compound pattern? *(List the file names.)*

> **Expected Answer:** `student_A2.py`, `student_A3.py`

**Q3.** Were there any submissions that could **not be validated**? If so, which ones?

> **Expected Answer:** `student_A5.py`

**Q4.** How many files matched the compound pattern in total?

> **Expected Answer:** 2

**Q5.** Which files matched both `has_class_init` and `has_method_return`? *(List the file names.)*

> **Expected Answer:** `student_A1.py`, `student_A2.py`, `student_A4.py`

**Q6.** For the file that has a validation error, what is the exact problem? *(Name the file and explain briefly.)*

> **Expected Answer (open-ended):** `student_A5.py` — missing colons after method definitions.

### Expected Results Summary (Task A)

| File          | has_class_init | has_method_return | has_init_return |  Compound Result  |
|---------------|:--------------:|:-----------------:|:---------------:|:-----------------:|
| student_A1.py |     Match      |       Match       |    No Match     |     **Match**     |
| student_A2.py |     Match      |       Match       |      Match      |   **No Match**    |
| student_A3.py |     Match      |     No Match      |    No Match     |   **No Match**    |
| student_A4.py |     Match      |       Match       |    No Match     |     **Match**     |
| student_A5.py |       —        |         —         |        —        | **Not Validated** |

---

## Phase 3 — Task B: Complex Compound Pattern (~45 min)

### Scenario

Read the following to the participant:

> "You are now teaching an advanced Python class. You assigned your students to implement a **Vehicle hierarchy** — a base `Vehicle` class and a subclass (e.g., `Car`, `Truck`, `Bus`). You have received 12 student submissions.
>
> You are given 5 pattern files. Your task is to **build a compound pattern** named **`ProperInheritance`** that combines these patterns to enforce the following rule:
>
> **Proper inheritance means: the code has a parent class and a child class that inherits from it, AND the child class calls `super().__init__()`, AND the `__init__` method does NOT return a value, AND the code has at least one method that either returns a value directly OR has an early return inside a conditional block.**
>
> Once you have built the compound pattern, upload all 12 student code files and analyze the results."

### Materials Given to the Participant

**5 pattern files (loose `.pyt` files):**

| File                    | What it detects                                                      |
|-------------------------|----------------------------------------------------------------------|
| `has_parent_child.pyt`  | A parent class and a child class that inherits from it               |
| `has_super_init.pyt`    | A child class that calls `super().__init__()` in its constructor     |
| `has_init_return.pyt`   | A class whose `__init__` method returns a value                      |
| `has_early_return.pyt`  | A class with a method that has a `return` inside a conditional block |
| `has_method_return.pyt` | A class with a method that has a direct `return` statement           |

**12 student code files** (`TaskB/Codes/` folder):
`student_B01.py` through `student_B12.py` (including `student_B11.py`)

### What the Participant Needs to Do

1. **Build a compound pattern** named `ProperInheritance` using the 5 pattern files and the logical operators (AND, OR, NOT) to encode the rule described above.
2. Upload all 12 student code files.
3. Analyze the results using the visualization and filter features.
4. Answer the questions below.

### Expected Compound Pattern Structure (Answer Key — not shown to participant)

```
ProperInheritance (root)
└── AND
    ├── has_parent_child.pyt     — must have parent class + child class inheriting from it
    ├── has_super_init.pyt       — child must call super().__init__()
    ├── NOT
    │   └── has_init_return.pyt  — __init__ must NOT return a value
    └── OR
        ├── has_early_return.pyt — a method has a return inside a conditional
        └── has_method_return.pyt — a method has a direct return statement
```

### Task B — Questions

**Q1.** Which student submissions **matched** the full compound pattern? *(List the file names.)*

> **Expected Answer:** `student_B01.py`, `student_B02.py`, `student_B03.py`, `student_B10.py`

**Q2.** Which student submissions did **not match** the compound pattern? *(List the file names.)*

> **Expected Answer:** `student_B04.py`, `student_B05.py`, `student_B06.py`, `student_B07.py`, `student_B08.py`, `student_B09.py`, `student_B12.py`

**Q3.** Were there any submissions that is not validated**? If so, which ones and what was the issue?

> **Expected Answer:** `student_B11.py` — it has syntax errors (missing colons after `__init__` and `off_road` method definitions).

**Q4.** How many files matched the compound pattern in total?

> **Expected Answer:** 4

**Q5.** How many files matched both `has_parent_child` and `has_super_init`?

> **Expected Answer:** 8

**Q6.** Which submissions matched `has_parent_child` but did **not** match `has_super_init`?

> **Expected Answer:** `student_B05.py`, `student_B08.py` — these have parent-child inheritance but the child class does not call `super().__init__()`.


### Expected Results Summary (Task B)

| File        | has_parent_child | has_super_init | has_init_return | has_early_return | has_method_return |     Compound      |
|-------------|:----------------:|:--------------:|:---------------:|:----------------:|:-----------------:|:-----------------:|
| student_B01 |      Match       |     Match      |    No Match     |     No Match     |       Match       |     **Match**     |
| student_B02 |      Match       |     Match      |    No Match     |      Match       |     No Match      |     **Match**     |
| student_B03 |      Match       |     Match      |    No Match     |      Match       |       Match       |     **Match**     |
| student_B04 |      Match       |     Match      |      Match      |     No Match     |       Match       |   **No Match**    |
| student_B05 |      Match       |    No Match    |    No Match     |     No Match     |       Match       |   **No Match**    |
| student_B06 |     No Match     |    No Match    |    No Match     |      Match       |       Match       |   **No Match**    |
| student_B07 |      Match       |     Match      |    No Match     |     No Match     |     No Match      |   **No Match**    |
| student_B08 |      Match       |    No Match    |    No Match     |      Match       |       Match       |   **No Match**    |
| student_B09 |     No Match     |    No Match    |    No Match     |     No Match     |     No Match      |   **No Match**    |
| student_B10 |      Match       |     Match      |    No Match     |     No Match     |       Match       |     **Match**     |
| student_B11 |        —         |       —        |        —        |        —         |         —         | **Not Validated** |
| student_B12 |      Match       |     Match      |      Match      |      Match       |     No Match      |   **No Match**    |

---

## Phase 4 — Post-Test Questionnaire (~20 min)

### Part A: System Usability Scale (SUS) — 10 Questions

*Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).*

| #  | Statement                                                                                  |
|----|--------------------------------------------------------------------------------------------|
| 1  | I think that I would like to use this system frequently.                                   |
| 2  | I found the system unnecessarily complex.                                                  |
| 3  | I thought the system was easy to use.                                                      |
| 4  | I think that I would need the support of a technical person to be able to use this system. |
| 5  | I found the various functions in this system were well integrated.                         |
| 6  | I thought there was too much inconsistency in this system.                                 |
| 7  | I would imagine that most people would learn to use this system very quickly.              |
| 8  | I found the system very cumbersome to use.                                                 |
| 9  | I felt very confident using the system.                                                    |
| 10 | I needed to learn a lot of things before I could get going with this system.               |

**SUS Scoring:** For odd-numbered questions, subtract 1 from the score. For even-numbered questions, subtract the score from 5. Sum all adjusted scores and multiply by 2.5. Result is on a 0–100 scale.

### Part B: Workflow-Specific Questions — 4 Questions

*Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).*

| #  | Statement                                                                                          |
|----|----------------------------------------------------------------------------------------------------|
| 11 | I found it easy to understand the compound pattern structure (the tree with AND/OR/NOT operators). |
| 12 | The filter feature helped me find specific match results efficiently.                              |
| 13 | I could clearly distinguish between matched, not-matched, and not-validated files.                 |
| 14 | The tool would be useful for analyzing student submissions in a real teaching scenario.            |

### Part C: Open-Ended — 1 Question

| #  | Question                                                                                                                             |
|----|--------------------------------------------------------------------------------------------------------------------------------------|
| 15 | What would you improve or change about the tool? Please describe any difficulties you experienced or features you would like to see. |

---

## What to Observe During Tasks

- **Compound pattern construction:** Did the participant build the correct tree structure? Where did they struggle?
- **Task completion:** Did the participant complete each question correctly?
- **Time on task:** How long did each task take?
- **Confusion points:** Where did the participant hesitate, ask questions, or express confusion?
- **Navigation:** Did the participant find the upload, filter, and visualization features easily?
- **How many times you had to help:** The number of times you were called for help.

---

## Answer Key Summary

### Task A Correct Answers

| Question                                          | Answer                                            |
|---------------------------------------------------|---------------------------------------------------|
| Q1 — Matched                                      | `student_A1.py`, `student_A4.py`                  |
| Q2 — Not Matched                                  | `student_A2.py`, `student_A3.py`                  |
| Q3 — Not Validated                                | `student_A5.py`                                   |
| Q4 — How many matched                             | 2                                                 |
| Q5 — Filter: has_class_init AND has_method_return | `student_A1.py`, `student_A2.py`, `student_A4.py` |
| Q6 — Validation error detail                      | Missing colons after method definitions           |

### Task B Correct Answers

| Question                                                               | Answer                                                                                                                       |
|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| Q1 — Matched                                                           | `student_B01.py`, `student_B02.py`, `student_B03.py`, `student_B10.py`                                                       |
| Q2 — Not Matched                                                       | `student_B04.py`, `student_B05.py`, `student_B06.py`, `student_B07.py`, `student_B08.py`, `student_B09.py`, `student_B12.py` |
| Q3 — Not Validated                                                     | `student_B11.py` (syntax errors)                                                                                             |
| Q4 — How many matched                                                  | 4                                                                                                                            |
| Q5 — Filter: has_parent_child AND has_super_init (the number of files) | 7                                                                                                                            |
| Q6 — Filter: parent_child but not super_init                           | `student_B05.py`, `student_B08.py`                                                                                           |


---

## How Questions Will be Presented

- 1 google form includes 5 sections;  
  1- Introduction | 
  2- Task A Questions | 
  3- Task B Questions | 
  4- SUS Questions | 
  5- Feedbacks about the tool

### 1) Introduction;
   - Explanation of the sections and how they will follow the questions.
   - Contains a question: "Do You have experience with Pyttern?"

### 2) Task A Questions
   - The questions for Task A during the test

### 3) Task A Questions
   - The questions for Task B during the test

### 4) SUS Questions
   - 10 SUS Questions after the test

### 5) Feedbacks about the tool
   -  The 5 Questions related with the tool: 5 Questions (4 - Disagree/Agree , 1 - Open Ended)

*(The questions are mentioned in the report)*

---

## Created Files to Use in the Test:

- [Task A Files](TaskA/)
- [Task B Files](TaskB/)
