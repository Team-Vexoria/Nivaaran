# Nivaaran — System Architecture

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** System Architecture
**Status:** Foundational Architecture — Initial Design

---

# 1. Purpose

This document defines the high-level technical architecture of Nivaaran.

It translates the product requirements, actor model and workflow into a software architecture that can eventually be implemented by the development team.

This document intentionally focuses on:

* system boundaries
* major components
* responsibilities
* data flow
* service boundaries
* external integrations
* security boundaries
* AI boundaries
* GIS boundaries
* communication patterns
* scalability principles

It does **not** permanently lock every implementation technology.

Technology decisions should be finalized separately after evaluating the requirements against practical implementation constraints.

---

# 2. Architecture Objective

The architecture must support the central Nivaaran lifecycle:

```text
COMMUNITY PROBLEM
        ↓
SUBMISSION
        ↓
AI UNDERSTANDING
        ↓
VALIDATION
        ↓
DEDUPLICATION
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
COLLABORATION
        ↓
PROTOTYPE
        ↓
PILOT
        ↓
VALIDATION
        ↓
DEPLOYMENT
        ↓
IMPACT
        ↓
CLOSURE
```

The system must therefore be designed around the **challenge and its lifecycle**, rather than around isolated pages.

---

# 3. Core Architectural Principle

The central architectural object is the **Challenge**.

A challenge should be traceable throughout its entire journey:

```text
Challenge
   │
   ├── Evidence
   ├── AI Analysis
   ├── Validation
   ├── Similarity / Cluster
   ├── Priority
   ├── Institution Matches
   ├── Project
   │      ├── Team
   │      ├── Proposal
   │      ├── Milestones
   │      ├── Collaborations
   │      ├── Prototype
   │      ├── Pilot
   │      └── Impact
   │
   ├── Notifications
   └── Audit History
```

The supporting documentation explicitly describes the platform as a single Challenge ID moving through an ecosystem.

---

# 4. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       USERS         │
                         │                     │
                         │ Citizens            │
                         │ Government          │
                         │ Universities        │
                         │ Faculty / Students  │
                         │ Industry / CSR      │
                         │ Labs / NGOs          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   CLIENT LAYER      │
                         │                     │
                         │ Web Application     │
                         │ Mobile-responsive   │
                         │ Public Experience   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ APPLICATION LAYER   │
                         │                     │
                         │ API                 │
                         │ Authentication      │
                         │ Authorization       │
                         │ Validation          │
                         │ Business Workflow  │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
      │  CHALLENGE   │      │   PROJECT    │      │COLLABORATION │
      │   DOMAIN     │      │   DOMAIN     │      │   DOMAIN     │
      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   ▼
                         ┌─────────────────────┐
                         │      AI LAYER       │
                         │                     │
                         │ Understanding       │
                         │ Classification      │
                         │ Similarity          │
                         │ Priority             │
                         │ Matching             │
                         │ Recommendations      │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
             ┌────────────┐  ┌────────────┐  ┌────────────┐
             │ DATA LAYER │  │    GIS     │  │   FILE     │
             │            │  │   LAYER    │  │  STORAGE   │
             │ Database   │  │            │  │            │
             │ Audit      │  │ Geospatial │  │ Evidence   │
             │ Analytics  │  │ Data       │  │ Documents  │
             └────────────┘  └────────────┘  └────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ ANALYTICS / IMPACT  │
                         │                     │
                         │ Government          │
                         │ Dashboards          │
                         │ Impact              │
                         │ Reporting           │
                         └─────────────────────┘
