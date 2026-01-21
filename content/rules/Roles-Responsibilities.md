# Roles & Responsibilities

## Global Rule (applies to **all** roles)

> All roles are expected to contribute to code.
> Some roles have **reduced coding requirements** due to additional responsibilities, but no role is non-technical.

---

## 1. Project Lead

**Scope:** Overall ownership of a single project

### Responsibilities

- Own the **progress and health** of the project
- Coordinate between all roles (PM, devs, QA, design, DevOps)
- Ensure tasks are created, assigned, and tracked
- Lead meetings and async updates
- Resolve blockers or escalate them to club staff
- Ensure new members are onboarded properly
- Represent the project to Praxis staff

### Technical Responsibilities

- Understand the project architecture at a **high level**
- Be able to explain what the system does and why
- Review progress technically (even if not deep reviews)

### Coding Expectation

- **Low to Medium**
- Small fixes, documentation, minor features
- Must be active in the repo (no “ghost lead”)

### Common failure to prevent

Project Leads who only talk and never touch code → **invalid**.

---

## 2. Project Manager

**Scope:** Execution, planning, and organization (not authority)

### Responsibilities

- Break project goals into actionable tasks (with Tech input)
- Maintain task boards (GitHub Projects / platform)
- Track deadlines, progress, and bottlenecks
- Ensure task descriptions are clear and actionable
- Follow up with contributors respectfully
- Help new members understand:

  - The project goals
  - How tasks are structured

### Technical Responsibilities

- Understand task requirements well enough to explain them
- Coordinate with developers to refine unclear tasks

### Coding Expectation

- **Low**
- Bug fixes, small features, documentation, scripts

### Critical constraint

PM **does not override** technical decisions.
If PM dictates architecture → system breaks.

---

## 3. Project Lead / Team Lead (Non-technical leadership, but still dev)

This role is where many clubs fail, so it needs strict definition.

### Responsibilities

- Ensure the project is progressing consistently
- Organize meetings, updates, and task tracking
- Make sure tasks are:

  - Clearly defined
  - Assigned
  - Followed up

- Act as the first contact for:

  - New members
  - Internal conflicts
  - Coordination issues

- Work with the Technical Lead to align:

  - Technical reality
  - Project goals

- Report progress and issues to club staff

### Coding expectation

- **Low to Medium**
- Still expected to:

  - Fix small issues
  - Contribute when possible
  - Stay technically relevant

### Critical constraint (must be written)

A Project Lead **cannot**:

- Be completely disconnected from the codebase
- Delegate everything without understanding the work

Otherwise, decisions become detached and harmful.

---

## 4. Frontend Developer

**Scope:** Client-side development

### Responsibilities

- Implement UI features based on design and specs
- Maintain frontend code quality and consistency
- Integrate APIs correctly
- Handle state management, responsiveness, accessibility
- Review frontend-related PRs
- Help juniors understand frontend stack

### Coding Expectation

- **High**
- This is a production role, not observational

### Extra Responsibilities

- Collaborate closely with Designer and Backend Devs
- Report UX or API inconsistencies early

---

## 5. Backend Developer

**Scope:** Server-side logic and data

### Responsibilities

- Implement APIs, services, and core business logic
- Design and maintain database schemas
- Handle authentication, authorization, validation
- Ensure performance and correctness
- Review backend-related PRs
- Assist others in understanding backend flows

### Coding Expectation

- **High**
- Backend roles are core contributors

### Critical note

Backend Devs must document endpoints.
Undocumented backend = frontend paralysis.

---

## 6. Developer

**Scope:** General-purpose contributor (entry/default role)

### Responsibilities

- Work on assigned tasks according to skill level
- Follow coding standards and contribution rules
- Ask for help when blocked
- Learn project stack actively
- Participate in code reviews as a learner

### Coding Expectation

- **Medium**
- Quality > quantity

### Purpose of this role

This role exists so beginners are **productive without pressure**.

---

## 7. Designer

**Scope:** UX/UI and visual consistency

### Responsibilities

- Design UI flows, layouts, and components
- Produce assets (Figma, mockups, icons, styles)
- Ensure consistency across the product
- Work closely with frontend developers
- Adapt designs based on technical constraints

### Technical Responsibilities

- Understand frontend limitations and workflows
- Translate designs into **implementable components**
- Review UI implementations for consistency

### Coding Expectation

- **Low**
- CSS tweaks, UI fixes, minor frontend contributions

### Explicit rule

Designer is **not only Figma**.
If design is disconnected from implementation → rejected.

---

## 7. QA Engineer

**Scope:** Quality, stability, correctness

### Responsibilities

- Test features before and after merges
- Write test cases and reproduction steps
- Report bugs clearly (expected vs actual behavior)
- Validate fixes
- Help define acceptance criteria for tasks

### Technical Responsibilities

- Understand system behavior end-to-end
- Read code when needed to isolate issues

### Coding Expectation

- **Low**
- Automated tests, test scripts, small fixes

### Critical failure to prevent

QA who only say “it doesn’t work” without details → unacceptable.

---

## 8. DevOps Engineer

**Scope:** Infrastructure and automation

### Responsibilities

- Set up CI/CD pipelines
- Manage environments (dev, staging, prod if any)
- Handle deployments and monitoring
- Improve build, test, and release processes
- Assist teams with environment issues

### Technical Responsibilities

- Deep understanding of system runtime
- Security and reliability awareness

### Coding Expectation

- **Medium**
- Scripts, configs, automation code

### Important constraint

DevOps is not a “set once and disappear” role.
Pipelines must evolve with the project.

---

## Final Enforcement Rule

> By choosing a role, a member gains additional responsibilities **and additional learning opportunities** related to that role.
> However, no role removes the responsibility of being an active developer.

This aligns perfectly with Praxis’s goal: **builders, not titles**.

---
