import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

// Fetch data on initial load
LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  try {
    const { data } = await client.get("/api/users/current-user");
    return data;
  } catch (err) {
    console.log(err.message);
    return {};
  };
};

export default LandingPage;
