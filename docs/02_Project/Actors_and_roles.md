# Nivaaran — Actors, Roles & Responsibilities

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Organization:** Government of Jharkhand
**Document:** Actors, Roles & Responsibilities
**Status:** Foundational Product Specification

---

# 1. Purpose

This document defines the actors that participate in the Nivaaran ecosystem, what each actor represents, what responsibilities they have, what they should be able to see, what actions they should be able to perform, and where their authority ends.

Nivaaran is a multi-sided ecosystem rather than a single-user application.

The platform connects:

```text
COMMUNITY DEMAND
      ↓
CITIZENS / COMMUNITIES
      ↓
GOVERNMENT
      ↓
UNIVERSITIES
      ↓
STUDENTS + FACULTY
      ↓
INDUSTRY / CSR / INNOVATION PARTNERS
      ↓
SOLUTION
      ↓
PILOT
      ↓
DEPLOYMENT
      ↓
MEASURABLE IMPACT
```

The official and supporting project material identifies citizens, community organizations, Panchayati Raj Institutions, Urban Local Bodies, government departments, universities, faculty, students, industry/startups/MSMEs, CSR organizations, research laboratories/innovation hubs, and platform administration as the principal actors.

---

# 2. Core Principle

Nivaaran should not treat every authenticated user as simply a "user."

Different participants have fundamentally different responsibilities.

For example:

```text
Citizen
    reports a problem

Government
    validates and prioritizes the problem

University
    provides capability to solve it

Faculty
    mentors the project

Student
    builds the solution

Industry
    provides technology / funding / mentorship / deployment

CSR
    supports high-impact implementation

Research Lab
    provides specialized capability

Platform Admin
    governs the platform itself
```

The system therefore requires a structured role model.

---

# 3. Actor Taxonomy

## 3.1 Primary Actors

The primary actors directly participate in the problem-to-impact lifecycle.

```text
1. Citizen
2. Community Organization / NGO
3. Panchayati Raj Institution
4. Urban Local Body
5. Government Department
6. University
7. Faculty / Mentor
8. Student
9. Industry / Startup / MSME
10. CSR Organization
11. Research Lab / Innovation Hub
12. Platform Super Admin
```

---

# 4. Citizen

## 4.1 Purpose

The citizen is the primary source of grassroots societal problems.

A citizen may identify a real-world issue and submit it to Nivaaran with supporting evidence and geographic information.

The citizen-facing experience should therefore be the simplest workflow in the platform.

---

## 4.2 Primary Responsibilities

The citizen can:

* identify a societal problem
* submit a challenge
* describe the problem
* provide location
* upload evidence
* track the challenge
* add additional evidence
* receive progress updates
* provide post-solution feedback

These responsibilities are explicitly identified in the project analysis.

---

## 4.3 Citizen Can Create

A citizen may create:

```text
Challenge
Evidence
Additional evidence
Feedback
```

---

## 4.4 Citizen Can View

A citizen should be able to view:

### Own challenges

* submitted challenge
* current status
* AI-generated public-facing summary where appropriate
* validation status
* major lifecycle updates
* project progress where disclosure is appropriate
* final outcome
* impact information appropriate for public visibility

### Public information

A citizen may view publicly available:

* public challenges
* public challenge status
* public project information
* appropriate impact information

---

## 4.5 Citizen Should NOT View

A citizen should not automatically see:

* private government notes
* internal moderation information
* confidential university information
* private industry discussions
* confidential project information
* private contact information of other users
* internal AI evaluation information where it is not appropriate for public exposure

---

## 4.6 Citizen Decision Authority

A citizen does not have authority to:

* validate their own challenge
* assign a university
* set final government priority
* approve institutional allocation
* approve project milestones
* approve deployment
* modify another user's challenge

---

# 5. Community Organization / NGO

## 5.1 Purpose

Community organizations and NGOs act as intermediaries between local communities and the platform.

They can represent broader community needs and may have greater contextual understanding of a local issue than an individual submission.

---

