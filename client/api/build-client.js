import axios from "axios";

const BuildClient = ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "",
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseUrl: "/",
    });
  }
};

export default BuildClient;
