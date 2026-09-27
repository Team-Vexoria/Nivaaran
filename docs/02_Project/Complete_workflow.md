# Nivaaran — Complete Workflow & Lifecycle Specification

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** Complete Workflow & Lifecycle
**Status:** Foundational Product Specification

---

# 1. Purpose

This document defines how a societal challenge moves through the Nivaaran platform from its initial submission to final impact measurement and closure.

The official problem statement requires workflow management covering problem review, institutional allocation, project monitoring, stakeholder communication, milestone tracking and solution validation. The supporting solution documents expand this into a 16-stage challenge-to-impact lifecycle.
The workflow is the central business process of Nivaaran.

Everything else in the platform should ultimately support some part of this lifecycle.

---

# 2. Core Lifecycle

```text
SUBMISSION
    ↓
AI UNDERSTANDING
    ↓
VALIDATION
    ↓
DEDUPLICATION / CLUSTERING
    ↓
PRIORITIZATION
    ↓
INSTITUTION MATCHING
    ↓
UNIVERSITY ACCEPTANCE
    ↓
TEAM FORMATION
    ↓
PROPOSAL
    ↓
INDUSTRY / CSR COLLABORATION
    ↓
PROTOTYPE
    ↓
PILOT
    ↓
VALIDATION
    ↓
DEPLOYMENT
    ↓
IMPACT MEASUREMENT
    ↓
CLOSURE & LEARNING
```

The strongest product mental model is:

> **A single societal challenge progressively gains structure, legitimacy, capability, resources, implementation and measurable outcomes.**

The detailed analysis explicitly identifies this problem-to-impact progression as the core of the platform.

---

# 3. Important Workflow Concepts

## 3.1 Challenge

A **Challenge** is the original societal problem submitted to Nivaaran.

It is the primary object entering the workflow.

---

## 3.2 Cluster

A **Cluster** is a group of challenges identified as semantically or geographically related.

A cluster does not necessarily mean that all submissions become one project.

The original submissions and their evidence must remain preserved.

---

## 3.3 Project

A **Project** is a structured solution-development effort created from an accepted challenge.

---

## 3.4 Milestone

A **Milestone** is a defined project checkpoint with a deliverable, status and expected completion point.

---

## 3.5 Pilot

A **Pilot** is a controlled or real-world implementation used to test a solution before broader deployment.

---

## 3.6 Impact

**Impact** represents measurable outcomes resulting from the intervention.

Examples include:

* people benefited
* cost saved
* time saved
* environmental outcomes
* social outcomes
* community satisfaction

These are consistent with the impact requirements described in the supporting material.

---

# 4. Workflow Design Principle

The lifecycle is not simply a sequence of pages.

Each stage should have:

```text
ENTRY CONDITION
      ↓
ACTOR
      ↓
INPUT
      ↓
PROCESS
      ↓
DECISION
      ↓
OUTPUT
      ↓
NEXT STATE
      ↓
NOTIFICATION / AUDIT
```

This makes the workflow explicit and eventually allows it to become a proper backend state machine.

---

# 5. Stage 1 — Submission

## Purpose

Capture a real societal problem from a citizen, community, local body or government organization.

The official PS explicitly requires citizens, community organizations, local bodies and government agencies to be able to submit societal challenges using web/mobile interfaces with supporting media and location information.

---

## Actors

Primary:

* Citizen
* Community Organization / NGO
* PRI
* ULB
* Government Department

---

## Inputs

At minimum:

```text
Problem title
Problem description
Location
```

Recommended supporting information:

```text
Category / subcategory
Photos
Video
Documents
People affected
Urgency
Contact information
```

The source specification identifies these submission fields and their relative importance.

---

## Processing

After submission:

```text
Validate basic form data
        ↓
Store challenge
        ↓
Store evidence
        ↓
Generate Challenge ID
        ↓
Set status = SUBMITTED
```

---

## Output

A Challenge record containing:

* unique ID
* submission information
* location
* evidence references
* submitter
* timestamp
* initial status

---

## Notifications

The submitting user should receive confirmation.

Example:

> Challenge `JH-000421` has been submitted successfully.

---

# 6. Stage 2 — AI Understanding

## Purpose

Convert unstructured challenge information into structured information.

The project requires AI-assisted categorization and the supporting analysis expands this to summarization, classification and entity extraction.

