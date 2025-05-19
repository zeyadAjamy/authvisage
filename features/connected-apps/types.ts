export interface ConnectedApp {
  id: string;
  name: string;
  image: string;
  connectedAt: Date;
  lastSignIn: Date | null;
}
