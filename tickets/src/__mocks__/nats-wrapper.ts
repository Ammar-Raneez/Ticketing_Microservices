// Create a mocked natsWrapper similar in structure to the actual one
export const natsWrapper = {
  client: {
    // Create a mock function which can be tested on (ex: has the function actually been called)
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        },
      ),
  },
};