---

## Trigger

A newly submitted challenge enters the AI analysis pipeline.

---

## Inputs

```text
Title
Description
Evidence metadata
Location
User-provided category
```

---

## AI Tasks

Potential outputs:

```text
Summary
Domain
Sub-domain
Tags
Affected sector
Entities
Severity indicators
Urgency indicators
Confidence
```

---

## Example

Input:

> “Every monsoon the road to our school gets completely under water and children cannot reach school for many days.”

Output:

```text
Domain: Disaster Management
Sub-domain: Flood
Affected sector: Education
Infrastructure: School access road
Severity: High
Tags:
    flood
    education
    road
    children

Summary:
Repeated flooding blocks access to a school.

Confidence:
High
```

This kind of transformation is explicitly illustrated in the supporting analysis.

---

## Human Role

AI output is advisory.

It should be possible for an authorized reviewer to correct AI-generated information.

---

## Output

Challenge is enriched with structured AI information.

---

# 7. Stage 3 — Validation

## Purpose

Determine whether the submitted challenge is sufficiently credible, actionable and documented.

The supporting workflow explicitly places authorized human validation after AI understanding.

---

## Primary Actor

Authorized reviewer.

Typically:

* Government
* PRI / ULB
* authorized community organization
* another explicitly authorized reviewer

---

## Reviewer Sees

```text
Original description
Evidence
Location
AI summary
AI classification
AI confidence
Affected population
AI suggestions
Related challenges
```

---

## Possible Decisions

```text
VALIDATE
REQUEST CLARIFICATION
REJECT
```

---

## Validation

If valid:

```text
status = VALIDATED
```

---

## Clarification

If information is insufficient:

```text
status = UNDER_REVIEW
clarification_requested = true
```

The submitter can then provide additional evidence/information.

---

## Rejection

If the challenge is not acceptable:

```text
status = REJECTED
```

**Note:** `REJECTED` is a proposed workflow state for implementation. The official/supporting status taxonomy does not provide a fully elaborated rejection state, so its exact handling must be finalized later.

---

# 8. Stage 4 — Deduplication / Clustering

## Purpose

Identify challenges describing the same or closely related underlying problem.

The supporting documentation emphasizes semantic similarity rather than exact keyword matching.

---

## Inputs

```text
Challenge description
AI summary
Tags
Location
Existing validated challenges
Existing clusters
```

---

## Process

Conceptually:

```text
Challenge
    ↓
Semantic representation
    ↓
Similarity search
    ↓
Potentially related challenges
    ↓
Cluster recommendation
```

---

## Example

```text
“Road near school flooded.”

“Children cannot cross school road during rain.”

“School road becomes underwater.”

“Water blocks school access every monsoon.”
```

These may be grouped into one cluster.

---

## Important Rule

Clustering must not erase original submissions.

```text
Cluster #42
├── Challenge #101
├── Challenge #144
├── Challenge #188
├── Challenge #201
└── Challenge #247
```

Each challenge retains:

* its submitter
* original description
* evidence
* location
* timestamps

This preservation principle is explicitly required by the supporting solution interpretation.

---

## Ambiguous Similarity

A similarity recommendation should not automatically merge unrelated problems.

Where confidence is low:

```text
AI recommendation
      ↓
Human review
      ↓
Accept / Reject cluster relationship
```

---

# 9. Stage 5 — Prioritization

## Purpose

Determine which validated challenges deserve greater attention.

## The official PS calls for AI-enabled categorization and prioritization, while the solution documentation identifies severity, urgency, affected population, evidence, risk and policy relevance as potential factors.

## Inputs

Potential factors:

```text
Severity
Urgency
Affected population
Evidence
Risk
Policy relevance
```

---

## Output

```text
Priority recommendation
Priority factors
Explanation
Confidence where applicable
```

---

## Example

```text
Priority: 87 / 100

Severity          +20
Urgency           +18
Population impact +17
Risk              +15
Evidence          +10
Policy relevance   +7

Total              87
```

These numbers are illustrative only.

The exact weighting is **not an official PS-specified formula** and must remain a later project decision.

---

## Human Decision

AI recommends.

Authorized human confirms, modifies or rejects the recommendation when required.

---

# 10. Stage 6 — Institution Matching

