# Nivaaran — Requirements Specification

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Organization:** Government of Jharkhand
**Department:** Department of Higher & Technical Education
**Category:** Software
**Theme:** Smart Education

---

# 1. Purpose

This document defines the functional, non-functional and product requirements for Nivaaran.

Nivaaran is intended to provide a structured digital ecosystem through which societal challenges can be submitted, understood, evaluated, prioritized, connected with suitable Higher Education Institutions and industry partners, converted into projects, monitored through their lifecycle, and ultimately evaluated for measurable social impact.

The requirements in this document are organized according to their source and maturity so that official Problem Statement requirements are not confused with implementation decisions or optional enhancements.

---

# 2. Requirement Classification

Every requirement should be understood using one of the following classifications.

### PS — Official Problem Statement Requirement

A capability explicitly requested by the official SIH 26043 problem statement.

### SI — Solution Interpretation

A capability derived from interpreting the official PS into a concrete product requirement.

It is necessary or highly useful for making the proposed solution coherent, but is not necessarily stated word-for-word by SIH.

### EN — Enhancement

A useful additional capability that improves the product but is not necessary to satisfy the core PS.

### TD — Technical Decision

An implementation choice describing how a requirement may be built.

A technical decision is **not itself a product requirement**.

For example:

> "The system shall support semantic deduplication."

is a requirement.

> "The system shall use MongoDB embeddings."

is an implementation decision.

The latter must not be treated as mandatory unless explicitly finalized later.

---

# 3. Requirement Priority

### P0 — Critical

Required for the core product and/or directly demanded by the PS.

### P1 — Important

Strongly supports the PS and should be included in the main implementation where practical.

### P2 — Enhancement

Useful but can be deferred without breaking the core product.

### P3 — Future

Suitable for later versions or statewide scaling.

---

# 4. Core Product Requirements

## REQ-CORE-001 — Unified Societal Challenge Platform

**Classification:** PS
**Priority:** P0

The system shall provide a centralized digital platform for collecting and managing societal challenges.

The platform shall support the participation of citizens, community organizations, local bodies, government agencies, universities, students, faculty, industry partners and other relevant organizations.

---

## REQ-CORE-002 — Problem-to-Solution Lifecycle

**Classification:** PS + SI
**Priority:** P0

The platform shall support a structured lifecycle through which a societal challenge can progress from submission toward evaluation, institutional collaboration, solution development, implementation and impact measurement.

The lifecycle shall not terminate merely when the challenge is received or assigned.

---

## REQ-CORE-003 — Multi-Stakeholder Collaboration

**Classification:** PS
**Priority:** P0

The system shall allow multiple stakeholder groups to participate in the lifecycle of a societal challenge.

Relevant stakeholders include:

* citizens
* community organizations
* Panchayati Raj Institutions
* Urban Local Bodies
* government departments
* Higher Education Institutions
* faculty
* students
* industries
* startups
* MSMEs
* CSR organizations
* research laboratories
* innovation ecosystems
* platform administrators

---

# 5. Challenge Submission Requirements

## REQ-CH-001 — Citizen Challenge Submission

**Classification:** PS
**Priority:** P0

Citizens shall be able to submit societal challenges through an intuitive digital interface.

---

## REQ-CH-002 — Community Organization Submission

**Classification:** PS
**Priority:** P0

Community organizations shall be able to submit societal challenges.

---

## REQ-CH-003 — Local Body Submission

**Classification:** PS
**Priority:** P0

Panchayati Raj Institutions and Urban Local Bodies shall be able to submit relevant societal challenges.

---

## REQ-CH-004 — Government Submission

**Classification:** PS
**Priority:** P0

Government departments and agencies shall be able to submit societal challenges.

---

## REQ-CH-005 — Challenge Title

**Classification:** SI
**Priority:** P0

A challenge submission shall contain a concise problem title.

---

## REQ-CH-006 — Challenge Description

**Classification:** PS + SI
**Priority:** P0

A challenge submission shall support a detailed description explaining the problem, context and impact.

---

## REQ-CH-007 — Geographic Location

**Classification:** PS
**Priority:** P0

A challenge shall support geographic information.

The platform should be capable of representing location at relevant administrative levels such as:

* district
* block
* village
* city

and, where available, geographic coordinates.

---

## REQ-CH-008 — Photographic Evidence

**Classification:** PS
**Priority:** P0

Users shall be able to attach photographs as evidence of a challenge.

---

## REQ-CH-009 — Video Evidence

**Classification:** PS
**Priority:** P1

The platform should support video evidence where useful.

---

## REQ-CH-010 — Supporting Documents

**Classification:** PS
**Priority:** P1

Users should be able to attach relevant supporting documents such as reports, measurements or other evidence.

---

## REQ-CH-011 — Affected Population

**Classification:** SI
**Priority:** P1

The challenge submission should allow an estimate of the population affected by the problem.

---

## REQ-CH-012 — Urgency

**Classification:** SI
**Priority:** P1

The submission should allow the reporting user to communicate the perceived urgency of the challenge.

---

## REQ-CH-013 — Evidence Preservation