## 5.2 Responsibilities

Community organizations may:

* submit challenges
* help validate community challenges
* provide evidence
* collaborate on projects
* provide local context
* participate in solution evaluation

The source material specifically identifies their ability to submit and help validate community challenges and collaborate on projects.

---

## 5.3 Important Boundary

Community organizations should not automatically receive government-level authority.

Their participation in validation should depend on:

* the challenge
* geographic scope
* organizational responsibility
* assigned workflow permissions

---

# 6. Panchayati Raj Institution

## 6.1 Purpose

A Panchayati Raj Institution represents the local rural administrative layer.

It is particularly important for problems originating at village and block level.

---

## 6.2 Responsibilities

A PRI may:

* submit local challenges
* verify local challenges
* provide local context
* monitor interventions
* monitor village/block-level outcomes
* participate in validation
* support field implementation

The project documentation specifically assigns PRIs responsibility for submitting/verifying local challenges and monitoring interventions at village/block level.

---

## 6.3 Geographic Responsibility

PRI access should be scoped according to its jurisdiction.

For example:

```text
PRI A
    ↓
Village(s) / local jurisdiction
```

A PRI should not automatically have unrestricted access to challenges throughout Jharkhand.

---

# 7. Urban Local Body

## 7.1 Purpose

Urban Local Bodies perform the corresponding local administrative role in urban areas.

---

## 7.2 Responsibilities

An ULB may:

* report urban challenges
* manage relevant urban challenges
* provide local verification
* monitor urban interventions
* monitor urban projects
* provide implementation context

The supporting specification explicitly identifies reporting/managing urban challenges and monitoring urban projects.

---

## 7.3 Geographic Scope

ULB permissions should generally correspond to its administrative jurisdiction.

---

# 8. Government Department

## 8.1 Purpose

Government departments are one of the most important actors in Nivaaran.

They provide institutional validation, prioritization, coordination, monitoring and evaluation.

---

## 8.2 Responsibilities

Government users may:

* review challenges
* validate challenges
* prioritize challenges
* assign or route challenges
* monitor projects
* evaluate projects
* consume district-level analytics
* consume state-level analytics
* monitor institutional participation
* monitor industry engagement
* evaluate outcomes
* review impact

The project material explicitly describes government responsibilities as validating, prioritizing, assigning, monitoring and evaluating challenges/projects.

---

## 8.3 Government Decision Authority

Government users may have authority over:

```text
Challenge validation
       ↓
Priority approval
       ↓
Institutional routing / allocation
       ↓
Project monitoring
       ↓
Evaluation
       ↓
Deployment-related approval where applicable
       ↓
Impact verification
```

However, the exact authority must later be divided among specific government roles.

"Government" should therefore be treated as an actor category rather than a single unrestricted role.

---

## 8.4 Government Sub-Roles

Future RBAC should distinguish at least:

```text
Government Viewer
Government Reviewer
Government Validator
Government Coordinator
Government Decision Maker
Government Administrator
```

These are proposed internal sub-roles and are not claimed as official PS roles.

---

# 9. University

## 9.1 University as an Organization

A university is not a single individual.

It is an organization containing:

```text
University
│
├── Departments
│
├── Faculty
│
├── Students
│
├── Laboratories
│
├── Facilities
│
└── Innovation / Incubation capabilities
```

Therefore the platform should represent universities as organizations with internal members.

---

# 10. University Admin

## 10.1 Purpose

The University Admin manages the institutional representation of a university on Nivaaran.

---

## 10.2 Responsibilities

University Admin may:

* manage institution profile
* manage departments
* manage capabilities
* manage facilities
* manage institutional participation
* coordinate university participation
* manage appropriate institutional members

The source material explicitly identifies institution profiles, departments, facilities and participation as University Admin responsibilities.

---

## 10.3 University Capability Profile

The institution profile should eventually contain information useful for matching, such as:

```text
Academic disciplines
Research areas
Faculty expertise
Laboratories
Facilities
Equipment
Innovation centers
Past projects
Relevant technologies
Student capabilities
Availability / capacity
```