```

---

# 5. Architectural Layers

Nivaaran should be organized into logical layers.

## 5.1 Presentation Layer

Responsible for interaction with users.

Responsibilities:

* user interface
* forms
* dashboards
* maps
* project workspaces
* timelines
* notifications
* AI result visualization
* accessibility
* responsive behavior
* role-based navigation

The system should support both public and authenticated experiences.

---

## 5.2 Application Layer

The application layer coordinates user requests and business operations.

Responsibilities:

* request handling
* authentication
* authorization
* input validation
* business rules
* workflow transitions
* orchestration of services
* transaction boundaries
* error handling

This layer should not depend on frontend-specific behavior.

---

## 5.3 Domain / Business Layer

This is where Nivaaran's actual business concepts live.

Primary domains:

```text
Challenges
AI Intelligence
Validation
Similarity / Clustering
Priority
Institution Matching
Universities
Teams
Projects
Proposals
Milestones
Industry Collaboration
Pilot
Deployment
Impact
Notifications
Audit
Analytics
```

The domain layer should represent the platform's rules rather than merely exposing database CRUD operations.

---

## 5.4 Data Layer

Responsible for persistent information.

Potential data categories include:

```text
Users
Organizations
Challenges
Evidence references
Categories
Universities
Departments
Faculty
Students
Skills
Projects
Teams
Proposals
Milestones
Partners
Collaborations
Notifications
Messages
Impact metrics
Reviews
Audit events
```

The technical specification proposes a MongoDB data model with these general entities, but the final database technology and schema remain architectural decisions rather than fixed requirements.

---

# 6. Core Domain Modules

The backend should ultimately be divided by business capability rather than by arbitrary technical file grouping.

---

## 6.1 Challenge Module

Responsible for:

* challenge creation
* challenge retrieval
* challenge editing
* challenge evidence association
* challenge status
* challenge search
* filtering
* challenge history

Core concept:

```text
Challenge
├── Description
├── Location
├── Evidence
├── Category
├── AI analysis
├── Priority
├── Cluster
├── Matches
├── Project
└── Lifecycle
```

---

## 6.2 AI Intelligence Module

Responsible for AI-assisted:

* summarization
* classification
* entity extraction
* priority recommendations
* semantic similarity
* university matching
* team recommendations
* solution ideation
* impact estimation

The technical specification identifies these as the major AI capabilities.

AI should be treated as a service capability rather than allowing arbitrary AI calls throughout the application.

---

## 6.3 Validation Module

Responsible for:

* review queue
* challenge review
* validation decisions
* clarification requests
* rejection where supported
* reviewer notes
* validation history

---

## 6.4 Similarity / Clustering Module

Responsible for:

* embedding generation
* similarity search
* candidate duplicates
* clustering
* cluster membership
* cluster review

Important rule:

> Clustering creates relationships between submissions; it does not erase the underlying submissions.

---

## 6.5 Priority Module

Responsible for:

* priority calculation
* priority factors
* recommendation explanation
* human adjustment
* priority history

The exact scoring formula remains a later decision.

---

## 6.6 Institution Matching Module

Responsible for:

* challenge capability requirements
* institution capability representation
* candidate selection
* match scoring
* explanation generation
* match ranking
* acceptance workflow

The result should be explainable.

---

## 6.7 University Module

Responsible for:

* university profile
* departments
* faculty
* facilities
* innovation centres
* student skills
* participation

---

## 6.8 Team Module

Responsible for:

* team creation
* team members
* roles
* skills
* faculty mentors
* team lifecycle

---

## 6.9 Project Module

Responsible for:

* project creation
* proposal
* milestones
* deliverables
* progress
* prototype
* pilot
* deployment
* closure

---

## 6.10 Collaboration Module

Responsible for:

* collaboration opportunities
* partner discovery
* project needs
* collaboration requests
* acceptance
* mentorship
* funding
* technology
* testing
* deployment support

The supporting specification describes the industry component as a collaboration marketplace.

---

## 6.11 Impact Module

Responsible for:

* impact definitions
* KPI collection
* before/after values
* beneficiaries
* evidence
* impact verification
* impact reporting

---

## 6.12 Notification Module

Responsible for:

* in-app notifications
* lifecycle updates
* milestone reminders
* escalation
* partner notifications
* relevant external notifications

---

## 6.13 Audit Module

Responsible for recording important system actions.

Examples:

```text
challenge created
challenge validated
priority changed
university accepted
proposal approved
milestone updated
collaboration accepted
deployment approved
impact verified
```

It should also capture important AI recommendation → human decision relationships.

---

# 7. Authentication and Authorization Boundary

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

The architecture should keep these concepts separate.

```text
Request
  ↓
