#!/usr/bin/env python3
"""
Multi-Agent Coordinator
Manages communication and task distribution between different AI agents.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class AgentRole(Enum):
    PROJECT_MANAGER = "project-manager"
    DEVELOPER = "developer"
    RESEARCHER = "researcher"
    DESIGNER = "designer"

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    REVIEW = "review"

@dataclass
class Task:
    id: str
    title: str
    description: str
    assigned_agent: AgentRole
    status: TaskStatus
    priority: int  # 1-5, 5 being highest
    dependencies: List[str]  # Task IDs this depends on
    created_at: str
    updated_at: str
    deliverables: List[str]  # Files or outputs expected

@dataclass
class AgentStatus:
    role: AgentRole
    current_task: Optional[str]
    status: str
    last_activity: str
    capabilities: List[str]

class AgentCoordinator:
    def __init__(self, project_root: str):
        self.project_root = project_root
        self.tasks_file = os.path.join(project_root, "shared", "tasks", "tasks.json")
        self.status_file = os.path.join(project_root, "shared", "tasks", "agent_status.json")
        self.tasks: Dict[str, Task] = {}
        self.agent_status: Dict[AgentRole, AgentStatus] = {}
        self.load_data()

    def load_data(self):
        """Load existing tasks and agent status from files."""
        # Load tasks
        if os.path.exists(self.tasks_file) and os.path.getsize(self.tasks_file) > 0:
            try:
                with open(self.tasks_file, 'r') as f:
                    tasks_data = json.load(f)
                    for task_id, task_data in tasks_data.items():
                        task_data['assigned_agent'] = AgentRole(task_data['assigned_agent'])
                        task_data['status'] = TaskStatus(task_data['status'])
                        self.tasks[task_id] = Task(**task_data)
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                print(f"Warning: Could not load tasks file: {e}")
        
        # Load agent status
        if os.path.exists(self.status_file) and os.path.getsize(self.status_file) > 0:
            try:
                with open(self.status_file, 'r') as f:
                    status_data = json.load(f)
                    for role_str, status_data in status_data.items():
                        role = AgentRole(role_str)
                        status_data['role'] = AgentRole(status_data['role'])
                        self.agent_status[role] = AgentStatus(**status_data)
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                print(f"Warning: Could not load agent status file: {e}")

    def save_data(self):
        """Save current state to files."""
        # Save tasks
        os.makedirs(os.path.dirname(self.tasks_file), exist_ok=True)
        with open(self.tasks_file, 'w') as f:
            tasks_dict = {}
            for task_id, task in self.tasks.items():
                task_data = asdict(task)
                task_data['assigned_agent'] = task.assigned_agent.value
                task_data['status'] = task.status.value
                tasks_dict[task_id] = task_data
            json.dump(tasks_dict, f, indent=2)
        
        # Save agent status
        with open(self.status_file, 'w') as f:
            status_dict = {}
            for role, status in self.agent_status.items():
                status_data = asdict(status)
                status_data['role'] = status.role.value
                status_dict[role.value] = status_data
            json.dump(status_dict, f, indent=2)

    def create_task(self, title: str, description: str, assigned_agent: AgentRole, 
                   priority: int = 3, dependencies: List[str] = None) -> str:
        """Create a new task and assign it to an agent."""
        task_id = f"task_{len(self.tasks) + 1:03d}"
        now = datetime.now().isoformat()
        
        task = Task(
            id=task_id,
            title=title,
            description=description,
            assigned_agent=assigned_agent,
            status=TaskStatus.PENDING,
            priority=priority,
            dependencies=dependencies or [],
            created_at=now,
            updated_at=now,
            deliverables=[]
        )
        
        self.tasks[task_id] = task
        self.save_data()
        return task_id

    def update_task_status(self, task_id: str, status: TaskStatus, deliverables: List[str] = None):
        """Update task status and deliverables."""
        if task_id in self.tasks:
            self.tasks[task_id].status = status
            self.tasks[task_id].updated_at = datetime.now().isoformat()
            if deliverables:
                self.tasks[task_id].deliverables.extend(deliverables)
            self.save_data()

    def get_agent_tasks(self, agent_role: AgentRole) -> List[Task]:
        """Get all tasks assigned to a specific agent."""
        return [task for task in self.tasks.values() if task.assigned_agent == agent_role]

    def get_ready_tasks(self, agent_role: AgentRole) -> List[Task]:
        """Get tasks that are ready to work on (dependencies completed)."""
        ready_tasks = []
        for task in self.get_agent_tasks(agent_role):
            if task.status == TaskStatus.PENDING:
                # Check if all dependencies are completed
                deps_completed = all(
                    dep_id in self.tasks and 
                    self.tasks[dep_id].status == TaskStatus.COMPLETED
                    for dep_id in task.dependencies
                )
                if deps_completed:
                    ready_tasks.append(task)
        return sorted(ready_tasks, key=lambda t: t.priority, reverse=True)

    def create_project_handoff(self, from_agent: AgentRole, to_agent: AgentRole, 
                              task_id: str, handoff_notes: str):
        """Create a handoff between agents for a specific task."""
        handoff_file = os.path.join(
            self.project_root, "shared", "tasks", 
            f"handoff_{from_agent.value}_to_{to_agent.value}_{task_id}.md"
        )
        
        handoff_content = f"""# Agent Handoff

**From:** {from_agent.value}  
**To:** {to_agent.value}  
**Task:** {task_id}  
**Date:** {datetime.now().isoformat()}

## Handoff Notes
{handoff_notes}

## Task Details
- **Title:** {self.tasks[task_id].title}
- **Description:** {self.tasks[task_id].description}
- **Status:** {self.tasks[task_id].status.value}
- **Deliverables:** {', '.join(self.tasks[task_id].deliverables) if self.tasks[task_id].deliverables else 'None'}

## Next Steps
Please review the task and update its status when you begin working on it.
"""
        
        with open(handoff_file, 'w') as f:
            f.write(handoff_content)

    def get_project_status(self) -> Dict:
        """Get overall project status summary."""
        total_tasks = len(self.tasks)
        completed_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.COMPLETED])
        in_progress_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.IN_PROGRESS])
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "completion_percentage": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            "agent_status": {role.value: asdict(status) for role, status in self.agent_status.items()}
        }

if __name__ == "__main__":
    # Example usage
    coordinator = AgentCoordinator("/Users/iudofia/Desktop/multi-agent-project")
    
    # Create some example tasks
    coordinator.create_task(
        "Design user interface mockups",
        "Create wireframes and mockups for the main application interface",
        AgentRole.DESIGNER,
        priority=4
    )
    
    coordinator.create_task(
        "Research best practices",
        "Research current best practices for the technology stack",
        AgentRole.RESEARCHER,
        priority=3
    )
    
    coordinator.create_task(
        "Implement core functionality",
        "Write the main application code based on designs and research",
        AgentRole.DEVELOPER,
        priority=5,
        dependencies=["task_001", "task_002"]  # Depends on design and research
    )
    
    print("Multi-agent project setup complete!")
    print(f"Project status: {coordinator.get_project_status()}")