**Classification:** SI
**Priority:** P0

Original challenge evidence shall remain associated with the original submission even when the challenge is later clustered with similar challenges.

---

# 6. Challenge Management

## REQ-CM-001 — Unique Challenge Identity

**Classification:** SI
**Priority:** P0

Every submitted challenge shall receive a unique Challenge ID.

---

## REQ-CM-002 — Challenge Status

**Classification:** SI
**Priority:** P0

Every challenge shall have a lifecycle status.

---

## REQ-CM-003 — Challenge History

**Classification:** SI
**Priority:** P1

The system should retain the history of important status changes and decisions associated with a challenge.

---

## REQ-CM-004 — Additional Evidence

**Classification:** SI
**Priority:** P1

Authorized users and the submitting citizen, where appropriate, should be able to add additional evidence after initial submission.

---

## REQ-CM-005 — Challenge Search

**Classification:** SI
**Priority:** P1

Authorized users shall be able to search and discover challenges using relevant attributes.

---

## REQ-CM-006 — Challenge Filtering

**Classification:** SI
**Priority:** P1

Challenges should be filterable by relevant dimensions such as:

* location
* domain
* category
* severity
* priority
* status
* maturity

---

# 7. AI Problem Intelligence Requirements

The official PS requires AI-enabled categorization and AI-enabled problem management. The detailed solution interpretation expands this into a broader intelligence layer.

## REQ-AI-001 — AI-Assisted Problem Analysis

**Classification:** PS
**Priority:** P0

The platform shall provide AI-assisted analysis of submitted societal challenges.

---

## REQ-AI-002 — Automatic Categorization

**Classification:** PS
**Priority:** P0

The system shall automatically categorize submitted problems into relevant thematic domains.

Potential domains include:

* education
* agriculture
* healthcare
* water resources
* environment
* energy
* urban development
* accessibility
* public administration
* rural livelihoods
* disaster management

The taxonomy should remain configurable rather than hard-coded permanently.

---

## REQ-AI-003 — Subcategory Classification

**Classification:** SI
**Priority:** P1

The AI should optionally identify a more specific subcategory within a broader domain.

---

## REQ-AI-004 — AI Summary

**Classification:** SI
**Priority:** P1

The AI should generate a concise structured summary from long, informal or multilingual challenge descriptions.

---

## REQ-AI-005 — Entity Extraction

**Classification:** SI
**Priority:** P1

The AI should be capable of extracting useful structured entities from challenge descriptions.

Potential entities include:

* location
* infrastructure
* affected population
* dates
* resources
* affected sectors

---

## REQ-AI-006 — AI Confidence

**Classification:** SI
**Priority:** P1

AI-generated outputs should have an associated confidence indication where technically meaningful.

---

## REQ-AI-007 — Human Review of AI Output

**Classification:** SI
**Priority:** P0

Authorized users shall be able to review and, where appropriate, modify AI-generated classifications and recommendations.

---

## REQ-AI-008 — Explainable AI Output

**Classification:** SI
**Priority:** P1

Important AI recommendations should provide understandable reasons rather than presenting unexplained scores.

---

# 8. Semantic Deduplication Requirements

## REQ-DEDUP-001 — Similar Challenge Detection

**Classification:** PS + SI
**Priority:** P0

The system shall identify challenges that are semantically similar even when their descriptions use different wording.

---

## REQ-DEDUP-002 — Challenge Clustering

**Classification:** SI
**Priority:** P1

Related challenges should be capable of being grouped into clusters representing a common underlying problem.

---

## REQ-DEDUP-003 — Preserve Original Submissions

**Classification:** SI
**Priority:** P0

Clustering shall not destroy the original challenge submissions or their associated evidence.

---

## REQ-DEDUP-004 — Human Review of Ambiguous Similarity

**Classification:** SI
**Priority:** P1

Similarity-based grouping should be reviewable where confidence is insufficient or where the consequences of grouping are significant.

---

# 9. Prioritization Requirements

## REQ-PRI-001 — Challenge Priority

**Classification:** PS
**Priority:** P0

The platform shall support prioritization of societal challenges.

---

## REQ-PRI-002 — Priority Factors

**Classification:** SI
**Priority:** P1

Priority recommendations should consider factors such as:

* severity
* urgency
* affected population
* evidence
* risk
* policy relevance

---

## REQ-PRI-003 — Transparent Priority Recommendation

**Classification:** SI
**Priority:** P1

Users should be able to understand the major factors contributing to a priority recommendation.

---

## REQ-PRI-004 — Human Authority

**Classification:** SI
**Priority:** P0

AI-generated priority recommendations shall not automatically replace authorized human decision-making for consequential prioritization decisions.

---

## REQ-PRI-005 — Configurable Scoring

**Classification:** SI
**Priority:** P1

The exact numerical weighting of priority factors should remain configurable.

No specific weighting scheme is considered an official PS requirement unless later adopted as a project decision.

---

# 10. University Matching Requirements

## REQ-MATCH-001 — University Routing

**Classification:** PS
**Priority:** P0

Validated challenges shall be capable of being routed to appropriate universities.

---