These capabilities form the supply side of the Nivaaran ecosystem.

---

# 11. Faculty / Mentor

## 11.1 Purpose

Faculty members provide academic expertise and project mentorship.

---

## 11.2 Responsibilities

Faculty may:

* discover suitable challenges
* mentor student teams
* review proposals
* approve milestones where assigned
* guide research
* provide academic expertise
* contribute to solution design
* participate in project evaluation

These responsibilities are explicitly described in the project documentation.

---

## 11.3 Faculty Authority

Faculty authority should generally be scoped to:

* their university
* their departments
* their assigned projects
* their assigned teams
* their mentorship relationships

A faculty member should not automatically control every university project.

---

# 12. Student

## 12.1 Purpose

Students form the primary execution layer for university-led solution development.

---

## 12.2 Responsibilities

Students may:

* discover challenges
* express interest in challenges
* form teams
* join teams
* work on projects
* build prototypes
* submit deliverables
* update assigned work
* participate in pilots
* contribute to project documentation

These capabilities are explicitly identified in the source material.

---

## 12.3 Student Restrictions

Students should generally not be able to:

* approve their own milestones
* assign government priority
* approve university allocation
* alter official challenge validation
* approve deployment
* modify another team's project

---

# 13. Industry / Startup / MSME

## 13.1 Purpose

Industry partners provide capabilities that universities or government may not possess directly.

They represent the technology, funding, mentorship, testing and deployment side of the ecosystem.

---

## 13.2 Responsibilities

Industry partners may:

* discover relevant projects
* mentor teams
* provide funding
* provide technology
* provide testing
* provide facilities
* support prototyping
* support deployment

The technical specification explicitly identifies mentoring, funding, technology/testing and deployment support.

---

## 13.3 Collaboration Model

Industry participation should be structured around concrete needs.

Example:

```text
PROJECT

Need:
IoT flood sensor hardware

Required:
10 prototype units

Partner capability:
Hardware manufacturing

Industry response:
"I can provide prototype hardware"
```

Other collaboration types include:

```text
Mentorship
Funding
Technology
Testing
Hardware
Cloud resources
Deployment
Domain expertise
```

---

# 14. CSR Organization

## 14.1 Purpose

CSR organizations provide funding and implementation support for high-impact societal projects.

---

## 14.2 Responsibilities

CSR organizations may:

* discover high-impact projects
* identify suitable initiatives
* fund projects
* support implementation
* support scaling

The project material specifically identifies CSR participation around high-impact projects, funding and implementation.

---

# 15. Research Lab / Innovation Hub

## 15.1 Purpose

Research laboratories and innovation hubs provide specialized capabilities that may not exist within a standard university team or industry partner.

---

## 15.2 Responsibilities

They may provide:

* specialized expertise
* laboratories
* testing facilities
* technical collaboration
* research support
* specialized equipment

These capabilities are explicitly identified in the project documentation.

---

# 16. Platform Super Admin

## 16.1 Purpose

The Platform Super Admin governs the Nivaaran platform itself.

This is fundamentally different from a Government Department user.

A government department manages **societal challenges and programs**.

The Super Admin manages **the software ecosystem**.

---

## 16.2 Responsibilities

The Super Admin may manage:

* user administration
* platform roles
* permissions
* taxonomy
* categories
* workflows
* moderation
* system configuration
* platform-wide settings

These responsibilities are explicitly identified by the source material.

---

## 16.3 Super Admin Restrictions

The Super Admin should not casually become the owner of every business decision.

For example:

```text
Super Admin
    CAN:
        configure workflow

    SHOULD NOT:
        arbitrarily change the priority of a real societal challenge
```

Technical administration and governmental decision-making should remain separate.

---

# 17. Actor Relationship Model

The ecosystem can be represented as:

