import Header from "../components/Header";
import buildClient from "../api/build-client";

import "bootstrap/dist/css/bootstrap.css";

// Wraps around all the components
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

// getInitialProps is executed on first load, full reload, typing URL on address bar
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/current-user");

  let pageProps = {};

  // Force trigger getInitialProps of the index.js page. (A custom one here disallows the index.js one)
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser,
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
