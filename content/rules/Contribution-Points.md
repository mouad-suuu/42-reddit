# Contribution Points System

## 0. Core Principle (must be written explicitly)

> **Tasks are the backbone of contribution measurement.**
> No points are granted without a traceable action (task, PR, document, meeting log).

---

## 1. Task-Based Contribution (Primary Source)

Every task **must** have:

- A clear description
- A defined size: `S | M | L | XL`
- An owner
- Deliverables (code, doc, design, test, infra)

### Base XP from Task Size

This is immutable and **role-agnostic**:

```ts
S  → 10 XP
M  → 20 XP
L  → 40 XP
XL → 50 XP
```

### Rules

- Tasks **must be validated** (merged, reviewed, accepted)
- Partial or abandoned tasks → **0 XP**
- Task inflation (fake L/XL tasks) → reviewed by PM + PL

**Critical safeguard:**
PM and PL do **not** self-approve their own tasks.

---

## 2. Research Contribution

Research is allowed **only as a task**, never informal.

### Research Task Requirements

To earn points, research must include:

- A written document (Markdown, Notion, PDF, etc.)
- Clear scope (what was researched and why)
- Actionable outcome (decision, recommendation, trade-off)

### Base XP

- Research task XP = **task size XP**

  - S research ≠ XL research

### Bonus Modifiers

- +5 XP → research explained to **project team**
- +10 XP → research presented to **club-wide students**
- +5 XP → research directly leads to a technical decision

### Abuse prevention

- Copy-paste research → rejected
- Research with no impact → downgraded size

---

## 3. Task Creation (PM & Project Lead leverage)

Creating tasks **does give points**, but carefully.

### Task Creation XP

- +3 XP per **approved** task
- Task must be:

  - Well-defined
  - Sized correctly
  - Accepted by contributors

### Limits

- Max task-creation XP per week (example): **15 XP**
- Prevents PM/PL farming points without delivery

### Critical rule

Creating tasks **does not replace execution**.
If PM/PL only creates tasks and delivers nothing → leadership at risk.

---

## 4. Meeting Participation

Meetings are **not free points**, they are accountability points.

### Attendance

- +2 XP → attended meeting
- +5 XP → active participation (questions, feedback)

### Leading a Meeting

- +8 XP → leading a structured meeting
- Requires:

  - Agenda
  - Notes
  - Outcomes

### Hard limit

Meetings XP is capped weekly.
Otherwise people talk instead of build.

---

## 5. Role-Specific Contribution Modifiers

These **do not replace task XP**, they **augment it**.

---

### Project Lead (`project_lead`)

Extra XP sources:

- +10 XP → successful onboarding of a new member
- +10 XP → project milestone reached (MVP, prod)
- +5 XP → conflict resolution validated by staff

Penalty:

- No activity for 2 weeks → **automatic leadership removal**

---

### Project Manager (`pm`)

Extra XP sources:

- +5 XP → backlog cleanup / restructuring
- +5 XP → improving task clarity after feedback
- +10 XP → unblocking a stuck project phase

Penalty:

- Poor task definitions → task XP revoked

---

### Developers (frontend, backend, developer)

Extra XP sources:

- +5 XP → helping another dev unblock
- +5 XP → meaningful code review
- +10 XP → refactoring that improves stability

---

### Designer (`designer`)

Extra XP sources:

- +5 XP → design system or reusable components
- +5 XP → design adapted to technical constraints
- +10 XP → improved UX based on user feedback

Penalty:

- Designs not implementable → task downgraded

---

### QA Engineer (`qa`)

Extra XP sources:

- +5 XP → clear bug reproduction steps
- +10 XP → automated tests added
- +5 XP → regression prevention

Penalty:

- Vague bug reports → no XP

---

### DevOps (`devops`)

Extra XP sources:

- +10 XP → CI/CD pipeline improvement
- +10 XP → deployment automation
- +5 XP → infra documentation

Penalty:

- Broken pipelines left unfixed → XP revoked

---

## 6. Teaching & Knowledge Sharing (Club Value)

This is where Praxis becomes a **learning system**, not a grind.

### Knowledge Sharing XP

- +5 XP → explaining a concept to teammates
- +10 XP → workshop or presentation
- +15 XP → documented tutorial used by others

Rule:
Knowledge sharing **must be documented or recorded**.

---

## 7. Global Constraints (VERY IMPORTANT)

These prevent gaming the system:

1. **XP decay exists**

   - Inactivity reduces relative influence over time

2. **XP ≠ authority**

   - XP determines ownership & leadership eligibility

3. **XP is contextual**

   - Points are compared **within the same project**

4. **XP can be revoked**

   - Cheating, low-quality work, abuse

---

## 8. Why this system works (critical view)

- Tasks stay central → objective measurement
- Roles get leverage → without becoming free XP
- Teaching is rewarded → club grows skill-wise
- Abuse vectors are explicitly closed

---

# 9. Anti-Abuse & Task Validation

### 9.1 Random Checks by Club Staff

- All tasks are subject to **random audits** by Praxis staff.
- The goal:

  - Verify quality of work
  - Validate task size
  - Prevent members from inflating contribution points

**What is checked:**

1. Task completion
2. Quality of deliverables
3. Size appropriateness
4. Documentation for research tasks
5. Alignment with project requirements

---

### 9.2 Punishments for Inflated or Fake Tasks

The severity of punishment **scales with the degree of abuse**:

| Severity | Example                               | Consequence                                 |
| -------- | ------------------------------------- | ------------------------------------------- |
| Minor    | Overestimated size slightly           | XP reduced to correct value                 |
| Moderate | Overestimated size significantly      | XP lost + warning                           |
| Severe   | Intentional fake task / no work       | XP lost + role demotion or position removed |
| Extreme  | Repeated or deliberate task inflation | Removal from project or club review         |

> All members must acknowledge that **intentionally inflating tasks is a serious offense**.

---

### 9.3 AI-Assisted Task Size Estimation

Praxis will use AI tools to **estimate reasonable task size** based on:

- Research required
- Lines of code / complexity
- Time needed for completion
- Effort in explanation / mentoring / review

#### Process

1. Member submits task with estimated size (S, M, L, XL)
2. AI analyzes the task description and expected effort
3. Staff reviews AI estimate
4. Any large discrepancies trigger an audit

**Note:** AI suggestions do not automatically assign XP; staff validation is final.

---

### 9.4 How Task Size is Determined (Guideline)

When estimating task size, consider:

| Size | Criteria                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| S    | Small, <2 hours, minor feature/fix, little research                                                        |
| M    | Medium, 2–6 hours, moderate code, small research, basic testing                                            |
| L    | Large, 6–15 hours, complex feature, multiple files/components, some research and documentation             |
| XL   | Extra-large, >15 hours, major feature, requires coordination, research, documentation, explanation to team |

> Points will be assigned **based on this size**, with all bonuses applied after.

---

### 9.5 Research and Explanation Tie-In

- Any research or explanation must be attached to a task
- PM and PL determine **base XP** for research tasks
- Extra points for teaching teammates or club-wide presentation
- AI and staff will also evaluate **research scope vs claimed size**

---

### 9.6 Critical Safeguards

- Members cannot claim XP for tasks they did not substantially perform
- Random audits can **override self-reported XP**
- Repeat offenders may **lose leadership roles or project membership**
- Staff keeps **audit logs** to prevent disputes

---
