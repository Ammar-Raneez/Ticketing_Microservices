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
  // getInitialProps is executed on first load, full reload, typing URL on address bar
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // Trigger getInitialProps of the landing page. (A custom one here disallows the other from executing)
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  try {
    let baseURL = "/";

    // Only on server execution.
    if (typeof window === "undefined") {
      // {nginx-service-name}.{nginx-namespace}.svc.cluster.local/{route}
      // On server, within the nextJS pod, it will try to navigate to localhost/api/users/current-user within the pod itself.
      // As there isn't anything like that, this won't work; hence, the domain must be specified.
      // As ingress lives in a different namespace, the following is required.
      baseURL =
        "http://nginx-gateway.nginx-gateway.svc.cluster.local/api/users/current-user";
      const { data } = await axios.get(baseURL, {
        headers: { ...appContext.ctx.req.headers, Host: "ticketing.dev" },
      });

      return {
        pageProps,
        ...data,
      };
    } else {
      // if executed from client, the browser will be able to handle navigation correctly, as the correct domain will be injected
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