## Purpose

Determine which universities or relevant institutions are best positioned to work on the challenge.

The official PS explicitly requires validated problems to be routed to suitable universities based on disciplines, research expertise, innovation centres, incubation facilities and faculty specialization.

The supporting specification further expands matching using facilities, previous projects and capacity.

---

## Inputs

Challenge:

```text
Domain
Sub-domain
Required skills
Required facilities
Location
Project complexity
Expected scale
```

University:

```text
Departments
Faculty expertise
Research areas
Laboratories
Facilities
Past projects
Innovation centres
Student skills
Service capacity
```

---

## Processing

Conceptually:

```text
Challenge requirements
        ↓
Capability representation
        ↓
Candidate institutions
        ↓
Compatibility evaluation
        ↓
Ranked recommendations
```

---

## Output

Example:

```text
University A
Match: 91%

Reasons:
✓ Civil Engineering expertise
✓ GIS laboratory
✓ IoT capability
✓ Flood research
✓ Relevant previous project
✓ Faculty availability
```

The supporting analysis explicitly emphasizes that match scores should include reasons.

---

# 11. Stage 7 — University Acceptance

## Purpose

Allow the recommended university to make an institutional decision.

---

## Possible Actions

```text
ACCEPT
REQUEST CLARIFICATION
DECLINE
```

`ACCEPT` and clarification are directly represented in the supporting workflow. A decline path is a logical workflow requirement that should be formalized in implementation.

---

## Accept

```text
Challenge
    ↓
University Accepted
    ↓
Project creation permitted
```

---

## Clarification

```text
University
    ↓
Clarification request
    ↓
Challenge submitter / government
    ↓
Additional information
    ↓
University review
```

---

## Decline

A decline should trigger:

```text
Record reason
       ↓
Return to matching
       ↓
Recommend alternate institutions
```

This prevents a challenge from becoming permanently stalled because one university declines it.

The supporting risk analysis explicitly identifies multi-university recommendations and escalation as a mitigation.

---

# 12. Stage 8 — Team Formation

## Purpose

Convert institutional acceptance into an executable project team.

---

## Participants

```text
University
Faculty
Students
Potential external experts
```

---

## Inputs

Project capability requirements.

Example:

```text
AI/ML
GIS
IoT
Civil Engineering
Frontend / Backend
```

---

## Process

```text
Accepted Challenge
       ↓
Project capability requirements
       ↓
Available student/faculty skills
       ↓
Team formation
```

The supporting documentation specifically describes multidisciplinary team formation and gives complementary skills as a model.

---

## Output

```text
Project Team

Faculty Mentor
Student A — GIS
Student B — IoT
Student C — AI/ML
Student D — Full Stack
```

---

# 13. Stage 9 — Proposal

## Purpose

Convert the challenge into a formal solution proposal.

---

## Proposal Components

At minimum:

```text
Problem
Objectives
Solution concept
Methodology
Resources
Budget where applicable
Timeline
Expected impact
```

## The official PS requires universities to prepare solution proposals or research projects, while the supporting workflow defines these records in more detail.

## Proposal Review

The proposal may be reviewed by:

* faculty
* university authority
* government
* appropriate external experts

depending on workflow stage and authority.

---

# 14. Stage 10 — Industry / CSR Collaboration

## Purpose

Bring external capabilities into a project when required.

---

## Project Can Publish Needs

Example:

```text
Need:
IoT prototype hardware

Need:
GIS expert

Need:
Prototype funding

Need:
Testing facility

Need:
Deployment partner
```

The supporting material explicitly proposes this collaboration-marketplace model.

---

## Partner Actions

An industry/CSR/research partner can:

```text
Discover project
      ↓
Review needs
      ↓
Express interest
      ↓
Submit collaboration offer
      ↓
Project reviews offer
      ↓
Accept / reject
```

---

## Collaboration Types

```text
Mentorship
Technical consultation
Funding
Hardware
Software
Cloud resources
Testing
Deployment
Domain expertise
```

---

# 15. Stage 11 — Prototype

## Purpose

Develop the proposed solution.

---

## Project Records

The project should support:

```text
Designs
Technical documentation
Source-code references
Hardware
Tests
Deliverables
Milestone progress
```

The supporting documentation identifies these as prototype records/deliverables.