## REQ-MATCH-002 — Academic Discipline Matching

**Classification:** PS
**Priority:** P0

Matching shall consider relevant academic disciplines.

---

## REQ-MATCH-003 — Faculty Expertise Matching

**Classification:** PS + SI
**Priority:** P1

The system should consider faculty expertise when recommending institutions or project capabilities.

---

## REQ-MATCH-004 — Research Capability Matching

**Classification:** PS
**Priority:** P1

The system should consider relevant research expertise and capabilities.

---

## REQ-MATCH-005 — Innovation Facility Matching

**Classification:** PS
**Priority:** P1

Relevant innovation centres, incubation facilities and laboratories should contribute to institutional matching.

---

## REQ-MATCH-006 — Past Project Matching

**Classification:** SI
**Priority:** P1

Relevant previous projects should be considered when evaluating institutional suitability.

---

## REQ-MATCH-007 — Capacity / Availability

**Classification:** SI
**Priority:** P1

Where data is available, current institutional capacity or availability should influence matching.

---

## REQ-MATCH-008 — Explainable Match

**Classification:** SI
**Priority:** P1

University recommendations shall provide understandable reasons for the recommendation.

---

## REQ-MATCH-009 — Human Institutional Allocation

**Classification:** SI
**Priority:** P0

Final institutional allocation shall remain subject to authorized human decision-making.

---

# 11. University Collaboration Requirements

## REQ-UNI-001 — University Profile

**Classification:** PS + SI
**Priority:** P0

Higher Education Institutions shall have structured profiles describing their relevant capabilities.

---

## REQ-UNI-002 — Department Profiles

**Classification:** SI
**Priority:** P1

University profiles should support departments or academic units.

---

## REQ-UNI-003 — Faculty Profiles

**Classification:** SI
**Priority:** P1

The system should represent faculty expertise and mentorship capabilities.

---

## REQ-UNI-004 — Student Skills

**Classification:** SI
**Priority:** P1

The system should represent relevant student skills for project formation.

---

## REQ-UNI-005 — Challenge Review

**Classification:** PS
**Priority:** P0

Universities shall be able to evaluate challenges assigned or recommended to them.

---

## REQ-UNI-006 — Acceptance

**Classification:** PS + SI
**Priority:** P0

A university shall be able to accept an appropriate challenge.

---

## REQ-UNI-007 — Clarification Request

**Classification:** SI
**Priority:** P1

A university should be able to request clarification before accepting a challenge.

---

## REQ-UNI-008 — Project Creation

**Classification:** PS
**Priority:** P0

Universities shall be able to convert an accepted challenge into a project.

---

# 12. Multidisciplinary Team Requirements

## REQ-TEAM-001 — Team Formation

**Classification:** PS
**Priority:** P0

Universities shall be able to constitute multidisciplinary student and faculty teams.

---

## REQ-TEAM-002 — Faculty Mentor

**Classification:** PS
**Priority:** P0

Projects shall support assignment of faculty mentors.

---

## REQ-TEAM-003 — Team Roles

**Classification:** SI
**Priority:** P1

Project members should have defined roles or responsibilities.

---

## REQ-TEAM-004 — Skill-Based Recommendation

**Classification:** SI
**Priority:** P1

The platform may recommend combinations of skills or disciplines required for an accepted challenge.

---

# 13. Solution Proposal Requirements

## REQ-PROP-001 — Proposal Creation

**Classification:** PS
**Priority:** P0

University teams shall be able to prepare solution proposals or research projects.

---

## REQ-PROP-002 — Problem Objectives

**Classification:** SI
**Priority:** P1

A proposal should define the objectives of the solution.

---

## REQ-PROP-003 — Methodology

**Classification:** SI
**Priority:** P1

A proposal should describe its methodology or approach.

---

## REQ-PROP-004 — Resources

**Classification:** SI
**Priority:** P1

A proposal should identify relevant resources or requirements.

---

## REQ-PROP-005 — Timeline

**Classification:** SI
**Priority:** P1

A proposal should contain an expected timeline.

---

## REQ-PROP-006 — Expected Impact

**Classification:** SI
**Priority:** P1

A proposal should describe expected outcomes or impact.

---

# 14. Industry / Startup / MSME Requirements

## REQ-IND-001 — Industry Participation

**Classification:** PS
**Priority:** P0

The platform shall facilitate collaboration between universities and industries.

---

## REQ-IND-002 — Startup Participation

**Classification:** PS
**Priority:** P0

Startups shall be able to participate as innovation partners.

---

## REQ-IND-003 — MSME Participation

**Classification:** PS
**Priority:** P0

MSMEs shall be able to participate as relevant partners.

---

## REQ-IND-004 — CSR Participation

**Classification:** PS
**Priority:** P0

CSR organizations shall be able to participate in supporting relevant projects.

---

## REQ-IND-005 — Research Laboratory Participation

**Classification:** PS
**Priority:** P1

Research laboratories and innovation ecosystems should be able to provide specialized capabilities.

---

## REQ-IND-006 — Mentorship

**Classification:** PS
**Priority:** P0

Partners shall be able to provide mentorship.