Authentication
  ↓
Identity
  ↓
Role
  ↓
Organization
  ↓
Resource Ownership
  ↓
Workflow State
  ↓
Authorization Decision
  ↓
Business Operation
```

The supporting specification requires role-based access and least privilege on APIs and UI actions.

---

# 8. Organization-Aware Access

A user's permissions should not necessarily depend only on their role.

A better conceptual model is:

```text
User
 +
Role
 +
Organization
 +
Geographic scope
 +
Resource ownership
 +
Workflow state
```

Example:

```text
Faculty
University A
Department of Civil Engineering
Mentor on Project 42
```

This user should receive project-level privileges related to Project 42, not control over every project in Nivaaran.

---

# 9. Challenge-Centric Data Flow

The primary data flow should be:

```text
USER
 ↓
CREATE CHALLENGE
 ↓
STORE CHALLENGE
 ↓
AI ANALYSIS
 ↓
STRUCTURED CHALLENGE
 ↓
VALIDATION
 ↓
SIMILARITY
 ↓
PRIORITY
 ↓
MATCHING
 ↓
UNIVERSITY DECISION
 ↓
PROJECT
 ↓
TEAM
 ↓
COLLABORATION
 ↓
PROTOTYPE
 ↓
PILOT
 ↓
DEPLOYMENT
 ↓
IMPACT
```

Each stage should enrich the challenge/project ecosystem rather than replacing previous information.

---

# 10. AI Architecture Boundary

AI should not directly control critical business state.

The preferred architecture is:

```text
Business Request
      ↓
AI Service
      ↓
AI Recommendation
      ↓
Validation / Confidence
      ↓
Human Decision where required
      ↓
Business Service
      ↓
Database State Change
```

For example:

```text
Government asks for priority analysis
        ↓
Priority Engine
        ↓
Recommended score + factors
        ↓
Government reviews
        ↓
Approved priority
        ↓
Challenge updated
```

Not:

```text
LLM
 ↓
direct database update
```

---

# 11. AI Service Architecture

The AI subsystem should eventually be decomposed into capabilities.

```text
                    AI SERVICE
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   UNDERSTANDING    SIMILARITY       RECOMMENDATION
        │               │                │
   ┌────┼────┐          │         ┌──────┼──────┐
   ▼    ▼    ▼          ▼         ▼      ▼      ▼
Summary Classify Entity  Embed    Priority Match Team
```

Each AI operation should receive structured input and return structured output.

---

# 12. AI Output Contract

Conceptually, an AI operation should look like:

```text
INPUT
{
  challengeId,
  description,
  location,
  existingMetadata
}

PROCESSING
{
  model/provider
  prompt
  retrieval/context
  inference
}

OUTPUT
{
  result,
  confidence,
  reasons,
  modelMetadata
}
```

The exact provider/model should be decided later.

---

# 13. Semantic Search Architecture

Semantic deduplication may eventually use:

```text
Challenge description
        ↓
Text preprocessing
        ↓
Embedding generation
        ↓
Vector representation
        ↓
Similarity search
        ↓
Candidate challenges
        ↓
Similarity threshold
        ↓
Cluster recommendation
        ↓
Human review where needed
```

The exact embedding model, vector store and threshold are not yet final architectural decisions.

---

# 14. University Matching Architecture

University matching should ideally work as a hybrid system.

```text
Challenge
   ↓
Extract requirements
   ↓
Normalize skills / disciplines
   ↓
