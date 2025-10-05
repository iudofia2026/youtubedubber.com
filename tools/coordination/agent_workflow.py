#!/usr/bin/env python3
"""
Agent Workflow Manager
Defines workflows and protocols for multi-agent collaboration.
"""

import json
import os
from typing import Dict, List, Any
from agent_coordinator import AgentCoordinator, AgentRole, TaskStatus

class AgentWorkflow:
    def __init__(self, coordinator: AgentCoordinator):
        self.coordinator = coordinator
        self.workflows = self._load_workflows()

    def _load_workflows(self) -> Dict[str, Any]:
        """Load predefined workflows."""
        return {
            "web_app_development": {
                "name": "Web Application Development",
                "phases": [
                    {
                        "name": "Planning & Research",
                        "agents": [AgentRole.PROJECT_MANAGER, AgentRole.RESEARCHER],
                        "tasks": [
                            "Define project requirements",
                            "Research technology stack",
                            "Create project timeline",
                            "Identify potential challenges"
                        ]
                    },
                    {
                        "name": "Design & Architecture",
                        "agents": [AgentRole.DESIGNER, AgentRole.PROJECT_MANAGER],
                        "tasks": [
                            "Create wireframes and mockups",
                            "Design system architecture",
                            "Define user experience flow",
                            "Create design system"
                        ]
                    },
                    {
                        "name": "Development",
                        "agents": [AgentRole.DEVELOPER, AgentRole.PROJECT_MANAGER],
                        "tasks": [
                            "Set up development environment",
                            "Implement core features",
                            "Write unit tests",
                            "Code review and optimization"
                        ]
                    },
                    {
                        "name": "Testing & Deployment",
                        "agents": [AgentRole.DEVELOPER, AgentRole.PROJECT_MANAGER],
                        "tasks": [
                            "Integration testing",
                            "User acceptance testing",
                            "Deploy to production",
                            "Monitor and maintain"
                        ]
                    }
                ]
            },
            "data_analysis_project": {
                "name": "Data Analysis Project",
                "phases": [
                    {
                        "name": "Data Collection & Research",
                        "agents": [AgentRole.RESEARCHER, AgentRole.PROJECT_MANAGER],
                        "tasks": [
                            "Define analysis objectives",
                            "Identify data sources",
                            "Research analysis methods",
                            "Plan data collection strategy"
                        ]
                    },
                    {
                        "name": "Data Processing",
                        "agents": [AgentRole.DEVELOPER, AgentRole.RESEARCHER],
                        "tasks": [
                            "Clean and preprocess data",
                            "Implement analysis algorithms",
                            "Create data visualizations",
                            "Validate results"
                        ]
                    },
                    {
                        "name": "Reporting & Presentation",
                        "agents": [AgentRole.DESIGNER, AgentRole.PROJECT_MANAGER],
                        "tasks": [
                            "Create analysis reports",
                            "Design presentation materials",
                            "Prepare executive summary",
                            "Document findings and recommendations"
                        ]
                    }
                ]
            }
        }

    def start_workflow(self, workflow_name: str, project_name: str) -> List[str]:
        """Start a predefined workflow and create initial tasks."""
        if workflow_name not in self.workflows:
            raise ValueError(f"Workflow '{workflow_name}' not found")
        
        workflow = self.workflows[workflow_name]
        created_tasks = []
        
        print(f"Starting workflow: {workflow['name']}")
        print(f"Project: {project_name}")
        
        for phase in workflow["phases"]:
            print(f"\n--- Phase: {phase['name']} ---")
            print(f"Agents: {', '.join([agent.value for agent in phase['agents']])}")
            
            for i, task_description in enumerate(phase["tasks"]):
                # Assign task to the first agent in the phase (can be improved)
                assigned_agent = phase["agents"][0]
                priority = 5 - i  # Higher priority for earlier tasks
                
                task_id = self.coordinator.create_task(
                    title=f"{phase['name']}: {task_description}",
                    description=f"Project: {project_name}\nPhase: {phase['name']}\nTask: {task_description}",
                    assigned_agent=assigned_agent,
                    priority=priority
                )
                created_tasks.append(task_id)
                print(f"  Created task {task_id}: {task_description}")
        
        return created_tasks

    def create_agent_handoff_protocol(self, from_agent: AgentRole, to_agent: AgentRole, 
                                    task_id: str, context: Dict[str, Any]):
        """Create a structured handoff between agents."""
        handoff_notes = f"""
## Context
{json.dumps(context, indent=2)}

## Handoff Instructions
1. Review the task requirements and context
2. Check for any dependencies or blockers
3. Update task status when you begin working
4. Document your progress and any issues
5. Create deliverables as specified

## Communication
- Use the shared workspace for file collaboration
- Update task status regularly
- Ask questions through the coordination system
"""
        
        self.coordinator.create_project_handoff(
            from_agent, to_agent, task_id, handoff_notes
        )

    def get_agent_workload(self, agent_role: AgentRole) -> Dict[str, Any]:
        """Get current workload and status for an agent."""
        tasks = self.coordinator.get_agent_tasks(agent_role)
        ready_tasks = self.coordinator.get_ready_tasks(agent_role)
        
        return {
            "agent": agent_role.value,
            "total_tasks": len(tasks),
            "ready_tasks": len(ready_tasks),
            "in_progress": len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS]),
            "completed": len([t for t in tasks if t.status == TaskStatus.COMPLETED]),
            "next_tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "priority": task.priority,
                    "dependencies": task.dependencies
                }
                for task in ready_tasks[:3]  # Show next 3 tasks
            ]
        }

    def suggest_collaboration(self, task_id: str) -> List[AgentRole]:
        """Suggest which agents should collaborate on a task."""
        if task_id not in self.coordinator.tasks:
            return []
        
        task = self.coordinator.tasks[task_id]
        suggestions = []
        
        # Basic collaboration suggestions based on task content
        task_lower = task.title.lower() + " " + task.description.lower()
        
        if any(word in task_lower for word in ["design", "ui", "ux", "mockup", "wireframe"]):
            suggestions.append(AgentRole.DESIGNER)
        
        if any(word in task_lower for word in ["code", "implement", "develop", "program", "debug"]):
            suggestions.append(AgentRole.DEVELOPER)
        
        if any(word in task_lower for word in ["research", "analyze", "investigate", "study"]):
            suggestions.append(AgentRole.RESEARCHER)
        
        if any(word in task_lower for word in ["plan", "manage", "coordinate", "review"]):
            suggestions.append(AgentRole.PROJECT_MANAGER)
        
        return list(set(suggestions))  # Remove duplicates

if __name__ == "__main__":
    # Example usage
    coordinator = AgentCoordinator("/Users/iudofia/Desktop/multi-agent-project")
    workflow = AgentWorkflow(coordinator)
    
    # Start a web app development workflow
    task_ids = workflow.start_workflow("web_app_development", "My Awesome Web App")
    
    print(f"\nCreated {len(task_ids)} tasks for the project")
    print(f"Project status: {coordinator.get_project_status()}")
    
    # Show workload for each agent
    for role in AgentRole:
        workload = workflow.get_agent_workload(role)
        print(f"\n{role.value} workload: {workload}")