---

## Milestone Example

```text
M1 — Requirements complete
M2 — Architecture complete
M3 — Prototype complete
M4 — Field test ready
```

---

# 16. Stage 12 — Pilot

## Purpose

Test the prototype under controlled or real-world conditions.

---

## Pilot Record

Should potentially contain:

```text
Pilot location
Participants
Duration
Metrics
Issues
Observations
Evidence
```

The supporting project lifecycle explicitly identifies these pilot records.

---

## Pilot Example

```text
Location:
Village X

Participants:
School + local community

Prototype:
Flood monitoring system

Metrics:
Alert latency
Sensor uptime
Warnings generated
False alerts
Response time
```

---

# 17. Stage 13 — Validation

This is a separate validation from the initial challenge validation.

## Initial Validation

Answers:

> "Is this a credible/actionable societal problem?"

## Post-Pilot Validation

Answers:

> "Does the developed solution actually work and produce useful results?"

---

## Review Inputs

```text
Prototype results
Pilot metrics
Technical evidence
Community feedback
Project documentation
```

---

## Potential Reviewers

```text
Government
Community representatives
Technical experts
University
Other authorized evaluators
```

---

## Output

```text
Validation result
Review comments
Evidence
Recommendations
Decision
```

---

# 18. Stage 14 — Deployment

## Purpose

Move an approved solution into actual use.

---

## Prerequisites

Possible conditions:

```text
Prototype complete
Pilot complete
Validation successful
Deployment plan
Responsible organization identified
Required resources available
```

The exact approval rules are implementation decisions that should be finalized later.

---

## Deployment Record

```text
Deployment location
Deployment date
Responsible organization
Version
Deployment evidence
Operating plan
Support arrangement
```

---

# 19. Stage 15 — Impact Measurement

## Purpose

Determine what changed as a result of the intervention.

---

## Example

```text
BEFORE

School access disrupted:
18 days / monsoon

        ↓

INTERVENTION

Flood monitoring + alert system

        ↓

AFTER

School access disrupted:
6 days / monsoon

        ↓

OUTCOME

67% reduction
```

The numbers above are an illustrative example from the solution analysis, not an official target. The official/supporting requirements focus on measurable outcomes such as people reached, cost/time saved and environmental/social indicators.

---

## Impact Dimensions

Potential categories:

```text
Social
Economic
Environmental
Operational
Educational
Health
Infrastructure
Safety
```

Only relevant categories should be used for a particular project.

---

# 20. Stage 16 — Closure & Learning

## Purpose

Formally finish the project while preserving useful knowledge.

---

## Closure Package

Potential records:

```text
Final report
Project outcomes
Impact measurements
Lessons learned
Reusable assets
Technical documentation
IP outcomes
Startup outcomes
Deployment information
```

The supporting lifecycle explicitly calls for final reports, lessons, reusable assets and potential IP/startup outcomes.

---

# 21. Challenge State Machine

The conceptual challenge status sequence is:

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

The supporting technical specification explicitly defines this status taxonomy.

The status taxonomy should be treated as the conceptual backbone of the workflow.

---

# 22. Workflow Is Not Strictly Linear

The visual model is linear for clarity.

The actual system should support controlled branching.

For example:

```text
UNDER REVIEW
   │
   ├── VALIDATE
   │
   ├── REQUEST CLARIFICATION
   │       ↓
   │   UNDER REVIEW
   │
   └── REJECT
```

University acceptance:

```text
MATCHING
   │
   ├── UNIVERSITY A ACCEPTS
   │
   ├── UNIVERSITY A REQUESTS CLARIFICATION
   │
   └── UNIVERSITY A DECLINES
             ↓
       MATCHING / ESCALATION
```

Pilot validation:

```text
PILOT
   ↓
VALIDATION
   │
   ├── SUCCESS
   │     ↓
   │  DEPLOYMENT
   │
   └── NEEDS IMPROVEMENT
         ↓
      PROTOTYPE / PILOT
```

The exact state transitions must be finalized before implementation.

---

# 23. One Challenge Can Have Multiple Participants

A challenge may involve:

```text
Citizen
+
Government
+
University
+
Faculty
+
Students
+
Industry
+
CSR
+
Research Lab
```

The system therefore should not model a challenge as belonging to only one user.

