import { Result, User, NotificationsAPI } from "./LoaderUtils";
import { flatten } from "lodash";
import { Task } from "@tdreyno/pretty-please";

function Loader(
  user: User,
  notificationsApi: NotificationsAPI
): Promise<Result> {
  return Promise.all([
    notificationsApi.getMessages(),

    Promise.all([
      user.getProjects(),

      user
        .getFriends()
        .then(friends =>
          Promise.all(friends.map(friend => friend.getProjects())).then(flatten)
        )
    ]).then(([myProjects, friendsProjects]) =>
      myProjects.concat(friendsProjects).map(project => project.name)
    )
  ]).then(([notifications, projectNames]) => ({
    projectNames,
    notifications
  }));
}

export default function LoaderTask(
  user: User,
  notificationsApi: NotificationsAPI
): Promise<Result> {
  return Task.map3(
    notifications => myProjects => friendsProjects => ({
      notifications,

      projectNames: myProjects
        .concat(friendsProjects)
        .map(project => project.name)
    }),

    notificationsApi.getMessages(),

    user.getProjects(),

    Task.fromLazyPromise(() => user.getFriends())
      .map(friends => friends.map(friend => friend.getProjects()))
      .chain(Task.all)
      .map(flatten)
  ).toPromise();
}
