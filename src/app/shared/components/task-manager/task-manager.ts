import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, type FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import type { TaskItem } from './ITaskItem';
import { TaskList } from './task-list/task-list';

@Component({
  selector: 'app-task-manager',
  imports: [ReactiveFormsModule, TaskList],
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.scss',
})
export class TaskManager {
  taskForm: FormGroup;
  hasShowForm = false;

  tasks: TaskItem[] = [];
  taskItemSelected: TaskItem | null = null;
  private fb = inject(FormBuilder);

  constructor() {
    this.taskForm = this.fb.group({
      description: ['', Validators.required],
    });
  }

  onAddTaskClick(): void {
    this.hasShowForm = true;
    this.taskForm.reset();
  }

  onTaskListClick(taskItem: TaskItem): void {
    this.tasks = this.tasks.map((task: TaskItem) => ({
      ...task,
      isActive: task.uuid === taskItem.uuid ? true : false,
    }));

    this.taskItemSelected = taskItem;
  }

  onSaveTask(): void {
    const { description } = this.taskForm.value;

    const taskItem = {
      uuid: uuidv4(),
      description: description,
      isActive: false,
    };

    this.tasks.push(taskItem);

    this.hasShowForm = false;
  }

  onCleanTasksClick(): void {
    this.tasks = [];
    this.taskItemSelected = null;
  }

  onCancelBtnClick(): void {
    this.hasShowForm = false;
  }
}
