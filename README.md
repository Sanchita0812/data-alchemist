# Data Alchemist

**Data Alchemist** is an AI-powered data validation and rule configuration platform for scheduling optimization. It enables users to upload structured Excel data for Clients, Workers, and Tasks, apply intelligent validation, define business rules via an intuitive UI, and generate exportable rule configurations.

---

## Features

### Data Upload & Validation
- Upload a unified `.xlsx` file containing **Clients**, **Workers**, and **Tasks** sheets.
- Inline and summary validation with clear error messages.
- Validates fields like `TaskID`, `RequiredSkills`, `PreferredPhases`, `MaxLoadPerPhase`, etc.

### Natural Language Filtering
- Search and filter entities (Clients, Workers, Tasks) using plain English.
- Powered by Groq API and LLMs for intelligent, contextual queries.

### Rule Builder UI
- Build complex business rules without writing code.
- Supported Rule Types:
  - `CoRun`: Specify TaskIDs that should run together.
  - `SlotRestriction`: Define groups of clients that require overlapping slots.
  - `LoadLimit`: Set worker group capacity limits per phase.
- Input fields with real-time validation.
- Stores rules in both local state and a global store.

### Rule Validation
- Automatically checks all rules against the current dataset.
- Highlights rule violations with detailed reasons.

### Rule Application
- Apply rules to the dataset and view pass/fail results.
- Each rule returns validation status and explanation.

### Data & Rule Visualizations (Future Prospect)
- Skill distribution bar chart.
- Task distribution across phases.
- Rule success/failure statistics.

### Export
- Export cleaned dataset (`.xlsx`) including all validated data sheets.
- Export rules configuration (`rules.json`) with all defined rules.

### Future Scope
- Data Visualisation Possibilities
- Better, Cleaner UI
---

## Tech Stack

| Area              | Tech Used                            |
|-------------------|--------------------------------------|
| Framework         | Next.js 14 (App Router, TypeScript)  |
| UI Library        | Tailwind CSS, Radix UI               |
| Forms & Grids     | Custom Editable Components           |
| LLM Integration   | Groq API (`llama3`, `mixtral`)       |
| Excel Parsing     | `xlsx` JavaScript library            |
| State Management  | Zustand (Global Store)               |