---

## REQ-IND-007 — Technical Support

**Classification:** PS
**Priority:** P0

Partners shall be able to provide technical expertise or consultation.

---

## REQ-IND-008 — Funding Support

**Classification:** PS
**Priority:** P0

Relevant partners shall be able to provide or facilitate funding support.

---

## REQ-IND-009 — Prototype Support

**Classification:** PS
**Priority:** P0

Industry and other partners shall be able to support prototyping.

---

## REQ-IND-010 — Testing Support

**Classification:** PS
**Priority:** P1

Partners should be able to provide testing facilities or capabilities.

---

## REQ-IND-011 — Deployment Support

**Classification:** PS
**Priority:** P0

Partners shall be able to support implementation and deployment.

---

## REQ-IND-012 — Collaboration Needs

**Classification:** SI
**Priority:** P1

Projects should be able to publish concrete collaboration requirements such as:

* funding
* mentorship
* hardware
* software
* cloud resources
* GIS expertise
* testing
* deployment support

---

# 15. Project Lifecycle Requirements

## REQ-LIFE-001 — Structured Lifecycle

**Classification:** PS + SI
**Priority:** P0

The platform shall support workflow management across the project lifecycle.

The conceptual lifecycle is:

```text
Submission
↓
AI Understanding
↓
Validation
↓
Deduplication
↓
Prioritization
↓
Institution Matching
↓
University Acceptance
↓
Team Formation
↓
Proposal
↓
Industry Collaboration
↓
Prototype
↓
Pilot
↓
Validation
↓
Deployment
↓
Impact Measurement
↓
Closure & Learning
```

---

## REQ-LIFE-002 — Controlled State Transitions

**Classification:** SI
**Priority:** P0

Important workflow states shall not be freely editable by arbitrary users.

Transitions should be controlled according to role, responsibility and workflow rules.

---

## REQ-LIFE-003 — Validation Stage

**Classification:** PS + SI
**Priority:** P0

Authorized users shall be able to validate submitted challenges.

---

## REQ-LIFE-004 — Prototype Stage

**Classification:** PS
**Priority:** P0

Projects shall support prototype development and documentation.

---

## REQ-LIFE-005 — Pilot Stage

**Classification:** PS
**Priority:** P0

Projects shall support pilot implementation or controlled real-world testing.

---

## REQ-LIFE-006 — Deployment Stage

**Classification:** PS
**Priority:** P0

Projects shall support tracking of deployment or hand-off to an implementing organization.

---

## REQ-LIFE-007 — Closure

**Classification:** SI
**Priority:** P1

Completed projects should have a formal closure stage containing final outcomes and lessons.

---

# 16. Milestone Requirements

## REQ-MILE-001 — Project Milestones

**Classification:** PS
**Priority:** P0

Projects shall support milestone tracking.

---

## REQ-MILE-002 — Deliverables

**Classification:** PS
**Priority:** P0

Projects shall support documentation of deliverables.

---

## REQ-MILE-003 — Milestone Status

**Classification:** SI
**Priority:** P0

Milestones shall have trackable status.

---

## REQ-MILE-004 — Evidence

**Classification:** SI
**Priority:** P1

Relevant project phases should support evidence such as:

* designs
* reports
* test results
* prototype documentation
* pilot results
* deployment evidence

---

## REQ-MILE-005 — Delayed Project Detection

**Classification:** SI
**Priority:** P1

The system should be capable of identifying overdue or stalled milestones.

---

# 17. GIS Requirements

## REQ-GIS-001 — Challenge Map

**Classification:** SI
**Priority:** P0

The platform shall provide geographic visualization of relevant challenges.

---

## REQ-GIS-002 — Geographic Filtering

**Classification:** SI
**Priority:** P1

Users should be able to filter challenges geographically.

---

## REQ-GIS-003 — District-Level Visualization

**Classification:** SI
**Priority:** P1

Government dashboards should support district-level geographic analysis.

---

## REQ-GIS-004 — Heatmaps

**Classification:** SI
**Priority:** P1

The platform should support visualization of challenge concentrations.

---

## REQ-GIS-005 — Geographic Clustering

**Classification:** SI
**Priority:** P1

The system should be capable of identifying geographically related challenge concentrations.

---

## REQ-GIS-006 — Disaster Layers

**Classification:** SI
**Priority:** P2

Where suitable external data exists, disaster-related geographic layers may be integrated.

---

## REQ-GIS-007 — Privacy-Aware Location

**Classification:** SI
**Priority:** P0

Sensitive location information shall not be unnecessarily exposed.

---

# 18. Government Dashboard Requirements

## REQ-DASH-001 — Government Analytics

**Classification:** PS
**Priority:** P0

The platform shall provide dashboards and analytics for government departments.

---

## REQ-DASH-002 — Challenge Volume

**Classification:** PS
**Priority:** P0

Government users shall be able to monitor the number of challenges received.

---

## REQ-DASH-003 — Domain Distribution

**Classification:** PS
**Priority:** P0

Government users shall be able to view domain-wise challenge distribution.

---

## REQ-DASH-004 — Institutional Participation