```text
                       GOVERNMENT
                      /     |     \
                     /      |      \
                    ↓       ↓       ↓
              VALIDATE   PRIORITIZE  MONITOR
                    |
                    ↓
               CHALLENGE
                    |
                    ↓
             AI UNDERSTANDING
                    |
                    ↓
            UNIVERSITY MATCHING
                    |
                    ↓
               UNIVERSITY
              /          \
             ↓            ↓
         FACULTY       STUDENTS
             \            /
              \          /
               ↓        ↓
                 PROJECT
                    |
                    ↓
          INDUSTRY / CSR / LAB
                    |
                    ↓
               PROTOTYPE
                    ↓
                  PILOT
                    ↓
               DEPLOYMENT
                    ↓
              IMPACT MEASURE
                    |
                    ↓
                  CITIZEN
```

---

# 18. Actor-to-Lifecycle Relationship

| Lifecycle Stage        | Primary Actor                       | Supporting Actors               |
| ---------------------- | ----------------------------------- | ------------------------------- |
| Submission             | Citizen                             | Community, PRI, ULB, Government |
| AI Understanding       | Platform                            | AI                              |
| Validation             | Government / Authorized Reviewer    | Community, PRI, ULB             |
| Deduplication          | Platform                            | Government reviewer             |
| Prioritization         | Government                          | AI                              |
| University Matching    | Platform                            | University                      |
| Acceptance             | University                          | Government                      |
| Team Formation         | University / Faculty                | Students                        |
| Proposal               | Student + Faculty                   | University                      |
| Industry Collaboration | Project Team                        | Industry, CSR, Labs             |
| Prototype              | Student Team                        | Faculty, Industry, Labs         |
| Pilot                  | Project Team                        | Government, Community, Industry |
| Validation             | Government / Experts                | Community, University, Industry |
| Deployment             | Government / Implementing Partner   | University, Industry, CSR       |
| Impact Measurement     | Government / Project                | Community, University           |
| Closure                | Authorized Project/Government Actor | All relevant participants       |

The lifecycle itself is derived from the 16-stage workflow described in the supporting documentation.

---

# 19. Resource Ownership

Role alone is insufficient for authorization.

Nivaaran should use:

```text
ROLE
+
RESOURCE OWNERSHIP
+
ORGANIZATIONAL SCOPE
+
GEOGRAPHIC SCOPE
+
WORKFLOW STATE
```

For example:

```text
Student
+
member of Project #102
+
University A
+
Project #102 currently active
```

may edit their assigned project contribution.

But:

```text
Student
+
not member of Project #103
```

should not gain access merely because they are a student.

The supporting specification explicitly establishes least-privilege access and resource ownership for API/UI actions.

---

# 20. Data Visibility Classes

Not every piece of data should have the same visibility.

A useful conceptual classification is:

## PUBLIC

Information safe for public discovery.

Examples:

* public challenge title
* public challenge location at an appropriate granularity
* public status
* published project information
* verified public impact

---

## PARTICIPANT

Information available to participants of a challenge/project.

Examples:

* project discussions
* project documents
* team information
* collaboration requests

---

## ORGANIZATIONAL

Information available within an organization.

Examples:

* internal university information
* internal government notes
* internal organizational capability information

---

## PRIVATE

Information available only to explicitly authorized users.

Examples:

* citizen contact details
* private evidence
* confidential government notes
* sensitive project information

The source material explicitly requires citizen contact information and private evidence to remain protected from unauthorized roles.

---

# 21. AI Does Not Become an Actor With Authority

AI should be treated as a **system capability**, not a human stakeholder.

The AI can:

```text
Analyze
Classify
Summarize
Extract
Detect similarity
Recommend priority
Recommend universities
Recommend teams
```

But:

```text
AI
≠
Government decision maker
```

The project specification explicitly defines AI as assistive and requires human override/audit for consequential decisions.

---

# 22. AI Recommendation vs Human Decision

The platform should conceptually represent:

```text
AI SUGGESTION
      ↓
CONFIDENCE / REASONS
      ↓
HUMAN REVIEW
      ↓
ACCEPT / MODIFY / REJECT
      ↓
FINAL DECISION
```