Instead:

```text
Challenge
   ↓
Stakeholder relationships
```

---

# 24. One Challenge vs One Project

This relationship must be explicitly designed.

The simplest initial model is:

```text
Challenge
    ↓
Project
```

However, the broader ecosystem may later require:

```text
Challenge
   ↓
Project A
Project B
Project C
```

For example, one broad challenge could produce:

* an engineering solution
* a policy/research project
* a technological solution

Whether multiple projects per challenge are allowed in the MVP should be finalized before database design.

---

# 25. Cluster vs Challenge vs Project

These three concepts must never be treated as identical.

```text
CHALLENGE
Individual submitted problem
        ↓
CLUSTER
Group of related submissions
        ↓
PROJECT
Actual solution-development effort
```

For example:

```text
5 citizens
   ↓
5 challenges
   ↓
1 semantic cluster
   ↓
1 university project
```

But the architecture should remain capable of supporting cases where one cluster produces more than one project.

---

# 26. Notifications Throughout the Workflow

Important events should generate appropriate notifications.

Examples:

```text
Challenge submitted
AI analysis completed
Clarification requested
Challenge validated
Priority changed
University match generated
University accepted
University declined
Team formed
Proposal submitted
Industry collaboration requested
Industry collaboration accepted
Milestone approaching
Milestone overdue
Pilot started
Pilot completed
Validation completed
Deployment approved
Impact verified
Challenge closed
```

The official PS requires a notification and communication system covering stakeholders throughout the lifecycle.

---

# 27. Audit Events

Important actions should generate audit entries.

Example:

```text
EVENT

Actor:
Government Officer

Action:
Priority changed

Previous:
72

AI recommendation:
87

Human decision:
78

Reason:
Population estimate revised

Timestamp:
...
```

The source material explicitly requires auditability of AI suggestions and human decisions.

---

# 28. AI vs Human Decision Boundary

The default model is:

```text
                    AI
                     │
              Recommendation
                     │
                     ▼
                  HUMAN
                     │
           Final authorized decision
                     │
                     ▼
                   STATE
```

This applies particularly to consequential decisions such as:

* validation
* final prioritization
* institutional allocation

The technical specification explicitly requires human approval for consequential decisions.

---

# 29. Failure and Recovery Principles

## AI Failure

If AI analysis fails:

```text
Challenge remains valid
        ↓
AI status = failed / retryable
        ↓
Retry or human processing
```

A challenge should not disappear because an AI service is temporarily unavailable.

---

## University Rejection

```text
University declines
       ↓
Record reason
       ↓
Return to matching
       ↓
Alternative institutions
```

---

## Project Delay

```text
Milestone overdue
       ↓
Notification
       ↓
Escalation where appropriate
       ↓
Project review
```

The supporting risk analysis explicitly identifies milestone reminders, escalation and progress analytics as a mitigation for stalled projects.

---

## Pilot Failure

A failed pilot should not necessarily mean project closure.

Possible path:

```text
Pilot
 ↓
Validation
 ↓
Needs improvement
 ↓
Prototype refinement
 ↓
New pilot
```

---

# 30. Public vs Internal Workflow Visibility

Not every state transition needs to expose all internal information to the citizen.

Example:

### Citizen may see

```text
Submitted
Under Review
Validated
Matched
Project Active
Pilot
Deployed
Impact Verified
Closed
```

### Internal users may additionally see

```text
AI confidence
Internal review notes
Private evidence
Match reasoning
Internal risk register
Confidential partner discussion
```

Public visibility must therefore be separated from internal workflow data.

---

# 31. Workflow Data Produced at Each Stage

| Stage                  | Major output                               |
| ---------------------- | ------------------------------------------ |
| Submission             | Challenge + evidence + location            |
| AI Understanding       | Summary + category + entities + confidence |
| Validation             | Validation decision + reviewer information |
| Deduplication          | Cluster relationship                       |
| Prioritization         | Priority + factors + explanation           |
| Matching               | Ranked institutions + reasons              |
| Acceptance             | Institution decision                       |
| Team Formation         | Team + roles                               |
| Proposal               | Proposal document                          |
| Industry Collaboration | Collaboration records                      |
| Prototype              | Technical artifacts + tests                |
| Pilot                  | Pilot metrics + observations               |
| Validation             | Evaluation report                          |
| Deployment             | Deployment record                          |
| Impact                 | Impact metrics + evidence                  |
| Closure                | Final report + lessons + reusable assets   |