Candidate institutions
   ↓
Capability filtering
   ↓
Semantic similarity
   ↓
Structured compatibility factors
   ↓
Ranked institutions
   ↓
Explainable reasons
```

Potential factors:

```text
Academic expertise
Faculty expertise
Research area
Laboratory/facility
Past projects
Student skills
Geographic/service capacity
Availability
```

The technical specification explicitly identifies expertise, facilities, past performance and availability as relevant matching dimensions.

---

# 15. GIS Architecture

GIS should be treated as a first-class subsystem.

```text
Challenge
   ↓
Location
   ↓
Geospatial storage
   ↓
Geospatial queries
   ↓
Map visualization
   ↓
Filtering / clustering / heatmap
   ↓
Regional analytics
```

Potential capabilities:

* point locations
* district boundaries
* block boundaries
* village/city information
* challenge clusters
* heatmaps
* disaster layers
* location filtering
* spatial relationships

The project documentation explicitly identifies interactive maps, district/block filters, heatmaps, geographic clustering, disaster layers and district-level impact visualization.

---

# 16. File and Evidence Architecture

Evidence is a separate concern from the main database.

Conceptually:

```text
User
 ↓
Upload
 ↓
File Validation
 ↓
Secure Object Storage
 ↓
Metadata stored with Challenge
```

The database should store appropriate metadata and references rather than unnecessarily storing large media blobs directly.

Evidence may include:

```text
Photographs
Videos
Documents
Reports
Pilot evidence
Prototype evidence
Deployment evidence
Impact evidence
```

---

# 17. Notification Architecture

Notifications should be event-driven conceptually.

```text
Business Event
      ↓
Event / Notification Service
      ↓
Determine recipients
      ↓
Determine channel
      ↓
Create notification
      ↓
Deliver
```

Example:

```text
Milestone overdue
      ↓
Notification event
      ↓
Faculty + Project Lead + relevant coordinator
      ↓
In-app notification
```

Potential channels:

```text
In-app
Email
SMS
Push
```

The exact external providers remain implementation decisions.

---

# 18. Analytics Architecture

Analytics should not require every dashboard to independently calculate business metrics.

A conceptual model:

```text
Core Data
    ↓
Validated Domain Events / Aggregations
    ↓
Analytics Layer
    ↓
Dashboards
```

This allows:

```text
Government Dashboard
University Dashboard
Industry Dashboard
Public Impact View
```

to consume consistent definitions of metrics.

---

# 19. Impact Architecture

Impact should be linked to interventions.

```text
Challenge
   ↓
Project
   ↓
Intervention
   ↓
Pilot / Deployment
   ↓
Impact Metrics
   ↓
Evidence
   ↓
Verification
```

Example:

```text
Problem:
School access disrupted by flooding

Intervention:
Flood monitoring system

Metric:
Days of disruption

Before:
18

After:
6

Verified outcome:
Reduction in disruption
```

The numbers above are an illustrative example rather than a project target.

---

# 20. Workflow Engine

The lifecycle should be represented as controlled business state.

Conceptually:

```text
Challenge
   ↓
Current State
   ↓
Requested Transition
   ↓
Authorization Check
   ↓
Transition Rules
   ↓
Validation
   ↓
State Change
   ↓
Audit Event
   ↓
Notifications
```

Example:

```text
VALIDATED
    ↓
requestMatch()
    ↓
authorization
    ↓
matching allowed
    ↓
MATCHING
    ↓
audit
    ↓
notification
```

A frontend should never be trusted to enforce workflow rules by itself.

The backend remains authoritative.

---

# 21. API Boundary

The frontend should communicate through defined APIs rather than directly accessing the database or AI provider.

```text
Frontend
   ↓
API
   ↓
Application Services
   ↓
Domain Services
   ↓
Data / External Services
```

Example:

```text
POST /challenges
        ↓
Challenge Service
        ↓
Database