For consequential decisions, particularly:

* final prioritization
* institutional allocation

the human decision must remain authoritative.

The technical specification explicitly requires human approval for these consequential decisions.

---

# 23. AI Decision Audit

Where AI contributes to an important decision, the system should retain:

```text
AI recommendation
+
AI confidence
+
AI reasoning / factors
+
timestamp
+
model/version where appropriate
+
human reviewer
+
human decision
+
decision timestamp
```

This creates:

```text
AI suggested X
        ↓
Human reviewed X
        ↓
Human accepted/modified/rejected X
```

The supporting material explicitly calls for audit logging of AI suggestions and corresponding human decisions.

---

# 24. Actor Authentication

Every authenticated actor should ultimately map to:

```text
User
  ↓
Identity
  ↓
Organization
  ↓
Role
  ↓
Permissions
  ↓
Resource scope
```

Example:

```text
user_123
   ↓
Faculty
   ↓
University ABC
   ↓
Department of Computer Science
   ↓
Project #42
```

This provides much stronger authorization than simply:

```text
role = faculty
```

---

# 25. Organization Membership

Users may belong to organizations.

Examples:

```text
Faculty
    → University A
    → Computer Science Department

Student
    → University A
    → Engineering Department

Government Officer
    → Department X
    → District Y

Industry Employee
    → Company Z
```

Organization membership should influence access.

---

# 26. Multiple Roles

The architecture should allow a user to potentially possess more than one role where appropriate.

For example:

```text
University Professor
+
Project Mentor
```

or:

```text
Government Officer
+
Challenge Reviewer
```

However, multiple roles must not automatically create unrestricted permissions.

Effective permission should be calculated from:

```text
Role(s)
+
Organization
+
Resource ownership
+
Scope
+
Workflow state
```

---

# 27. Role Permission Philosophy

The platform follows these principles:

### Principle 1 — Least Privilege

Users receive only the permissions necessary for their responsibilities.

### Principle 2 — Resource Ownership

Access should depend on what resource a user owns, manages or participates in.

### Principle 3 — Organizational Scope

A user should generally operate within their organization unless explicitly authorized otherwise.

### Principle 4 — Geographic Scope

Local administrative users should generally be scoped to their jurisdiction.

### Principle 5 — Workflow Authority

Being able to view something does not imply being able to change its state.

### Principle 6 — Human Authority

AI recommendations do not replace authorized human decisions.

### Principle 7 — Auditability

Important changes and decisions must be traceable.

These principles are consistent with the supporting technical specification.

---

# 28. High-Level Permission Matrix

This is a conceptual matrix, not yet the final RBAC specification.

