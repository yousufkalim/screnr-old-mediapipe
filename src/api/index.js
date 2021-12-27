// Init
import axios from "axios";
import { toast } from "react-toastify";

const api = async (method = "get", uri, body) => {
  // API Call
  const url = process.env.REACT_APP_SERVER_URL + uri;
  const token = localStorage.getItem("token");
  axios.defaults.headers = {
    Authorization: `Bearer ${token}`,
  };
  return new Promise((resolve, reject) => {
    axios[method](url, body)
      .then((res) => resolve(res))
      .catch((err) => {
        if (err?.response?.status === 403) {
          window.location = "/home";
        } else {
          console.log("API Error --------> ", err.response?.data?.message);
          toast.error(
            err?.message ||
              err.response.data.message.msg ||
              err?.message.data.message
          );

          reject(err);
        }
      });
  });
};

// Export
export default api;
