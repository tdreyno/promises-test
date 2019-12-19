import { Result, User, NotificationsAPI, randomResolve } from "./LoaderUtils";

export default function Loader(
  user: User,
  notificationsApi: NotificationsAPI
): Promise<Result> {
  // Available APIs
  // user.getFriends();
  // user.getProjects();
  // notificationsApi.getMessages();

  return Promise.resolve({
    projectNames: [],
    notifications: []
  });
}
