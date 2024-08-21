import axios from "axios";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

// Fetch data on initial load on server side. Executed on client on in-app navigation
LandingPage.getInitialProps = async (context) => {
  try {
    let baseURL = "/";
    if (typeof window === "undefined") {
      baseURL =
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user";
      const { data } = await axios.get(baseURL, {
        headers: { ...context.req.headers, Host: "ticketing.dev" },
      });

      return data
    } else {
      const { data } = await axios.get(baseURL);
      return data;
    }
  } catch (err) {
    console.log(err.message);
    return {};
  }
};

export default LandingPage;