This table should eventually map directly to the data model.

---

# 32. End-to-End Examples

## 32.1 Flagship Demonstration: Tupudana Culvert Failure Case Study

A comprehensive, realistic end-to-end demonstration of the Nivaaran lifecycle applied to a critical public infrastructure disaster in Jharkhand:

### Problem Profile
* **Incident ID:** `NIV-JH-RNC-2026-0042`
* **Classification:** `PUBLIC_INFRASTRUCTURE_ROAD_BRIDGES` (`GOV-CIVIC-04` / Culvert Washout)
* **Location:** Tupudana–Balalong Arterial Link Road (`KM 4+350`), Hatia Block, Ranchi District (`23.2842° N, 85.3126° E`)
* **Incident Context:** Flash floods in the Subarnarekha catchment combined with heavy stone-tipper traffic collapsed a 45-year-old 1.8m masonry hume-pipe culvert. A 4.2m deep by 7.8m wide chasm severed access between Hatia Rail Yard, Tupudana Industrial Estate (35 MSMEs), and 14 tribal villages (22,000 residents), forcing ambulances onto a 14.5km detour (+35 mins).

### 9-Stage Operational Workflow

```text
1. CITIZEN COMPLAINT
   - Informants: Truck driver (Sunil Linda) + Balalong Mukhiya (Rameshwar Oraon).
   - Intake: Multilingual IVR (Nagpuri/Hindi) + WhatsApp Civic Bot with 3 geotagged photos.
   - Initial State: SUBMITTED (Stage 1).

        ↓

2. AI VERIFICATION & PII MASKING
   - Multimodal Perception: ASR transcription + Computer Vision defect classification (96.4% structural failure, 94.8% washout).
   - Privacy Guard: Automated PII redaction (citizen phone, Aadhaar, license plates, face blurring).
   - Tamper Proofing: SHA-256 evidence fingerprint hashed into ledger.
   - State: AI_TRIAGED (Stage 2).

        ↓

3. DUPLICATE DETECTION & SPATIAL CLUSTERING
   - PostGIS query ST_DWithin (250m radius) + pg_trgm lexical similarity (0.91) detects 14 independent citizen reports.
   - Master-Cluster Consolidation: Designates CH-JH-RNC-2026-0042 as Master; 13 secondary reports converted to subscribers.
   - Aggregated impact updated to 22,000+ residents and 35 MSMEs.
   - State: CLUSTERED (Stage 3).

        ↓

4. P1 PRIORITY SCORING
   - 5-Factor Weighted Rubric: Severity (25/25), Urgency (24/25), Population (23/25), Evidence (25/25), Vulnerability (23/25).
   - Composite Score: 94.05 / 100 -> P1 EMERGENCY.
   - State: PRIORITIZED (Stage 4).

        ↓

5. AUTOMATIC GOVERNMENT ROUTING
   - Routing: Road Construction Department (RCD) Jharkhand (Executive Engineer, Ranchi) + DDMA Ranchi.
   - SLAs: 4h Acknowledgement SLA met in 1h 12m; 24h Site Containment SLA met in 18h (barricades, lighting, pedestrian footbridge).
   - Human Validation: DC Ranchi executes digital signature to validate.
   - State: GOVT_VALIDATED (Stage 5).

        ↓

6. ACADEMIC / EXPERT MATCHING WITH BIT MESRA
   - 4-Factor HEI Match: Domain (Civil/Hydraulics, 98%), Proximity (18.2 km, 94%), Tier (NIRF Top / NAAC A+, 95%), Labs (UTM/HEC-RAS, 92%) = 95.3% Match (Rank #1 statewide).
   - Acceptance: HoD Civil Engineering accepts in 4h 45m.
   - Team Formed (DEMO-TEAM-BIT-042): Prof. Anand Prakash (Mentor) + 4 Civil/Water Resources scholars.
   - State: INSTITUTION_MATCHED -> INSTITUTION_ACCEPTED -> TEAM_FORMED (Stages 6-8).

        ↓

7. TECHNICAL ASSESSMENT & FIELD INVESTIGATION
   - Drone Photogrammetry: 3D DSM generated from DJI Matrice 300 RTK survey over 12.8 km² catchment.
   - HEC-RAS 2D Hydrology: 50-year peak discharge calculated at Q_peak = 42.6 m³/s. Original 1.8m pipe had 60.5% capacity deficit, causing 3.8 m/s overtopping velocity.
   - Geotechnical Testing: 3 SPT boreholes indicate soft micaceous sandy silt (SBC = 115 kN/m² at -2.5m) with active piping erosion.
   - State: PROPOSAL_SUBMITTED (Stage 9).

        ↓

8. DPR, CAD & COST ESTIMATION
   - Structural Solution: Twin-Cell Reinforced Cement Concrete (RCC) Box Culvert (2 cells x 4.5m clear span x 3.0m clear height, M35 concrete, Fe 500D TMT rebar, IRC:SP:13 & IRC:112 compliant).
   - Deliverables: Complete GAD drawings, bar bending schedules, and soil test logs.
   - Schedule of Rates (Jharkhand RCD SoR 2024-25) BoQ: Total capital cost = ₹39,05,000 (₹39.05 Lakhs).
   - Innovative Co-Funding: ₹29.05 Lakhs from State Disaster Mitigation Fund (SDMF) + ₹10.00 Lakhs CSR grant from Tupudana Industrial Estate Manufacturers Association (TIEMA).
   - Administrative Sanction: Technical Sanction and Administrative Approval granted within 72 hours.
   - State: PROPOSAL_ACCEPTED -> CSR_PARTNERED (Stages 9-10).

        ↓

9. RESOLUTION TRACKING, CONSTRUCTION & VERIFICATION
   - 5 Milestone Execution: Site containment & excavation (Day 4) -> Raft slab casting (Day 12) -> Walls/Deck casting (Day 22) -> Aprons/Approaches (Day 32) -> Testing (Day 38).
   - Quality Audit: Third-party UPV scan (4,410 m/s) + 2x 40t truck static proof load test (0.42mm deflection vs 5.625mm limit).
   - Citizen Loop: Before/after photos published to ledger; SMS/WhatsApp sent to all 14 citizens; 5/5 satisfaction rating.
   - Measured Impact: 14.5km detour eliminated (-35 mins commute), ₹14.8L/month logistics savings for MSMEs, 9-min emergency ambulance response restored.
   - Archival: Open-source DPR and HEC-RAS model archived in Nivaaran Provincial Knowledge Repository for all 24 districts.
   - Final State: RESOLVED -> IMPACT_MEASURED -> CLOSED_SUCCESS (Stages 14-16).
```

