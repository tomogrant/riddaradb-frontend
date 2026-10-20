export interface IUser {
  id: number | null;
  username: string;
  email: string;
  firstName: string;
  lastNames: string;
  password?: string;
}