**Classification:** PS
**Priority:** P0

Government users shall be able to monitor institutional participation.

---

## REQ-DASH-005 — Industry Engagement

**Classification:** PS
**Priority:** P0

Government users shall be able to monitor industry engagement.

---

## REQ-DASH-006 — Project Progress

**Classification:** PS
**Priority:** P0

Government users shall be able to monitor project progress.

---

## REQ-DASH-007 — Innovation Outcomes

**Classification:** PS
**Priority:** P1

The platform should provide visibility into outcomes such as:

* prototypes
* patents
* startups
* technology transfers

---

## REQ-DASH-008 — Social Outcomes

**Classification:** PS
**Priority:** P0

Government users shall be able to monitor measurable social outcomes.

---

# 19. Impact Measurement Requirements

## REQ-IMPACT-001 — Impact Metrics

**Classification:** PS
**Priority:** P0

The system shall support measurement of social impact.

---

## REQ-IMPACT-002 — People Benefited

**Classification:** PS + SI
**Priority:** P1

Projects should record the number or estimated number of people benefited.

---

## REQ-IMPACT-003 — Cost Savings

**Classification:** PS
**Priority:** P1

Where applicable, projects should record cost savings.

---

## REQ-IMPACT-004 — Time Savings

**Classification:** PS
**Priority:** P1

Where applicable, projects should record time savings.

---

## REQ-IMPACT-005 — Environmental Outcomes

**Classification:** PS
**Priority:** P1

Relevant environmental outcomes should be measurable.

---

## REQ-IMPACT-006 — Social Outcomes

**Classification:** PS
**Priority:** P1

Relevant social outcomes should be measurable.

---

## REQ-IMPACT-007 — Evidence-Based Impact

**Classification:** SI
**Priority:** P1

Impact claims should be supported by appropriate evidence wherever practical.

---

# 20. Notification and Communication Requirements

## REQ-COMM-001 — Notifications

**Classification:** PS
**Priority:** P0

The system shall provide notifications throughout the project lifecycle.

---

## REQ-COMM-002 — Status Notifications

**Classification:** SI
**Priority:** P0

Relevant stakeholders should receive notifications when important challenge or project statuses change.

---

## REQ-COMM-003 — Stakeholder Communication

**Classification:** PS
**Priority:** P0

The platform shall facilitate communication among relevant stakeholders.

---

## REQ-COMM-004 — Project Communication

**Classification:** SI
**Priority:** P1

Projects should have appropriate communication capabilities for participating members and partners.

---

# 21. Citizen Transparency Requirements

## REQ-CIT-001 — Challenge Tracking

**Classification:** SI
**Priority:** P0

Citizens should be able to track submitted challenges.

---

## REQ-CIT-002 — Public Challenge Tracking

**Classification:** SI
**Priority:** P1

The platform should provide a shareable tracking mechanism containing only appropriate non-sensitive information.

---

## REQ-CIT-003 — Status Timeline

**Classification:** SI
**Priority:** P1

Citizens should be able to understand the current status and major progress of their challenge.

---

## REQ-CIT-004 — Post-Solution Feedback

**Classification:** SI
**Priority:** P1

Citizens or affected communities should be able to provide feedback after an intervention.

---

# 22. Role and Access Requirements

## REQ-RBAC-001 — Role-Based Access

**Classification:** SI
**Priority:** P0

The platform shall restrict actions and information according to user roles.

---

## REQ-RBAC-002 — Least Privilege

**Classification:** SI
**Priority:** P0

Users shall receive only the access necessary for their responsibilities.

---

## REQ-RBAC-003 — Resource Ownership

**Classification:** SI
**Priority:** P0

Access to resources should also consider ownership and organizational responsibility, not only broad role.

---

## REQ-RBAC-004 — Private Citizen Information

**Classification:** SI
**Priority:** P0

Citizen contact information shall not be exposed to unauthorized users.

---

## REQ-RBAC-005 — Private Evidence

**Classification:** SI
**Priority:** P0

Private evidence shall be protected according to access permissions.

---

# 23. Responsible AI Requirements

## REQ-RAI-001 — Human Oversight

**Classification:** SI
**Priority:** P0

AI shall assist human decision-making rather than silently replace authorized decision-makers for consequential decisions.

---

## REQ-RAI-002 — Explainability

**Classification:** SI
**Priority:** P1

Important AI recommendations shall expose their reasoning or contributing factors where feasible.

---

## REQ-RAI-003 — AI Override

**Classification:** SI
**Priority:** P0

Authorized users shall be able to override AI-generated outputs where appropriate.

---

## REQ-RAI-004 — Confidence-Aware Review

**Classification:** SI
**Priority:** P1

Low-confidence AI outputs should be capable of being routed for additional human review.

---

## REQ-RAI-005 — AI Decision Audit

**Classification:** SI
**Priority:** P1

The system should preserve the relationship between important AI recommendations and subsequent human decisions.

---

## REQ-RAI-006 — Sensitive Data

**Classification:** SI
**Priority:** P0

Sensitive personal information shall not be unnecessarily used for AI ranking or recommendation.

