# Evaluation Dataset

## Normal Prompts (10)

| # | Prompt | Expected App Type |
|---|--------|------------------|
| 1 | CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins see analytics. | CRM / SaaS |
| 2 | Task management app with teams, projects, due dates, file attachments, and email notifications. | Productivity |
| 3 | E-commerce store with product catalog, cart, checkout, order tracking, and seller dashboard. | E-commerce |
| 4 | Blog platform with rich text editor, categories, comments, SEO settings, and author profiles. | CMS |
| 5 | Hospital management system with patient records, appointment scheduling, doctor profiles, and billing. | Healthcare SaaS |
| 6 | Online learning platform with video courses, quizzes, progress tracking, certificates, and instructor dashboard. | EdTech |
| 7 | Real estate platform with property listings, virtual tours, agent profiles, mortgage calculator, and inquiry forms. | Marketplace |
| 8 | HR management tool with employee onboarding, leave tracking, performance reviews, payroll integration, and org chart. | Enterprise SaaS |
| 9 | Food delivery app with restaurant listings, menu management, order tracking, delivery partner dashboard, and ratings. | Marketplace |
| 10 | Project management tool like Jira with sprints, issues, kanban board, time tracking, and team reporting. | Productivity |

---

## Edge Cases (10)

| # | Prompt | Edge Case Type | Expected Behavior |
|---|--------|---------------|------------------|
| 11 | Build me an app. | Extremely vague | Stage 1 documents heavy assumptions, asks for clarification in ambiguities[] |
| 12 | App with login but also no login required. | Conflicting requirements | Stage 1 flags conflict in ambiguities[], Stage 4 resolves with assumption |
| 13 | Social media thing. | Underspecified | Assumptions made for core features (posts, follows, feed) |
| 14 | CRM with 50 user roles and every page accessible by every role. | Logically inconsistent | Roles consolidated, inconsistency noted in consistency_report |
| 15 | Build the same app as Salesforce but better. | Reference to external product | Extracts CRM features, documents that exact parity is assumed |
| 16 | App where users can do everything admins can do. | Conflicting permissions | Permission model flattened, warning added |
| 17 | E-commerce with no database. | Technically impossible | Assumption: in-memory or localStorage, flagged as architectural warning |
| 18 | ??? | Completely empty/meaningless | Stage 1 returns generic assumptions, pipeline completes with minimal config |
| 19 | App with payments but no user accounts. | Missing prerequisite | Auth added as assumption (payments require identity), documented |
| 20 | Build an app that builds apps. | Meta/recursive | Treated as a SaaS platform with prompt input and config output |

---

## Results Template

| # | Success | Repairs | Latency (s) | Notes |
|---|---------|---------|-------------|-------|
| 1 | | | | |
| 2 | | | | |
| ... | | | | |

Fill this in after running each prompt through the live system.
