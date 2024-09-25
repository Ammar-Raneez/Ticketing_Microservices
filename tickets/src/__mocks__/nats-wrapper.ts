// Create a mocked natsWrapper similar in structure to the actual one
export const natsWrapper = {
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    }
  }
};
