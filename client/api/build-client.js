import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "http://nginx-gateway.nginx-gateway.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseUrl: "/",
    });
  }
};

/*
 * As ingress lives in a different namespace, the following is required.
 * {nginx-service-name}.{nginx-namespace}.svc.cluster.local/{route}.
 * On server, within the nextJS pod, it will try to navigate to localhost/api/users/current-user within the pod itself.
 * As there isn't anything like that, this won't work; hence, the domain must be specified.
 * If executed from client, the browser will be able to handle navigation correctly, as the correct domain will be injected
 */