| Capability                | Citizen | Community | PRI/ULB |    Govt |    University |  Faculty |  Student |      Industry |           CSR |           Lab | Super Admin |
| ------------------------- | ------: | --------: | ------: | ------: | ------------: | -------: | -------: | ------------: | ------------: | ------------: | ----------: |
| Submit challenge          |       ✓ |         ✓ |       ✓ |       ✓ |             — |        — |        — |             — |             — |             — |           ✓ |
| Add evidence              |       ✓ |         ✓ |       ✓ |       ✓ |      Assigned | Assigned | Assigned |      Assigned |      Assigned |      Assigned |           ✓ |
| View own challenge        |       ✓ |         ✓ |       ✓ |       ✓ |             ✓ |        ✓ |        ✓ |             ✓ |             ✓ |             ✓ |           ✓ |
| Validate challenge        |       — |   Limited | Limited |       ✓ |             — |        — |        — |             — |             — |             — |           ✓ |
| Final prioritization      |       — |         — |       — |       ✓ |             — |        — |        — |             — |             — |             — |      Config |
| University matching       |       — |         — |       — |  Review |             ✓ |        ✓ |        — |             — |             — |             — |      Config |
| Accept challenge          |       — |         — |       — |       — |             ✓ |        — |        — |             — |             — |             — |           — |
| Form team                 |       — |         — |       — |       — |             ✓ |        ✓ |        ✓ |             — |             — |             — |           — |
| Mentor project            |       — |         ✓ |       — |       — |             — |        ✓ |        — |             ✓ |             ✓ |             ✓ |           — |
| Build prototype           |       — |         ✓ |       — |       — |             ✓ |        ✓ |        ✓ |             ✓ |             — |             ✓ |           — |
| Provide funding           |       — |         — |       — |       — |             — |        — |        — |             ✓ |             ✓ |             — |           — |
| Provide testing           |       — |         ✓ |       — |       — |             ✓ |        ✓ |        ✓ |             ✓ |             — |             ✓ |           — |
| Support deployment        |       — |         ✓ |       ✓ |       ✓ |             ✓ |        ✓ |        — |             ✓ |             ✓ |             ✓ |           — |
| Monitor projects          |       — |         ✓ |       ✓ |       ✓ |             ✓ |        ✓ |      Own |       Partner |       Partner |       Partner |           ✓ |
| View government analytics |       — |         — | Limited |       ✓ |             — |        — |        — |             — |             — |             — |           ✓ |
| Manage users              |       — |         — |       — | Limited | Institutional |        — |        — | Institutional | Institutional | Institutional |           ✓ |
| Manage taxonomy           |       — |         — |       — |       — |             — |        — |        — |             — |             — |             — |           ✓ |
| Manage workflows          |       — |         — |       — |       — |             — |        — |        — |             — |             — |             — |           ✓ |

**Important:** this table is intentionally high-level. The final authorization matrix should be created later in `RBAC_MATRIX.md`.

---

# 29. Government vs Super Admin

This distinction must remain explicit.

## Government

Owns or manages:

```text
Societal programs
Challenges
Prioritization
Validation
Institutional coordination
Project monitoring
Impact evaluation
```

## Super Admin

Owns:

```text
Platform configuration
Users
Roles
Permissions
Taxonomy
Workflow configuration
Moderation configuration
System administration
```

The two should never be merged merely because both have "admin" privileges.

---

# 30. University Admin vs Faculty

These roles are also different.

## University Admin

Manages the **institution**.

```text
University profile
Departments
Facilities
Institution participation
Members
```

## Faculty

Manages/mentors the **academic project/team**.

```text
Mentorship
Proposal review
Research guidance
Milestones
Team guidance
```

A faculty member should not automatically modify the university's official institutional profile.

---

# 31. Faculty vs Student

## Faculty

Primarily:

```text
Guide
Review
Mentor
Approve assigned milestones
Research
```

## Student

Primarily:

```text
Discover
Join
Build
Submit
Execute
```

This distinction becomes important for project governance.

---

# 32. Industry vs CSR

Both are external ecosystem partners but their typical contribution differs.

## Industry / Startup / MSME

Strongest contribution areas:

```text
Technology
Mentorship
Testing
Engineering
Productization
Deployment
Funding
```

## CSR

Strongest contribution areas:

```text
Funding
Impact initiatives
Implementation
Scaling
```

These are not hard restrictions. A CSR organization may provide expertise, and an industry partner may fund a project.

---

# 33. Research Lab / Innovation Hub vs University

A research lab may:

* belong to a university
* operate independently
* collaborate across institutions
* provide specialized facilities

Therefore the data model should not assume:

```text
Research Lab = University Department
```

It should support research/innovation entities as independent collaboration participants where necessary.

---

# 34. Actor Lifecycle Participation

The most important actor progression is:

```text
CITIZEN
  │
  │ reports
  ▼
CHALLENGE
  │
  │ validated by
  ▼
GOVERNMENT
  │
  │ routes
  ▼
UNIVERSITY
  │
  │ creates
  ▼
TEAM
  │
  │ develops
  ▼
PROJECT
  │
  ├──────────────┐
  ▼              ▼
INDUSTRY       CSR / LAB
  │              │
  └──────┬───────┘
         ▼
      PROTOTYPE
         ↓
        PILOT
         ↓
     DEPLOYMENT
         ↓
    IMPACT MEASURED
         ↓
       CITIZEN
```