POST /challenges/:id/analyze
        ↓
AI Service
        ↓
AI Provider
        ↓
Structured result
        ↓
Challenge Service
        ↓
Database
```

The exact endpoint naming will be finalized later.

---

# 22. External Services Boundary

External providers should remain isolated behind application interfaces.

Potential external dependencies include:

```text
AI / LLM Provider
Embedding Provider
Maps / Geocoding
Object Storage
Email
SMS
Push Notifications
Authentication Provider
Monitoring
```

The domain logic should not become tightly coupled to a single vendor.

For example:

```text
UniversityMatchingService
        ↓
AI / Ranking Interface
        ↓
Provider A
or
Provider B
```

This makes model/provider replacement possible.

---

# 23. Frontend Architecture Boundary

The frontend should mirror business domains rather than backend file structure.

Conceptually:

```text
src/
├── app/
├── routes/
├── layouts/
├── components/
├── features/
│   ├── challenges/
│   ├── ai/
│   ├── matching/
│   ├── universities/
│   ├── projects/
│   ├── collaboration/
│   ├── gis/
│   ├── impact/
│   └── analytics/
├── services/
├── state/
├── hooks/
├── types/
└── utils/
```

This is an architectural direction, not yet the final folder structure.

---

# 24. Role-Based Frontend Shells

The frontend should provide role-appropriate navigation.

Conceptually:

```text
Application
   │
   ├── Public Shell
   ├── Citizen Shell
   ├── Government Shell
   ├── University Shell
   ├── Industry Shell
   └── Admin Shell
```

Each shell should use shared components where appropriate.

Role-based visibility is a UX feature, but it must never replace backend authorization.

---

# 25. State Management

Frontend state should distinguish:

### Server State

Data originating from backend APIs.

Examples:

* challenges
* projects
* notifications
* matches

### UI State

Local presentation state.

Examples:

* modal open/closed
* selected filter
* sidebar state

### Session State

Examples:

* authenticated user
* role
* organization
* token/session information

The final state-management technology remains open.

---

# 26. Data Consistency Principles

The system should preserve consistency between related entities.

For example:

```text
Challenge
  ↓
Project
```

The project should remain traceable to its originating challenge.

Similarly:

```text
Project
  ↓
Impact
```

Impact should not become an unrelated standalone record.

---

# 27. Asynchronous Processing

Some operations may be too slow or expensive to perform synchronously.

Potential asynchronous operations include:

```text
AI analysis
Embedding generation
Large-file processing
Similarity search
Bulk notifications
Analytics aggregation
Report generation
```

Conceptually:

```text
User Request
    ↓
Create Job
    ↓
Return / Continue
    ↓
Worker
    ↓
Process
    ↓
Persist Result
    ↓
Notify User
```

The exact queue technology is a later implementation decision.

---

# 28. Failure Isolation

External service failure should not destroy core business data.

Examples:

### AI provider unavailable

```text
Challenge remains stored
        ↓
AI analysis pending/failed
        ↓
Retry
```

### Notification provider unavailable

```text
Business state changes successfully
        ↓
Notification retry
```

### Map service unavailable

```text
Challenge data remains available
        ↓
Map layer temporarily unavailable
```

This separation is important for reliability.

---

# 29. Security Architecture

Security should exist across every layer.

```text
CLIENT
 ↓
HTTPS
 ↓
AUTHENTICATION
 ↓
AUTHORIZATION
 ↓
INPUT VALIDATION
 ↓
BUSINESS LOGIC
 ↓
DATA ACCESS
 ↓
AUDIT
```

Important controls include:

* authentication
* RBAC
* least privilege
* secure token/session handling
* password hashing
* private evidence protection
* file validation
* rate limiting
* moderation
* audit logging
* secure secrets
* backups

These controls are reflected in the technical specification.

---

# 30. Public vs Private Architecture

The system should distinguish public and authenticated data paths.

```text
                 NIVAARAN DATA
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          PUBLIC              PRIVATE
             │                   │
       Public challenges    Citizen data
       Public status        Internal notes
       Public impact        Private evidence
       Public projects      Confidential data