---

## 32.2 Canonical Scenario: Monsoon Waterlogging & School Disruption

The secondary demonstration scenario covers localized community waterlogging:

```text
CITIZEN
Reports recurring flooding near a village school
with photo + GPS + description.

        ↓

AI UNDERSTANDING
Identifies flood + education impact.

        ↓

DEDUPLICATION
Finds 7 similar submissions.

        ↓

VALIDATION
Government confirms the challenge.

        ↓

PRIORITIZATION
Challenge receives a high priority recommendation.

        ↓

MATCHING
AI recommends three universities.

        ↓

UNIVERSITY ACCEPTANCE
University A accepts.

        ↓

TEAM FORMATION
Civil + GIS + IoT + AI/ML students
with faculty mentor.

        ↓

PROPOSAL
Team proposes flood monitoring and alert system.

        ↓

INDUSTRY
Provides sensors + mentorship.

        ↓

PROTOTYPE
Prototype developed.

        ↓

PILOT
System deployed around the school.

        ↓

VALIDATION
Technical + community results reviewed.

        ↓

DEPLOYMENT
Solution approved for wider implementation.

        ↓

IMPACT
People benefited and disruption reduction measured.

        ↓

CLOSURE
Final report + lessons + reusable assets stored.

        ↓

CITIZEN
Receives outcome update and provides feedback.
```

The supporting project material uses essentially this flood/school scenario as the recommended flagship demonstration.

---

# 33. Workflow Invariants

The following principles should remain true regardless of implementation details.

### Invariant 1

A citizen submission must remain traceable to its original submitter and evidence.

### Invariant 2

AI recommendations must not silently overwrite human decisions.

### Invariant 3