This represents the core ecosystem concept described by the project documentation.

---

# 35. What This Document Does NOT Define Yet

This document intentionally does not finalize:

* exact API permissions
* exact database permission fields
* JWT claims
* exact frontend route guards
* exact middleware implementation
* exact organization hierarchy
* exact government sub-roles
* exact permission names
* exact workflow transition permissions

Those belong in later documents.

In particular:

```text
ACTORS_AND_ROLES.md
        ↓
RBAC_MATRIX.md
        ↓
COMPLETE_WORKFLOW.md
        ↓
API_CONTRACTS.md
```

---

# 36. Actor-to-Requirement Traceability

| Actor            | Major Requirement Areas                                     |
| ---------------- | ----------------------------------------------------------- |
| Citizen          | Challenge submission, evidence, tracking, feedback          |
| Community / NGO  | Submission, validation support, collaboration               |
| PRI              | Local challenge submission/verification, monitoring         |
| ULB              | Urban challenge management, monitoring                      |
| Government       | Validation, prioritization, routing, monitoring, evaluation |
| University Admin | Institutional capabilities and participation                |
| Faculty          | Mentorship, proposals, milestones, research                 |
| Student          | Team formation, development, deliverables                   |
| Industry         | Mentorship, funding, technology, testing, deployment        |
| CSR              | Funding and implementation                                  |
| Research Lab     | Expertise, facilities, technical collaboration              |
| Super Admin      | Users, taxonomy, permissions, workflows, moderation         |

---

# 37. Final Actor Model

Nivaaran should ultimately be understood as:

```text
                    ┌─────────────────┐
                    │    GOVERNMENT   │
                    │ Validate /      │
                    │ Prioritize /    │
                    │ Monitor         │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────┐       ┌──────────────┐
│   CITIZEN   │──────▶│   CHALLENGE  │
└─────────────┘       └──────┬───────┘
                             │
                       AI INTELLIGENCE
                             │
                             ▼
                    ┌─────────────────┐
                    │   UNIVERSITY    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
                FACULTY           STUDENTS
                    │                 │
                    └────────┬────────┘
                             ▼
                         PROJECT
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
           INDUSTRY         CSR          LABS
               │             │             │
               └─────────────┼─────────────┘
                             ▼
                     PROTOTYPE / PILOT
                             │
                             ▼
                        DEPLOYMENT
                             │
                             ▼
                       IMPACT DATA
                             │
                             ▼
                          CITIZEN
```

The platform administrator sits across the system as the governance layer:

```text
                 PLATFORM SUPER ADMIN
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     USERS          WORKFLOWS        CONFIGURATION
```

The core principle is:

> **Nivaaran does not give every participant equal control. It gives each participant the capability required to move a societal problem forward while preserving privacy, accountability and institutional responsibility.**

---

# 38. Next Document Dependency

This document establishes **who exists and what their responsibilities are**.

The next document should therefore define **how those actors interact over time**:

```text
ACTORS_AND_ROLES.md
        ↓
COMPLETE_WORKFLOW.md
```

That document should go much deeper into the actual 16-stage lifecycle:

```text
1. Submission
2. AI Understanding
3. Validation
4. Deduplication / Clustering
5. Prioritization
6. Institution Matching
7. University Acceptance
8. Team Formation
9. Proposal
10. Industry Collaboration
11. Prototype
12. Pilot
13. Validation
14. Deployment
15. Impact Measurement
16. Closure & Learning
```

For every stage, it should specify:

```text
WHO enters the stage?
WHO can see it?
WHO can act?
WHAT data is produced?
WHAT conditions must be satisfied?
WHAT can cause rejection?
WHAT happens next?
WHO is notified?
WHAT happens if something goes wrong?
```

That workflow document will then become the bridge between the **requirements** and the eventual **backend state machine, database model, API contracts and frontend screens**.