```

Public APIs should expose only intentionally public fields.

---

# 31. Government Analytics Flow

```text
Challenge Data
      +
Project Data
      +
Institution Data
      +
Industry Data
      +
Impact Data
      ↓
Analytics Layer
      ↓
Government Dashboard
      │
      ├── Challenge Volume
      ├── Geography
      ├── Domains
      ├── Institutions
      ├── Industry
      ├── Projects
      ├── Innovation
      ├── Impact
      └── Efficiency
```

The supporting specification identifies these dashboard areas and metrics.

---

# 32. Architecture for the Flagship Demo

The architecture must be capable of supporting the complete demo without requiring disconnected fake pages.

```text
Citizen
  ↓
Challenge API
  ↓
Challenge DB
  ↓
AI Analysis
  ↓
Similarity
  ↓
Validation
  ↓
Priority
  ↓
University Matching
  ↓
University Acceptance
  ↓
Project Creation
  ↓
Team
  ↓
Industry Collaboration
  ↓
Milestones
  ↓
Pilot
  ↓
Impact
  ↓
Government Analytics
  ↓
Citizen Update
```

The supporting documentation explicitly identifies this flood/school/village flow as the flagship demonstration.

---

# 33. Demo Data vs Production Data

The architecture should support realistic demonstrations without making fake data a production dependency.

Preferred approach:

```text
Production
    ↓
Real API
    ↓
Real database
    ↓
Real workflows

Demo Seed
    ↓
Controlled seed scripts
    ↓
Same APIs
    ↓
Same workflows
```

The technical specification explicitly distinguishes real structured production data from isolated seed data for demonstrations.

---

# 34. Scalability Principles

The initial system should be simple enough for rapid development while maintaining a path to scale.

Potential future evolution:

```text
INITIAL
Single backend
Managed DB
External AI
Object storage
      ↓
GROWING
Multiple API instances
Caching
Background workers
Analytics processing
      ↓
STATEWIDE
Load balancing
Database scaling
CDN
Queues
More advanced analytics
```

The technical specification proposes horizontal API scaling, database indexing/tiering, CDN use, background workers and feature flags as future scaling mechanisms.

---

# 35. Observability

The system should eventually provide visibility into its own health.

Important observability categories:

```text
Application errors
API latency
AI failures
Database errors
Upload failures
Notification failures
Workflow errors
Authentication failures
```

Important business monitoring:

```text
Challenges submitted
AI processing failures
Validation delays
Matching failures
Stalled projects
Overdue milestones
```

Technical monitoring and business monitoring should be treated separately.

---

# 36. Architecture Decision Boundaries

The following are currently **open decisions**:

### Frontend

* exact component library
* state-management approach
* form library
* caching strategy

### Backend

* Express vs NestJS or another framework
* modular monolith vs more distributed architecture
* background job technology

### Database

* MongoDB vs relational alternative
* exact schema
* indexing strategy
* geospatial implementation

### AI

* LLM provider
* model selection
* embedding model
* vector database/search technology
* AI orchestration framework
* threshold strategy

### GIS

* OpenStreetMap/Leaflet vs Mapbox or another provider
* geocoding provider
* boundary datasets
* disaster-data integrations

### Infrastructure

* hosting providers
* object storage
* monitoring
* notification providers

These should be decided deliberately rather than inherited automatically from the supporting technical specification.

---

# 37. Architecture Principles That Are Already Stable

Although implementation technologies remain open, the following architectural principles should be considered stable:

1. **Challenge-centric architecture**
2. **Lifecycle-driven workflow**
3. **Human oversight of consequential AI decisions**
4. **Explainable AI recommendations**
5. **Role-aware and resource-aware authorization**
6. **Privacy separation between public and private data**
7. **Evidence preservation**
8. **Modular business domains**
9. **GIS as a first-class capability**
10. **Impact as a first-class data domain**
11. **External providers isolated behind service boundaries**
12. **Production data separated from demo seeding**
13. **Backend as the authoritative source for critical state transitions**

---

# 38. Architecture Anti-Patterns to Avoid

## Anti-pattern 1 — Frontend controls workflow

Do not trust:

```text
frontend sends status = DEPLOYMENT
```

The backend must verify whether that transition is authorized.

---

## Anti-pattern 2 — AI directly changes critical state

Avoid:

```text
LLM
 ↓
