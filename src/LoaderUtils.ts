import * as faker from "faker";
import { flatten } from "lodash";

export type Result = {
  projectNames: string[];
  notifications: string[];
};

export function randomResolve<T>(value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), Math.round(Math.random() * 1000));
  });
}

export class NotificationsAPI {
  constructor(private messages: string[]) {}

  getMessages(): Promise<string[]> {
    return randomResolve(this.messages);
  }

  __notificationsDontCheat() {
    return this.messages;
  }

  static random() {
    const numNotifications = 2 + Math.round(Math.random() * 2);

    return new NotificationsAPI(
      Array(numNotifications)
        .fill(undefined)
        .map(() => faker.lorem.sentence())
    );
  }
}

export class User {
  constructor(
    public name: string,
    private projects: Project[],
    private friends: User[]
  ) {}

  getProjects(): Promise<Project[]> {
    return randomResolve(this.projects);
  }

  getFriends(): Promise<User[]> {
    return randomResolve(this.friends);
  }

  __projectNamesDontCheat(): string[] {
    return flatten(this.friends.map(f => f.projects))
      .concat(this.projects)
      .map(p => p.name);
  }

  static random(hasFriends: boolean): User {
    const numProjects = 2 + Math.round(Math.random() * 2);
    const numFriends = hasFriends ? 2 + Math.round(Math.random() * 2) : 0;

    return new User(
      faker.name.firstName(),
      Array(numProjects)
        .fill(undefined)
        .map(() => Project.random()),
      numFriends > 0
        ? Array(numProjects)
            .fill(numFriends)
            .map(() => User.random(false))
        : []
    );
  }
}

export class Project {
  constructor(public name: string) {}

  static random() {
    return new Project(faker.commerce.productName());
  }
}
