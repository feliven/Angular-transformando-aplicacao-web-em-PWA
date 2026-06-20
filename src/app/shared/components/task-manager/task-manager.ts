import { Component, inject, signal, type AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, type FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import type { TaskItem } from './ITaskItem';
import { TaskList } from './task-list/task-list';
import { IndexedDBService } from '../../services/indexed-db.service';

@Component({
  selector: 'app-task-manager',
  imports: [ReactiveFormsModule, TaskList],
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.scss',
})
export class TaskManager implements AfterViewInit {
  taskForm: FormGroup;
  hasShowForm = signal(false);

  tasks = signal<TaskItem[]>([]);
  taskItemSelected = signal<TaskItem | null>(null);
  private fb = inject(FormBuilder);
  private indexedDBService = inject(IndexedDBService);

  constructor() {
    this.taskForm = this.fb.group({
      description: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.indexedDBService.listAllTasks().subscribe((tasks) => {
      this.tasks.set(tasks);
    });
  }

  onAddTaskClick(): void {
    this.hasShowForm.set(true);
    this.taskForm.reset();
  }

  onTaskListClick(taskItem: TaskItem): void {
    const mapTasks = this.tasks().map((task: TaskItem) => ({
      ...task,
      isActive: task.uuid === taskItem.uuid ? true : false,
    }));

    this.tasks.set(mapTasks);

    this.taskItemSelected.set(taskItem);
  }

  onSaveTask(): void {
    const { description } = this.taskForm.value;

    const taskItem = {
      uuid: uuidv4(),
      description: description,
      isActive: false,
    };

    this.tasks.update((tasks) => {
      return [...tasks, taskItem];
    });

    this.indexedDBService.addTask(taskItem).subscribe();

    this.hasShowForm.set(false);
  }

  onCleanTasksClick(): void {
    this.tasks.set([]);
    this.taskItemSelected.set(null);
  }

  onCancelBtnClick(): void {
    this.hasShowForm.set(false);
  }
}
