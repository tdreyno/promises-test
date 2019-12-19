import Loader from "../Loader";
import { User, NotificationsAPI } from "../LoaderUtils";

describe("The code test", () => {
  test("Make sure it works", async () => {
    const user = User.random(true);
    const notifications = NotificationsAPI.random();

    const result = await Loader(user, notifications);

    expect(result.projectNames.sort()).toMatchObject(
      user.__projectNamesDontCheat().sort()
    );

    expect(result.notifications.sort()).toMatchObject(
      notifications.__notificationsDontCheat().sort()
    );
  });
});
