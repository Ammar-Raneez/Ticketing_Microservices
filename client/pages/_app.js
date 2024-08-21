import Header from "../components/Header";

import buildClient from "../api/build-client";

import "bootstrap/dist/css/bootstrap.css";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  try {
    const { data } = await client.get("/api/users/current-user");
    return {
      pageProps,
      ...data,
    };
  } catch (err) {
    console.log(err.message);
    return {
      pageProps,
    }
  }
};

export default AppComponent;