Database
```

Prefer:

```text
LLM
 ↓
Recommendation
 ↓
Business logic
 ↓
Human approval where required
 ↓
Database
```

---

## Anti-pattern 3 — Database-only architecture

Do not allow the frontend to become tightly coupled to the database structure.

---

## Anti-pattern 4 — Provider lock-in

Do not scatter calls to one AI/map/storage provider across the entire codebase.

---

## Anti-pattern 5 — Giant generic backend service

Avoid one enormous service containing every domain.

Prefer clear business boundaries.

---

## Anti-pattern 6 — Separate fake demo application

The demo should use the same product architecture.

Do not create a completely disconnected hard-coded demo UI.

---

# 39. Architectural Traceability

Every major requirement should map through the architecture.

Example:

```text
PS Requirement:
Route challenges to suitable universities

        ↓

Requirement:
REQ-MATCH-001

        ↓

Domain:
Institution Matching

        ↓

Data:
Challenge requirements
University capabilities

        ↓

Service:
Matching Service

        ↓

AI:
Recommendation engine

        ↓

API:
Matching endpoint

        ↓

Frontend:
University recommendation screen

        ↓

Workflow:
Matching → University Acceptance

        ↓

Test:
Correct institutions rank appropriately
```

This pattern should be repeated for important requirements.

---

# 40. Recommended Initial Architecture Style

At the current development stage, a **modular monolithic application** is the preferred conceptual direction.

That means:

```text
One deployable backend
        │
        ├── Challenge Module
        ├── AI Module
        ├── Validation Module
        ├── Matching Module
        ├── University Module
        ├── Project Module
        ├── Collaboration Module
        ├── Impact Module
        ├── Notification Module
        └── Audit Module
```

This avoids premature microservice complexity while preserving domain boundaries.

The architecture can later extract individual services if scale or organizational requirements justify it.

---

# 41. Why Modular Monolith First

The platform has many conceptual domains, but a hackathon implementation does not need many separately deployed services.

A modular monolith provides:

* simpler local development
* simpler deployment
* easier debugging
* lower infrastructure complexity
* faster feature integration
* clear future extraction boundaries

The goal is:

> **Modularity without unnecessary distributed-system complexity.**

---

# 42. Initial Deployment Shape

A practical first deployment can conceptually be:

```text
                    Internet
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Web Frontend         Backend API
             │                   │
             │          ┌────────┼────────┐
             │          ▼        ▼        ▼
             │        DB       AI      Storage
             │                   │
             │                External
             │                Providers
             │
             └───────────────┐
                             ▼
                         GIS / Maps
