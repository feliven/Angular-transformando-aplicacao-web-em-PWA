export interface TaskItem {
  uuid: string;
  description: string;
  isActive: boolean;
}

export interface EncryptedTaskItem {
  uuid: string;
  encryptedData: string;
}

export interface INotificationMessage {
  title: string;
  body: string;
}