---

# 24. Moderation Requirements

## REQ-MOD-001 — Submission Moderation

**Classification:** SI
**Priority:** P1

The platform should provide mechanisms for handling inappropriate, fraudulent or abusive submissions.

---

## REQ-MOD-002 — Spam Prevention

**Classification:** SI
**Priority:** P1

The public submission system should include appropriate abuse-prevention measures.

---

## REQ-MOD-003 — Misinformation Handling

**Classification:** SI
**Priority:** P1

The system should support human moderation of potentially misleading or inappropriate content.

---

# 25. Accessibility and Language Requirements

## REQ-ACC-001 — Responsive Interface

**Classification:** SI
**Priority:** P0

The platform shall be usable across desktop and mobile screen sizes.

---

## REQ-ACC-002 — Mobile-First Citizen Experience

**Classification:** SI
**Priority:** P1

Citizen-facing workflows should prioritize mobile usability.

---

## REQ-ACC-003 — Low-Bandwidth Practicality

**Classification:** SI
**Priority:** P1

The platform should be designed to remain practical under constrained network conditions where feasible.

---

## REQ-ACC-004 — Hindi Support

**Classification:** SI
**Priority:** P1

The architecture should support Hindi alongside English.

---

## REQ-ACC-005 — Additional Languages

**Classification:** EN
**Priority:** P2

The architecture should remain extensible to additional Indian/local languages.

---

## REQ-ACC-006 — Voice Input

**Classification:** EN
**Priority:** P2

Voice-assisted challenge submission may be supported in later iterations.

---

# 26. Security Requirements

## REQ-SEC-001 — Secure Authentication

**Classification:** SI
**Priority:** P0

The platform shall authenticate users securely.

---

## REQ-SEC-002 — Authorization

**Classification:** SI
**Priority:** P0

Protected actions shall require appropriate authorization.

---

## REQ-SEC-003 — Secure File Handling

**Classification:** SI
**Priority:** P1

Uploaded files shall be subject to appropriate validation and secure storage practices.

---

## REQ-SEC-004 — Auditability

**Classification:** SI
**Priority:** P1

Important administrative and workflow actions should be auditable.

---

## REQ-SEC-005 — Abuse Prevention

**Classification:** SI
**Priority:** P1

Public-facing submission functionality should be protected against abuse.

---

# 27. Data Requirements

## REQ-DATA-001 — Structured Challenge Data

**Classification:** SI
**Priority:** P0

Challenges shall be stored as structured records rather than only unstructured documents.

---

## REQ-DATA-002 — Evidence Association

**Classification:** SI
**Priority:** P0

Evidence shall remain associated with its corresponding challenge.

---

## REQ-DATA-003 — User Identity

**Classification:** SI
**Priority:** P0

The platform shall maintain appropriate user and organizational identity information.

---

## REQ-DATA-004 — Institution Capability Data

**Classification:** SI
**Priority:** P0

The system shall represent institutional capabilities sufficiently to support matching.

---

## REQ-DATA-005 — Project Data

**Classification:** SI
**Priority:** P0

Projects shall have structured records separate from the original challenge where appropriate.

---

## REQ-DATA-006 — Impact Data

**Classification:** SI
**Priority:** P1

Impact metrics shall be represented as structured data so they can be analyzed.

---

## REQ-DATA-007 — Audit Data

**Classification:** SI
**Priority:** P1

Important decisions and workflow events should have an audit trail.

---

# 28. Non-Functional Requirements

## REQ-NFR-001 — Scalability

**Priority:** P1

The architecture should be capable of expanding from an initial implementation toward statewide Jharkhand usage.

---

## REQ-NFR-002 — Maintainability

**Priority:** P1

The implementation should use modular components so that challenge management, AI, GIS, projects, collaboration and analytics can evolve independently where appropriate.

---

## REQ-NFR-003 — Reliability

**Priority:** P1

Critical workflow operations should provide predictable and recoverable behavior.

---

## REQ-NFR-004 — Performance

**Priority:** P1

Normal user-facing operations should respond within practical interactive timeframes.

Long-running AI or processing operations should not unnecessarily block the primary user interface.

---

## REQ-NFR-005 — Auditability

**Priority:** P1

Important decisions and lifecycle transitions should be traceable.

---

## REQ-NFR-006 — Privacy

**Priority:** P0

The system shall protect private information according to the user's role and the sensitivity of the data.

---

## REQ-NFR-007 — Extensibility

**Priority:** P1

The architecture should permit future additions such as:

* mobile applications
* additional languages
* advanced GIS
* predictive disaster analytics
* additional external integrations
* statewide scaling
* expanded innovation marketplace functionality

---

# 29. Core Workflow State Requirements

The platform should eventually implement a controlled lifecycle similar to:

```text
SUBMITTED
    ↓
UNDER REVIEW
    ↓
VALIDATED
    ↓
CLUSTERED
    ↓
PRIORITIZED
    ↓
MATCHING
    ↓
UNIVERSITY ACCEPTED
    ↓
PROJECT ACTIVE
    ↓
PROTOTYPE
    ↓
PILOT
    ↓
DEPLOYMENT
    ↓
COMPLETED
    ↓
IMPACT VERIFIED
    ↓
CLOSED
```

