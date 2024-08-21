import request from "supertest";

import { app } from "../../app";

it("Responds with details about the current user", async () => {
  // Use the signin available in the test environment
  const cookie = await global.signin();

  if (cookie) {
    const response = await request(app)
      .get("/api/users/current-user")
      .set("Cookie", cookie)
      .send()
      .expect(200);

    expect(response.body.currentUser.email).toEqual("test@test.com");
  } else {
    expect("Cookie wasn't set").toEqual("Cookie wasn't set");
  }

});

it("Responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(undefined);
});
