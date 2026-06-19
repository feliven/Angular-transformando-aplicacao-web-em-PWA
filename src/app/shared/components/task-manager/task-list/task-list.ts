import { Component, input, output } from '@angular/core';
import type { TaskItem } from '../ITaskItem';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-task-list',
  imports: [NgClass],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  taskItem = input<TaskItem>({
    description: '',
    isActive: false,
    uuid: '',
  });

  onTaskClick = output<TaskItem>();

  onTaskListClick(taskItem: TaskItem): void {
    this.taskItem().isActive = !this.taskItem().isActive;
    this.onTaskClick.emit(taskItem);
  }
}