These states are a **product workflow model**, not permission rules by themselves.

The eventual workflow specification must define:

* who can cause each transition
* what conditions are required
* whether rejection is possible
* whether clarification is possible
* whether a challenge can return to an earlier state
* whether multiple projects can originate from one challenge
* how clustered challenges relate to projects
* what happens when a university rejects a challenge
* what happens when a project stalls
* how a project is reopened

These details belong in `COMPLETE_WORKFLOW.md`.

---

# 30. MVP Requirements

The MVP should demonstrate the core value of the platform rather than attempt to implement every possible feature.

The recommended core MVP contains:

### Authentication / Roles

* Citizen
* University
* Industry
* Government

### Challenge

* challenge submission
* location
* image upload
* Challenge ID
* status tracking

### AI

* category
* summary
* priority
* tags
* similarity / deduplication

### University

* capability profile
* AI matching
* explainable match
* challenge acceptance
* project creation
* student/faculty team

### Project

* milestones
* status tracking
* deliverables

### Industry

* collaboration request
* collaboration acceptance

### GIS

* challenge map
* relevant filters
* hotspot visualization

### Government

* challenge dashboard
* project dashboard
* impact KPIs

### Citizen

* public tracking
* status updates
* feedback

### Demonstration

One complete disaster-management scenario should run through the system.

The recommended scenario is a flood-prone school or village.

---

# 31. Flagship End-to-End Acceptance Scenario

The core MVP should be considered highly successful if the following scenario can be demonstrated:

```text
Citizen
  ↓
Reports flood-prone school/village
  ↓
Adds description + photograph + location
  ↓
AI analyzes problem
  ↓
Category / summary / tags / priority generated
  ↓
Similar reports detected
  ↓
Reports clustered
  ↓
Government validates
  ↓
Universities ranked
  ↓
Match reasons displayed
  ↓
University accepts
  ↓
Faculty + students form multidisciplinary team
  ↓
Project created
  ↓
Industry collaboration need published
  ↓
Industry partner accepts
  ↓
Prototype milestone
  ↓
Pilot milestone
  ↓
Impact recorded
  ↓
Government dashboard updated
  ↓
Citizen receives update
  ↓
Citizen provides feedback
```

This scenario should be treated as the primary vertical slice for the first implementation.

---

# 32. Requirements Explicitly Not Yet Finalized

The following are intentionally **not requirements** at the current stage:

* React vs another frontend framework
* Vite vs another build system
* Node.js vs another backend runtime
* Express vs NestJS
* MongoDB vs PostgreSQL
* exact database schema
* exact embedding model
* exact LLM provider
* exact AI model
* exact GIS provider
* exact object-storage provider
* exact deployment provider
* exact authentication implementation
* exact numerical priority weights
* exact university matching formula
* exact semantic similarity threshold
* exact API endpoint naming

These are architecture and implementation decisions.

They should be finalized only after the requirements and workflows have been fully understood.

---

# 33. Future / Enhancement Requirements

The following may be considered after the core platform works.

### EN-001 — Native Mobile Application

A dedicated mobile application for citizen and field workflows.

### EN-002 — Multilingual Voice Submission

Voice-first challenge reporting in additional local languages.

### EN-003 — Advanced Disaster Analytics

Predictive and external-data-driven disaster intelligence.

### EN-004 — External Data Integration

Integration with relevant government, environmental, geographic or disaster datasets.

### EN-005 — Industry Funding Marketplace

More advanced project funding discovery and transaction workflows.

### EN-006 — Digital Approvals

Formal digital approval workflows where appropriate.

### EN-007 — Innovation Repository

Reusable repository of completed solutions, research, assets and lessons.

### EN-008 — Cross-State Knowledge Exchange

Extension beyond Jharkhand into a broader societal innovation network.

---

# 34. Requirement Traceability

The core official PS requirements should map to the following platform areas:

| Official PS Requirement                           | Nivaaran Area                  |
| ------------------------------------------------- | ------------------------------ |
| Citizen/community/government challenge submission | Challenge Management           |
| Multimedia evidence                               | Challenge Evidence             |
| Geographic location                               | GIS                            |
| AI categorization                                 | AI Intelligence                |
| AI prioritization                                 | AI Intelligence                |
| AI deduplication                                  | Semantic Deduplication         |
| Routing to appropriate universities               | University Matching            |
| Academic expertise                                | University Capability Profiles |
| Research capabilities                             | University Matching            |
| Innovation facilities                             | University Matching            |
| University challenge evaluation                   | University Collaboration       |
| Multidisciplinary teams                           | Team Management                |
| Faculty mentors                                   | Team Management                |
| Solution proposals                                | Proposal Management            |
| Industry collaboration                            | Industry Module                |
| Startup/MSME participation                        | Industry Module                |
| CSR participation                                 | Collaboration                  |
| Research laboratories                             | Collaboration                  |
| Mentorship                                        | Collaboration                  |
| Funding                                           | Collaboration                  |
| Prototyping                                       | Project Lifecycle              |
| Testing                                           | Project Lifecycle              |
| Deployment                                        | Project Lifecycle              |
| Milestones                                        | Project Management             |
| Deliverables                                      | Project Management             |
| Government monitoring                             | Government Dashboard           |
| Challenge analytics                               | Analytics                      |
| Institutional participation                       | Analytics                      |
| Industry engagement                               | Analytics                      |
| Project progress                                  | Analytics                      |
| Social outcomes                                   | Impact Measurement             |
| Notifications                                     | Communication                  |
| Stakeholder interaction                           | Communication                  |