A challenge should not jump arbitrary lifecycle stages.

### Invariant 4

Only authorized actors can cause consequential transitions.

### Invariant 5

Declined university matches must not permanently terminate a valid challenge unless an authorized workflow decision says so.

### Invariant 6

Clustering must not destroy source submissions.

### Invariant 7

Project progress must remain connected to its originating challenge.

### Invariant 8

Impact measurements must remain connected to the project/intervention that generated them.

### Invariant 9

Public visibility must never expose private information accidentally.

### Invariant 10

Temporary technical failures must not corrupt the business lifecycle.

---

# 34. Workflow Dependencies

The lifecycle creates a dependency chain:

```text
Challenge
   ↓
AI Understanding
   ↓
Validation
   ↓
Priority
   ↓
Matching
   ↓
Acceptance
   ↓
Project
   ↓
Team
   ↓
Proposal
   ↓
Collaboration
   ↓
Prototype
   ↓
Pilot
   ↓
Deployment
   ↓
Impact
```

Each stage should consume structured outputs from earlier stages.

This is why the challenge is the central object of the system.

---

# 35. Workflow and Modules

The lifecycle should eventually map to application modules:

```text
Submission
    → Challenge Module

AI Understanding
    → AI Module

Validation
    → Review Module

Deduplication
    → Similarity / Cluster Module

Prioritization
    → Priority Module

Matching
    → Matching Module

Acceptance
    → University Module

Team Formation
    → Team Module

Proposal
    → Proposal Module

Collaboration
    → Partner Module

Prototype / Pilot
    → Project Module

Impact
    → Impact Module

Communication
    → Notification Module

Audit
    → Audit Module
```

The detailed technical architecture should later map these business modules onto frontend, backend and data-layer components.

---

# 36. What Is Defined vs What Is Still Open

This document defines the **business workflow concept**.

The following are deliberately still open:

```text
Exact workflow transition rules
Exact rejection states
Exact role permissions per transition
Whether one challenge can create multiple projects
Whether projects can merge
Exact validation rules
Exact AI confidence thresholds
Exact priority formula
Exact matching formula
Exact similarity thresholds
Exact notification channels
Exact escalation timings
Exact approval hierarchy
```

These should be decided before final implementation architecture.

---

# 37. Relationship to Other Documents

This document sits between requirements and architecture.

```text
PROBLEM STATEMENT
       ↓
REQUIREMENTS.md
       ↓
ACTORS_AND_ROLES.md
       ↓
COMPLETE_WORKFLOW.md
       ↓
SYSTEM_ARCHITECTURE.md
       ↓
DATABASE DESIGN
       ↓
API CONTRACTS
       ↓
FRONTEND / BACKEND IMPLEMENTATION
```

The workflow therefore acts as the bridge between **what Nivaaran must do** and **how the software will eventually implement it**.

---

# 38. Final Workflow Mental Model

The entire system should be understood as one continuing journey:

```text
                     SOCIETAL NEED
                          │
                          ▼
                      CHALLENGE
                          │
                          ▼
                    AI UNDERSTANDS
                          │
                          ▼
                       HUMAN
                     VALIDATION
                          │
                          ▼
                   SIMILARITY / CLUSTER
                          │
                          ▼
                     PRIORITIZATION
                          │
                          ▼
                 CAPABILITY MATCHING
                          │
                          ▼
                    UNIVERSITY
                    ACCEPTANCE
                          │
                          ▼
                 MULTIDISCIPLINARY
                      TEAM
                          │
                          ▼
                     PROPOSAL
                          │
                          ▼
              INDUSTRY / CSR / LABS
                          │
                          ▼
                     PROTOTYPE
                          │
                          ▼
                        PILOT
                          │
                          ▼
                     VALIDATION
                          │
                          ▼
                     DEPLOYMENT
                          │
                          ▼
                  IMPACT MEASUREMENT
                          │
                          ▼
                CLOSURE + LEARNING
                          │
                          ▼
                KNOWLEDGE FOR FUTURE
                    CHALLENGES
```

The objective is not merely to move records between statuses.

The objective is to create a reliable chain:

> **community demand → structured knowledge → accountable decision → capable institution → collaborative project → tested solution → real-world deployment → measurable impact.**

That chain is the central workflow of Nivaaran.