```

The supporting technical specification proposes a low-cost cloud deployment approach using managed frontend/backend/database infrastructure, but those providers remain implementation choices.

---

# 43. Future Architecture Evolution

The architecture should support progression from:

### Stage 1

```text
Web
+
API
+
Managed DB
+
External AI
```

to:

### Stage 2

```text
Web + Mobile
+
API Cluster
+
Background Workers
+
Advanced GIS
+
AI Pipeline
```

to:

### Stage 3

```text
Statewide Platform
+
Advanced Analytics
+
Predictive Systems
+
External Government Data
+
Innovation Repository
```

The supporting roadmap identifies mobile/multilingual expansion, stronger GIS, industry marketplace functionality, predictive disaster analytics, external data integration and statewide knowledge exchange as later phases.

---

# 44. Final Architecture Mental Model

Nivaaran should ultimately be understood as:

```text
                         USERS
                           │
                           ▼
                  PRESENTATION LAYER
                           │
                           ▼
                AUTH + API + APPLICATION
                           │
                           ▼
                    BUSINESS DOMAINS
                           │
       ┌───────────────────┼────────────────────┐
       ▼                   ▼                    ▼
   CHALLENGE             PROJECT           COLLABORATION
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ▼
                       AI LAYER
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       NLP/LLM        SIMILARITY         MATCHING
                           │
                           ▼
                     DATA + GIS
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
          DATA           FILES         GEO DATA
            │              │              │
            └──────────────┼──────────────┘
                           ▼
                     ANALYTICS
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          GOVERNMENT             PUBLIC
          DASHBOARD              IMPACT
```

The critical point is that all these components revolve around **one connected business lifecycle**, not around independent applications.

---

# 45. Final Architectural Principle

Nivaaran should be architected as a system in which:

> **Users create and participate in challenges; the application manages the lifecycle; AI provides structured intelligence and recommendations; humans retain consequential decision authority; universities and partners execute projects; GIS provides spatial intelligence; and the data layer preserves the complete journey through measurable impact.**

The architecture should make that journey technically traceable from:

```text
Challenge
    ↓
Decision
    ↓
Capability
    ↓
Project
    ↓
Intervention
    ↓
Outcome
```

Every significant feature added to Nivaaran should be evaluated against this chain.

If a feature cannot be meaningfully connected to the problem-to-impact lifecycle, it should not automatically become part of the core platform.

---

# 46. Relationship to Future Architecture Documents

This document provides the high-level system view.

The next architectural documents should progressively zoom into individual areas:

```text
SYSTEM_ARCHITECTURE.md
        │
        ├── FRONTEND_ARCHITECTURE.md
        ├── BACKEND_ARCHITECTURE.md
        ├── DATABASE_DESIGN.md
        ├── AI_ARCHITECTURE.md
        ├── GIS_ARCHITECTURE.md
        ├── API_CONTRACTS.md
        └── SECURITY_ARCHITECTURE.md
```

Those documents should refine this architecture rather than contradict its core principles.

---

# 47. Architecture Status

**Current status:** High-level architecture defined.

**Stable:**

* challenge-centric model
* lifecycle-driven architecture
* modular business domains
* AI as assistive capability
* human oversight
* GIS as first-class capability
* impact as first-class capability
* role/resource-aware authorization
* evidence preservation
* provider isolation

**Not yet finalized:**

* exact technologies
* exact framework choices
* database implementation
* AI provider/models
* embedding/vector infrastructure
* GIS provider
* deployment infrastructure
* exact API contracts
* exact database schema

These decisions should be documented as they become approved.

---

# 48. Final Architecture Objective

The final system should allow this single chain to work reliably:

```text
                    COMMUNITY
                       │
                       ▼
                  REAL PROBLEM
                       │
                       ▼
                   CHALLENGE
                       │
                       ▼
                AI UNDERSTANDING
                       │
                       ▼
                   VALIDATION
                       │
                       ▼
                PRIORITIZATION
                       │
                       ▼
             CAPABILITY MATCHING
                       │
                       ▼
                  UNIVERSITY
                       │
                       ▼
                     TEAM
                       │
                       ▼
                   PROJECT
                       │
                       ▼
               INDUSTRY / CSR
                       │
                       ▼
                  PROTOTYPE
                       │
                       ▼
                     PILOT
                       │
                       ▼
                  DEPLOYMENT
                       │
                       ▼
                    IMPACT
                       │
                       ▼
                   CITIZEN
```

The purpose of the architecture is to make that chain **possible, secure, explainable, maintainable and scalable**.