The official PS therefore maps naturally into a connected system rather than a set of unrelated features.

---

# 35. Requirement-to-Architecture Principle

Every significant requirement should eventually have a traceable path:

```text
PROBLEM STATEMENT
       ↓
REQUIREMENT
       ↓
ACTOR
       ↓
WORKFLOW
       ↓
DOMAIN / MODULE
       ↓
DATA
       ↓
API / SERVICE
       ↓
UI
       ↓
TEST
```

For example:

```text
PS:
Route validated problems to suitable universities

        ↓

REQ-MATCH-001
University Routing

        ↓

Actor:
Government / Platform / University

        ↓

Workflow:
Validated → Prioritized → Matching

        ↓

Module:
University Matching

        ↓

Data:
Challenge requirements
University capabilities
Faculty expertise
Facilities
Past projects

        ↓

AI:
Matching / recommendation engine

        ↓

UI:
University recommendations + reasons

        ↓

Test:
Given a flood + GIS + IoT challenge,
relevant institutions should rank appropriately.
```

This traceability should be maintained as the project evolves.

---

# 36. Requirement Status

At the current stage, requirements should be considered:

**Defined → Not necessarily implemented**

The existence of a requirement in this document does not mean that the corresponding functionality already exists in the codebase.

Implementation status should later be tracked separately.

A future status model can be:

```text
PROPOSED
    ↓
APPROVED
    ↓
DESIGNED
    ↓
IN DEVELOPMENT
    ↓
IMPLEMENTED
    ↓
TESTED
    ↓
VERIFIED
```

---

# 37. Current Scope Principle

Nivaaran is intentionally broad because the PS describes an ecosystem rather than a single isolated feature.

However, the implementation should not attempt to build every possible capability simultaneously.

The primary principle is:

> **Build one complete, convincing problem-to-impact journey before expanding horizontally.**

The first version should therefore prioritize:

```text
DISCOVER
   ↓
UNDERSTAND
   ↓
PRIORITIZE
   ↓
MATCH
   ↓
COLLABORATE
   ↓
BUILD
   ↓
PILOT
   ↓
DEPLOY
   ↓
MEASURE IMPACT
```

A smaller system in which this chain genuinely works is preferable to a large system containing many disconnected screens.

---

# 38. Source-of-Truth Hierarchy

When conflicting information is encountered, use the following hierarchy:

```text
1. Official SIH Problem Statement
          ↓
2. Approved Product Requirements
          ↓
3. Approved Architecture Decisions
          ↓
4. Technical Specifications
          ↓
5. Implementation Details
```

The official Problem Statement defines **what SIH requires**.

The requirements document converts those requirements into a structured product specification.

Architecture documents determine **how the approved product will be built**.

Implementation details must not silently redefine product requirements.

---

# 39. Final Requirement Philosophy

Nivaaran should ultimately satisfy the following principle:

> A societal problem should not disappear after submission.

Instead, the platform should provide a structured path through which that problem can be:

```text
DISCOVERED
    ↓
UNDERSTOOD
    ↓
VALIDATED
    ↓
DEDUPLICATED
    ↓
PRIORITIZED
    ↓
CONNECTED TO CAPABILITY
    ↓
TURNED INTO A PROJECT
    ↓
SUPPORTED BY PARTNERS
    ↓
BUILT
    ↓
PILOTED
    ↓
DEPLOYED
    ↓
MEASURED
    ↓
LEARNED FROM
```

The central product requirement is therefore not any individual dashboard, AI model, database, map or frontend screen.

It is the ability of the platform to **connect real societal demand with the people, institutions, knowledge, technology and resources capable of producing measurable solutions**.

---

# 40. Next Documents

This requirements document should serve as the foundation for the next documentation layer.

The next documents should be developed in this order:

```text
REQUIREMENTS.md
       ↓
ACTORS_AND_ROLES.md
       ↓
COMPLETE_WORKFLOW.md
       ↓
SYSTEM_ARCHITECTURE.md
       ↓
FRONTEND_ARCHITECTURE.md
       ↓
BACKEND_ARCHITECTURE.md
       ↓
DATABASE_DESIGN.md
       ↓
AI_ARCHITECTURE.md
       ↓
GIS_ARCHITECTURE.md
       ↓
API_CONTRACTS.md
       ↓
RBAC_MATRIX.md
       ↓
IMPLEMENTATION
```

No technical architecture should be considered final merely because it appears in an earlier proposal or technical specification. Architecture decisions should be made after the requirements and workflows are sufficiently understood.
