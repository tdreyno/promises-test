import { Result, User, NotificationsAPI } from "./LoaderUtils";
import { flatten } from "lodash";

export default function Loader(
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
