import axios from "axios";

import Header from "../components/Header";

import "bootstrap/dist/css/bootstrap.css";

// Wraps around all the components
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // Trigger getInitialProps of the landing page. (A custom one here disallows the other from executing)
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  try {
    let baseURL = "/";
    if (typeof window === "undefined") {
      baseURL =
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user";
      const { data } = await axios.get(baseURL, {
        headers: { ...appContext.ctx.req.headers, Host: "ticketing.dev" },
      });

      return {
        pageProps,
        ...data,
      };
    } else {
      const { data } = await axios.get(baseURL);
      return { pageProps, ...data };
    }
  } catch (err) {
    console.log(err.message);
    return {
      pageProps,
    };
  }
};

export default AppComponent;
